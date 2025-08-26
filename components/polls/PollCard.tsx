'use client';

import Link from 'next/link';
import { Poll } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const isExpired = poll.expiresAt && new Date() > poll.expiresAt;

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
              {!poll.isPublic && (
                <Badge variant="secondary" className="text-xs">
                  Private
                </Badge>
              )}
              {poll.allowMultipleVotes && (
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
            {poll.options.length} options • {totalVotes} votes
          </div>
          
          <div className="space-y-2">
            {poll.options.slice(0, 3).map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="truncate">{option.text}</span>
                    <span className="text-muted-foreground">{option.votes} votes</span>
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
            {poll.options.length > 3 && (
              <div className="text-sm text-muted-foreground">
                +{poll.options.length - 3} more options
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="text-xs text-muted-foreground">
              Created {new Date(poll.createdAt).toLocaleDateString()}
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
