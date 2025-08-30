'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreatePollData } from '@/lib/types/database';

export async function createPoll(formData: CreatePollData) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to create a poll');
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found. Please try logging out and back in.');
    }

    // Create the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public ?? true,
        allow_multiple_votes: formData.allow_multiple_votes ?? false,
        expires_at: formData.expires_at,
        created_by: profile.id
      })
      .select()
      .single();

    if (pollError) {
      throw new Error(`Failed to create poll: ${pollError.message}`);
    }

    // Create poll options
    const optionsData = formData.options.map((text, index) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_index: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      // Clean up the poll if options creation fails
      await supabase.from('polls').delete().eq('id', poll.id);
      throw new Error(`Failed to create poll options: ${optionsError.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/polls');
    
    return { success: true, pollId: poll.id, redirect: '/polls' };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create poll' 
    };
  }
}

export async function getPolls() {
  try {
    const supabase = await createClient();
    
    const { data: polls, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          text,
          order_index
        ),
        profiles!polls_created_by_fkey (
          name
        )
      `)
      .eq('is_public', true)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }

    // Ensure poll_options is always an array
    const pollsWithOptions = polls?.map(poll => ({
      ...poll,
      poll_options: poll.poll_options || []
    })) || [];

    return { polls: pollsWithOptions, error: null };
  } catch (error) {
    console.error('Error fetching polls:', error);
    return { 
      polls: [],
      error: error instanceof Error ? error.message : 'Failed to fetch polls'
    };
  }
}

export async function updatePoll(pollId: string, formData: CreatePollData) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to update a poll');
    }

    // Check if the poll belongs to the current user
    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollCheckError || !existingPoll) {
      throw new Error('Poll not found');
    }

    if (existingPoll.created_by !== user.id) {
      throw new Error('You can only update your own polls');
    }

    // Update the poll
    const { error: pollError } = await supabase
      .from('polls')
      .update({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public ?? true,
        allow_multiple_votes: formData.allow_multiple_votes ?? false,
        expires_at: formData.expires_at,
      })
      .eq('id', pollId);

    if (pollError) {
      throw new Error(`Failed to update poll: ${pollError.message}`);
    }

    // Delete existing options
    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    if (deleteOptionsError) {
      throw new Error(`Failed to delete existing options: ${deleteOptionsError.message}`);
    }

    // Create new poll options
    const optionsData = formData.options.map((text, index) => ({
      poll_id: pollId,
      text: text.trim(),
      order_index: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      throw new Error(`Failed to create poll options: ${optionsError.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/polls');
    
    return { success: true, pollId };
  } catch (error) {
    console.error('Error updating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update poll' 
    };
  }
}

export async function deletePoll(pollId: string) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to delete a poll');
    }

    // Check if the poll belongs to the current user
    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollCheckError || !existingPoll) {
      throw new Error('Poll not found');
    }

    if (existingPoll.created_by !== user.id) {
      throw new Error('You can only delete your own polls');
    }

    // Delete poll options first (due to foreign key constraint)
    const { error: optionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', pollId);

    if (optionsError) {
      throw new Error(`Failed to delete poll options: ${optionsError.message}`);
    }

    // Delete the poll
    const { error: pollError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (pollError) {
      throw new Error(`Failed to delete poll: ${pollError.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/polls');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete poll' 
    };
  }
}

export async function getPollById(pollId: string) {
  try {
    const supabase = await createClient();
    
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        *,
        poll_options (
          id,
          text,
          order_index
        )
      `)
      .eq('id', pollId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch poll: ${error.message}`);
    }

    return { success: true, poll };
  } catch (error) {
    console.error('Error fetching poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch poll',
      poll: null
    };
  }
}
