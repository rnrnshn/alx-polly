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
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { getPollResults } from '@/lib/actions/polls';

interface DashboardPollCardProps {
  poll: PollWithOptions;
  onPollDeleted: (pollId: string) => void;
}

interface PollResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

/**
 * Dashboard poll card component for displaying and managing individual polls.
 * 
 * This component provides a comprehensive interface for poll management within
 * the user dashboard. It displays poll information, status badges, and provides
 * actions for viewing, editing, sharing, and deleting polls.
 * 
 * Features:
 * - Poll information display (title, description, options preview)
 * - Status badges (public/private, multiple votes, expired, active)
 * - Action dropdown menu with poll management options
 * - Direct poll deletion with confirmation
 * - Share functionality with clipboard integration
 * - Navigation to poll view and edit pages
 * 
 * The component handles poll deletion through direct database calls and
 * notifies the parent component via callback for state synchronization.
 * 
 * @param poll - The poll data to display and manage
 * @param onPollDeleted - Callback function called when poll is deleted
 * @returns JSX element containing the poll card with management interface
 * 
 * @example
 * ```tsx
 * <DashboardPollCard 
 *   poll={userPoll} 
 *   onPollDeleted={(pollId) => removePollFromList(pollId)} 
 * />
 * ```
 */
export function DashboardPollCard({ poll, onPollDeleted }: DashboardPollCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  const router = useRouter();
  
  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const options = poll.poll_options || [];

  // Fetch poll results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const result = await getPollResults(poll.id);
        if (result.success && result.data) {
          setPollResults(result.data);
        }
      } catch (error) {
        console.error('Error fetching poll results:', error);
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchResults();
  }, [poll.id]);

  // Calculate total votes from results
  const totalVotes = pollResults.reduce((sum, result) => sum + Number(result.vote_count), 0);

  /**
   * Handles poll deletion with confirmation and proper cleanup.
   * 
   * Deletes poll options first due to foreign key constraints, then deletes
   * the poll itself. Provides user feedback and updates parent component state.
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this poll? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/polls/${poll.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete poll');
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

  /**
   * Navigates to the poll edit page.
   */
  const handleEdit = () => {
    router.push(`/polls/${poll.id}/edit`);
  };

  /**
   * Navigates to the poll view page.
   */
  const handleView = () => {
    router.push(`/polls/${poll.id}`);
  };

  /**
   * Copies the poll URL to clipboard for sharing.
   * Uses the Clipboard API for modern browsers.
   */
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
            {options.length} options • {totalVotes} votes • Created {new Date(poll.created_at).toLocaleDateString()}
          </div>
          
          <div className="space-y-2">
            {options.slice(0, 3).map((option) => {
              const result = pollResults.find(r => r.option_id === option.id);
              const voteCount = result ? Number(result.vote_count) : 0;
              
              return (
                <div key={option.id} className="flex justify-between text-sm">
                  <span className="truncate">{option.text}</span>
                  <span className="text-muted-foreground">
                    {isLoadingResults ? '...' : `${voteCount} vote${voteCount !== 1 ? 's' : ''}`}
                  </span>
                </div>
              );
            })}
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
