'use client';

import { CreatePollForm } from '@/components/polls/CreatePollForm';
import withAuth from '@/lib/hooks/withAuth';

function CreatePollPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create a New Poll</h1>
          <p className="text-muted-foreground">
            Design your poll and start gathering opinions from your audience
          </p>
        </div>
        
        <CreatePollForm />
      </div>
    </div>
  );
}

export default withAuth(CreatePollPage);
