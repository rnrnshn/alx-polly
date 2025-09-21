
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { CreatePollData } from '@/lib/types/database';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: `Failed to fetch poll: ${error.message}` }, { status: 500 });
    }

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, poll });
  } catch (error) {
    console.error('Error fetching poll:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch poll', poll: null }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to update a poll' }, { status: 401 });
    }

    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', id)
      .maybeSingle();

    if (pollCheckError) {
      return NextResponse.json({ error: `Failed to check poll: ${pollCheckError.message}` }, { status: 500 });
    }

    if (!existingPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (existingPoll.created_by !== user.id) {
      return NextResponse.json({ error: 'You can only update your own polls' }, { status: 403 });
    }

    const formData: CreatePollData = await req.json();

    const { error: pollError } = await supabase
      .from('polls')
      .update({
        title: formData.title,
        description: formData.description,
        is_public: formData.is_public ?? true,
        allow_multiple_votes: formData.allow_multiple_votes ?? false,
        expires_at: formData.expires_at,
      })
      .eq('id', id);

    if (pollError) {
      return NextResponse.json({ error: `Failed to update poll: ${pollError.message}` }, { status: 500 });
    }

    const { error: deleteOptionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', id);

    if (deleteOptionsError) {
      return NextResponse.json({ error: `Failed to delete existing options: ${deleteOptionsError.message}` }, { status: 500 });
    }

    const optionsData = formData.options.map((text, index) => ({
      poll_id: id,
      text: text.trim(),
      order_index: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      return NextResponse.json({ error: `Failed to create poll options: ${optionsError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, pollId: id });
  } catch (error) {
    console.error('Error updating poll:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to update poll' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to delete a poll' }, { status: 401 });
    }

    const { data: existingPoll, error: pollCheckError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', id)
      .maybeSingle();

    if (pollCheckError) {
      return NextResponse.json({ error: `Failed to check poll: ${pollCheckError.message}` }, { status: 500 });
    }

    if (!existingPoll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (existingPoll.created_by !== user.id) {
      return NextResponse.json({ error: 'You can only delete your own polls' }, { status: 403 });
    }

    const { error: optionsError } = await supabase
      .from('poll_options')
      .delete()
      .eq('poll_id', id);

    if (optionsError) {
      return NextResponse.json({ error: `Failed to delete poll options: ${optionsError.message}` }, { status: 500 });
    }

    const { error: pollError } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (pollError) {
      return NextResponse.json({ error: `Failed to delete poll: ${pollError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to delete poll' }, { status: 500 });
  }
}
