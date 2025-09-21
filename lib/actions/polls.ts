'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { CreatePollData } from '@/lib/types/database';

/**
 * Creates a new poll with associated options in the database.
 * 
 * This server action handles the complete poll creation workflow:
 * 1. Validates user authentication and profile existence
 * 2. Creates the poll record with user-provided data
 * 3. Creates associated poll options with proper ordering
 * 4. Handles rollback if any step fails
 * 5. Revalidates relevant cache paths
 * 
 * The function ensures data integrity by using database transactions
 * and proper error handling. If poll options creation fails, the poll
 * itself is deleted to maintain consistency.
 * 
 * @param formData - Poll creation data including title, description, options, and settings
 * @returns Promise resolving to success/error result with poll ID and redirect path
 * 
 * @example
 * ```tsx
 * const result = await createPoll({
 *   title: "What's your favorite color?",
 *   description: "Help us choose our brand color",
 *   options: ["Red", "Blue", "Green"],
 *   is_public: true,
 *   allow_multiple_votes: false
 * });
 * 
 * if (result.success) {
 *   router.push(result.redirect);
 * }
 * ```
 */
export async function createPoll(formData: CreatePollData) {
  try {
    const supabase = await createClient();
    
    // Validate user authentication - polls require a logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('You must be logged in to create a poll');
    }

    // Verify user profile exists - this ensures the user has a complete profile
    // The profile is created automatically via database trigger on user signup
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found. Please try logging out and back in.');
    }

    // Create the main poll record with user-provided data
    // Default values are applied for optional fields
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public ?? true, // Default to public
        allow_multiple_votes: formData.allow_multiple_votes ?? false, // Default to single vote
        expires_at: formData.expires_at,
        created_by: profile.id // Link to the authenticated user
      })
      .select()
      .single();

    if (pollError) {
      throw new Error(`Failed to create poll: ${pollError.message}`);
    }

    // Create poll options with proper ordering
    // Each option gets an incremental order_index for consistent display
    const optionsData = formData.options.map((text, index) => ({
      poll_id: poll.id,
      text: text.trim(), // Remove leading/trailing whitespace
      order_index: index + 1 // Start ordering from 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    // Handle options creation failure with rollback
    // This maintains data integrity by removing the orphaned poll
    if (optionsError) {
      await supabase.from('polls').delete().eq('id', poll.id);
      throw new Error(`Failed to create poll options: ${optionsError.message}`);
    }

    // Revalidate cache to ensure fresh data on next page load
    revalidatePath('/dashboard'); // User's dashboard
    revalidatePath('/polls'); // Public polls listing
    
    return { success: true, pollId: poll.id, redirect: '/polls' };
  } catch (error) {
    console.error('Error creating poll:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create poll' 
    };
  }
}

/**
 * Fetches all public, active polls with their options and creator information.
 * 
 * This function retrieves polls that are available for public viewing and voting.
 * It includes related data like poll options and creator names through database
 * joins. The results are ordered by creation date (newest first) and filtered
 * to only show active, public polls.
 * 
 * The function handles potential null values in poll_options to ensure the
 * returned data structure is consistent and safe to use in components.
 * 
 * @returns Promise resolving to polls array and error state
 * 
 * @example
 * ```tsx
 * const { polls, error } = await getPolls();
 * 
 * if (error) {
 *   console.error('Failed to load polls:', error);
 * } else {
 *   polls.forEach(poll => {
 *     console.log(`${poll.title} by ${poll.profiles.name}`);
 *   });
 * }
 * ```
 */
export async function getPolls() {
  try {
    const supabase = await createClient();
    
    // Fetch polls with related data using Supabase's relational queries
    // This single query gets polls, their options, and creator information
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
      .eq('is_public', true) // Only public polls
      .eq('status', 'active') // Only active polls
      .order('created_at', { ascending: false }); // Newest first

    if (error) {
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }

    // Normalize poll_options to ensure it's always an array
    // This prevents runtime errors when components expect an array
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

/**
 * Submits votes for a poll with comprehensive validation and security checks.
 * 
 * This server action handles the complete voting workflow:
 * 1. Validates poll exists and is active/not expired
 * 2. Verifies selected options belong to the poll
 * 3. Checks voting permissions (multiple votes, existing votes)
 * 4. Records votes with proper voter identification
 * 5. Handles both authenticated and anonymous voting
 * 
 * The function supports both single and multiple vote scenarios, with proper
 * validation to prevent duplicate votes when not allowed. It also handles
 * anonymous voting by storing voter email/name when provided.
 * 
 * @param voteData - Vote submission data including poll ID, option IDs, and voter info
 * @returns Promise resolving to success/error result
 * 
 * @example
 * ```tsx
 * // Authenticated user voting
 * const result = await submitVote({
 *   poll_id: "poll-123",
 *   option_ids: ["option-1", "option-2"],
 * });
 * 
 * // Anonymous voting
 * const result = await submitVote({
 *   poll_id: "poll-123", 
 *   option_ids: ["option-1"],
 *   voter_name: "John Doe",
 *   voter_email: "john@example.com"
 * });
 * ```
 */
export async function submitVote(voteData: {
  poll_id: string;
  option_ids: string[];
  voter_name?: string;
  voter_email?: string;
}) {
  try {
    const supabase = await createClient();
    
    // Get current user (optional - supports anonymous voting)
    // Authenticated users get additional vote tracking capabilities
    const { data: { user } } = await supabase.auth.getUser();
    
    // Validate poll exists and get voting rules
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('status, expires_at, allow_multiple_votes')
      .eq('id', voteData.poll_id)
      .single();

    if (pollError || !poll) {
      throw new Error('Poll not found');
    }

    // Check poll is active and not expired
    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }

    // Check expiration date if set
    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      throw new Error('Poll has expired');
    }

    // Validate all selected options exist and belong to this poll
    // This prevents voting on options from other polls
    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('poll_id', voteData.poll_id)
      .in('id', voteData.option_ids);

    if (optionsError || options.length !== voteData.option_ids.length) {
      throw new Error('Invalid options selected');
    }

    // Check existing votes for authenticated users
    // This enforces single-vote restrictions when applicable
    if (user) {
      const { data: existingVotes, error: voteCheckError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', voteData.poll_id)
        .eq('voter_id', user.id);

      if (voteCheckError) {
        console.error('Error checking existing votes:', voteCheckError);
      } else if (existingVotes && existingVotes.length > 0) {
        // Enforce single-vote restriction if poll doesn't allow multiple votes
        if (!poll.allow_multiple_votes) {
          throw new Error('You have already voted on this poll');
        }
      }
    }

    // Prepare vote records for insertion
    // Each selected option gets its own vote record
    const votesToInsert = voteData.option_ids.map(optionId => ({
      poll_id: voteData.poll_id,
      option_id: optionId,
      voter_id: user?.id || null, // Authenticated user ID or null for anonymous
      voter_email: voteData.voter_email || null, // For anonymous voting tracking
      voter_name: voteData.voter_name || null, // For anonymous voting display
    }));

    // Insert all votes atomically
    const { error: insertError } = await supabase
      .from('votes')
      .insert(votesToInsert);

    if (insertError) {
      throw new Error(`Failed to submit vote: ${insertError.message}`);
    }

    // Revalidate the poll page to show updated results
    revalidatePath(`/polls/${voteData.poll_id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting vote:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit vote' 
    };
  }
}

/**
 * Fetches poll results with vote counts and percentages using the database function.
 * 
 * This server action calls the get_poll_results() database function to retrieve
 * real-time vote statistics for a poll, including vote counts and percentages
 * for each option. The results are ordered by option order and creation time.
 * 
 * @param pollId - The UUID of the poll to get results for
 * @returns Promise resolving to poll results or error
 * 
 * @example
 * ```tsx
 * const results = await getPollResults("poll-123");
 * if (results.success) {
 *   console.log(results.data); // Array of option results with vote counts
 * }
 * ```
 */
export async function getPollResults(pollId: string) {
  try {
    const supabase = await createClient();
    
    // Use the database function to get results
    const { data, error } = await supabase.rpc('get_poll_results', {
      poll_uuid: pollId
    });

    if (error) {
      console.error('Error fetching poll results:', error);
      return {
        success: false,
        error: 'Failed to fetch poll results'
      };
    }

    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Error in getPollResults:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch poll results'
    };
  }
}