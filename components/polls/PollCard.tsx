'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { PollWithOptions } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPollResults } from '@/lib/actions/polls';

interface PollCardProps {
  poll: PollWithOptions;
}

interface PollResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

export function PollCard({ poll }: PollCardProps) {
  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);
  
  const isExpired = Boolean(poll.expires_at && new Date(poll.expires_at) < new Date());
  
  // Ensure poll_options is always an array
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

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
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
          <div className="flex flex-col items-end space-y-2">
            <div className="flex space-x-1">
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
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {options.length} options • {totalVotes} votes
          </div>
          
          <div className="space-y-2">
            {options.slice(0, 3).map((option) => {
              const result = pollResults.find(r => r.option_id === option.id);
              const voteCount = result ? Number(result.vote_count) : 0;
              const percentage = result ? Number(result.percentage) : 0;
              
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{option.text}</span>
                    <span className="text-muted-foreground">
                      {isLoadingResults ? '...' : `${voteCount} vote${voteCount !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
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
              Created {new Date(poll.created_at).toLocaleDateString()}
            </div>
            <Button size="sm" asChild>
              <Link href={`/polls/${poll.id}`}>
                {isExpired ? 'View Results' : 'Vote Now'}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
