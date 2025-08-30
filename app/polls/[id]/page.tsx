import { notFound } from 'next/navigation';
import { PollDetail } from '@/components/polls/PollDetail';
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

  const result = await getPollById(id);
  
  if (!result.success || !result.poll) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PollDetail poll={result.poll} />
    </div>
  );
}
