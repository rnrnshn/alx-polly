
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const voteData: { option_ids: string[]; voter_name?: string; voter_email?: string; } = await req.json();

    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('status, expires_at, allow_multiple_votes')
      .eq('id', id)
      .single();

    if (pollError || !poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (poll.status !== 'active') {
      return NextResponse.json({ error: 'Poll is not active' }, { status: 400 });
    }

    if (poll.expires_at && new Date(poll.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Poll has expired' }, { status: 400 });
    }

    const { data: options, error: optionsError } = await supabase
      .from('poll_options')
      .select('id')
      .eq('poll_id', id)
      .in('id', voteData.option_ids);

    if (optionsError || options.length !== voteData.option_ids.length) {
      return NextResponse.json({ error: 'Invalid options selected' }, { status: 400 });
    }

    if (user) {
      const { data: existingVotes, error: voteCheckError } = await supabase
        .from('votes')
        .select('id')
        .eq('poll_id', id)
        .eq('voter_id', user.id);

      if (voteCheckError) {
        console.error('Error checking existing votes:', voteCheckError);
      } else if (existingVotes && existingVotes.length > 0) {
        if (!poll.allow_multiple_votes) {
          return NextResponse.json({ error: 'You have already voted on this poll' }, { status: 400 });
        }
      }
    }

    const votesToInsert = voteData.option_ids.map(optionId => ({
      poll_id: id,
      option_id: optionId,
      voter_id: user?.id || null,
      voter_email: voteData.voter_email || null,
      voter_name: voteData.voter_name || null,
    }));

    const { error: insertError } = await supabase
      .from('votes')
      .insert(votesToInsert);

    if (insertError) {
      return NextResponse.json({ error: `Failed to submit vote: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to submit vote' }, { status: 500 });
  }
}
