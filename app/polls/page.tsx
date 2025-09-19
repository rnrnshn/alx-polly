import { PollCard } from '@/components/polls/PollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { PollWithOptions } from '@/lib/types/database';

async function getPolls() {
  const res = await fetch('/api/polls', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch polls');
  }
  const data = await res.json();
  return data.polls;
}

async function PollsPage() {
  let polls: PollWithOptions[] = [];
  let error: string | null = null;

  try {
    polls = await getPolls();
  } catch (e) {
    error = e instanceof Error ? e.message : 'An unknown error occurred';
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Polls</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Polls</h1>
            <p className="text-muted-foreground">
              Discover and participate in polls created by the community
            </p>
          </div>
          <Button asChild>
            <Link href="/polls/create">Create Poll</Link>
          </Button>
        </div>

        {/* Polls Grid */}
        {polls && polls.length > 0 ? (
          <div className="grid gap-6">
            {polls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                No polls available yet
              </p>
              <Button asChild>
                <Link href="/polls/create">Create the first poll</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default PollsPage;
