import { notFound } from 'next/navigation';
import { PollDetail } from '@/components/polls/PollDetail';
import { PollWithOptions } from '@/lib/types/database';
import { getPollById } from '@/lib/actions/polls';

interface PollDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  const { success, poll, error } = await getPollById(id);
  
  if (!success || !poll) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PollDetail poll={poll} />
    </div>
  );
}
