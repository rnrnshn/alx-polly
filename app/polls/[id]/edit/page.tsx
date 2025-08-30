import { EditPollForm } from '@/components/polls/EditPollForm';
import { notFound } from 'next/navigation';

interface EditPollPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPollPage({ params }: EditPollPageProps) {
  const { id } = await params;
  
  if (!id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Edit Poll</h1>
          <p className="text-muted-foreground">
            Update your poll details and options
          </p>
        </div>
        
        <EditPollForm pollId={id} />
      </div>
    </div>
  );
}
