'use client';

import Link from 'next/link';
import { PollWithOptions } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PollCardProps {
  poll: PollWithOptions;
}

export function PollCard({ poll }: PollCardProps) {
  // For now, we'll show 0 votes since we need to fetch vote counts separately
  const totalVotes = 0;
  const isExpired = poll.expires_at && new Date(poll.expires_at) > new Date();
  
  // Ensure poll_options is always an array
  const options = poll.poll_options || [];

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
              const percentage = 0; // We'll implement vote counting later
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{option.text}</span>
                    <span className="text-muted-foreground">0 votes</span>
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
