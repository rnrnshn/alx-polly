'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { PollWithOptions } from '@/lib/types/database';
import { DashboardPollCard } from '@/components/polls/DashboardPollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

function DashboardPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handlePollDeleted = (pollId: string) => {
    setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
  };

  useEffect(() => {
    const fetchUserPolls = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('polls')
          .select(`
            *,
            poll_options (
              id,
              text,
              order_index
            )
          `)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching polls:', error);
        } else {
          setPolls(data || []);
        }
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPolls();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {(user as any)?.user_metadata?.full_name || user?.email || 'User'}!</h1>
          <p className="text-muted-foreground">
            Here's an overview of your polls and recent activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{polls.length}</div>
              <p className="text-xs text-muted-foreground">
                Your created polls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {polls.reduce((sum, poll) => 
                  sum + (poll.poll_options?.length || 0), 0
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all your polls
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {polls.filter(poll => poll.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Polls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Recent Polls</h2>
            <Button asChild>
              <Link href="/polls/create">Create New Poll</Link>
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Loading your polls...</p>
              </CardContent>
            </Card>
          ) : polls.length > 0 ? (
            <div className="grid gap-6">
              {polls.map((poll) => (
                <DashboardPollCard 
                  key={poll.id} 
                  poll={poll} 
                  onPollDeleted={handlePollDeleted}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't created any polls yet
                </p>
                <Button asChild>
                  <Link href="/polls/create">Create your first poll</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
