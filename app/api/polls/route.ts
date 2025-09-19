
import { createClient } from '@/lib/supabase/server';
import { type NextRequest, NextResponse } from 'next/server';
import { CreatePollData } from '@/lib/types/database';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to create a poll' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found. Please try logging out and back in.' }, { status: 404 });
    }

    const formData: CreatePollData = await req.json();

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
      return NextResponse.json({ error: `Failed to create poll: ${pollError.message}` }, { status: 500 });
    }

    const optionsData = formData.options.map((text, index) => ({
      poll_id: poll.id,
      text: text.trim(),
      order_index: index + 1
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optionsError) {
      await supabase.from('polls').delete().eq('id', poll.id);
      return NextResponse.json({ error: `Failed to create poll options: ${optionsError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, pollId: poll.id, redirect: '/polls' });
  } catch (error) {
    console.error('Error creating poll:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to create poll' }, { status: 500 });
  }
}

export async function GET() {
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
      return NextResponse.json({ error: `Failed to fetch polls: ${error.message}` }, { status: 500 });
    }

    const pollsWithOptions = polls?.map(poll => ({
      ...poll,
      poll_options: poll.poll_options || []
    })) || [];

    return NextResponse.json({ polls: pollsWithOptions });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to fetch polls' }, { status: 500 });
  }
}
