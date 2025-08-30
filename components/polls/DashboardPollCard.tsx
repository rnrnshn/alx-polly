'use client';

import Link from 'next/link';
import { PollWithOptions } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit, Trash2, Eye, Share2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface DashboardPollCardProps {
  poll: PollWithOptions;
  onPollDeleted: (pollId: string) => void;
}

export function DashboardPollCard({ poll, onPollDeleted }: DashboardPollCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const options = poll.poll_options || [];

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const supabase = createClient();
      
      // Delete poll options first (due to foreign key constraint)
      const { error: optionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', poll.id);

      if (optionsError) {
        throw new Error('Failed to delete poll options');
      }

      // Delete the poll
      const { error: pollError } = await supabase
        .from('polls')
        .delete()
        .eq('id', poll.id);

      if (pollError) {
        throw new Error('Failed to delete poll');
      }

      toast.success('Poll deleted successfully');
      onPollDeleted(poll.id);
    } catch (error) {
      console.error('Error deleting poll:', error);
      toast.error('Failed to delete poll. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/polls/${poll.id}/edit`);
  };

  const handleView = () => {
    router.push(`/polls/${poll.id}`);
  };

  const handleShare = () => {
    const pollUrl = `${window.location.origin}/polls/${poll.id}`;
    navigator.clipboard.writeText(pollUrl);
    toast.success('Poll link copied to clipboard!');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">
              <Link href={`/polls/${poll.id}`} className="hover:text-primary">
                {poll.title}
              </Link>
            </CardTitle>
            {poll.description && (
              <CardDescription className="line-clamp-2">
                {poll.description}
              </CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                <Eye className="mr-2 h-4 w-4" />
                View Poll
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Poll
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete Poll'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!poll.is_public && (
            <Badge variant="secondary" className="text-xs">
              Private
            </Badge>
          )}
          {poll.allow_multiple_votes && (
            <Badge variant="outline" className="text-xs">
              Multiple votes
            </Badge>
          )}
          {isExpired && (
            <Badge variant="destructive" className="text-xs">
              Expired
            </Badge>
          )}
          <Badge variant={poll.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {poll.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {options.length} options • Created {new Date(poll.created_at).toLocaleDateString()}
          </div>
          
          <div className="space-y-2">
            {options.slice(0, 3).map((option) => (
              <div key={option.id} className="flex justify-between text-sm">
                <span className="truncate">{option.text}</span>
                <span className="text-muted-foreground">0 votes</span>
              </div>
            ))}
            {options.length > 3 && (
              <div className="text-sm text-muted-foreground">
                +{options.length - 3} more options
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-muted-foreground">
              {poll.expires_at ? `Expires ${new Date(poll.expires_at).toLocaleDateString()}` : 'No expiration'}
            </div>
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={handleView}>
                View
              </Button>
              <Button size="sm" variant="outline" onClick={handleEdit}>
                Edit
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
