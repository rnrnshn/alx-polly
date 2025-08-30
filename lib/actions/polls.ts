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
    
    return { success: true, pollId: poll.id };
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
