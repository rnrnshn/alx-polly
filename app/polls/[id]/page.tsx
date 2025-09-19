import { notFound } from 'next/navigation';
import { PollDetail } from '@/components/polls/PollDetail';
import { PollWithOptions } from '@/lib/types/database';

interface PollDetailPageProps {
  params: {
    id: string;
  };
}

async function getPoll(id: string): Promise<PollWithOptions | null> {
  try {
    const res = await fetch(`/api/polls/${id}`, { cache: 'no-store' });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    return data.poll;
  } catch (error) {
    return null;
  }
}

export default async function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }

  const poll = await getPoll(id);
  
  if (!poll) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <PollDetail poll={poll} />
    </div>
  );
}
