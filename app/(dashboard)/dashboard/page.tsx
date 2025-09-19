'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { PollWithOptions } from '@/lib/types/database';
import { DashboardPollCard } from '@/components/polls/DashboardPollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

/**
 * User dashboard page component displaying poll management interface.
 * 
 * This component provides a comprehensive overview of the user's poll activity:
 * - Welcome message with user information
 * - Statistics cards showing poll counts and metrics
 * - List of user's created polls with management actions
 * - Quick access to poll creation
 * 
 * The dashboard fetches user-specific polls on mount and provides real-time
 * updates when polls are deleted. It includes loading states and empty states
 * for better user experience.
 * 
 * Features:
 * - Real-time poll statistics calculation
 * - Poll management (view, edit, delete, share)
 * - Responsive grid layout for statistics
 * - Empty state with call-to-action for new users
 * 
 * @returns JSX element containing the user dashboard interface
 */
function DashboardPage() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Handles poll deletion by removing it from the local state.
   * This provides immediate UI feedback without requiring a full page refresh.
   */
  const handlePollDeleted = (pollId: string) => {
    setPolls(prevPolls => prevPolls.filter(poll => poll.id !== pollId));
  };

  /**
   * Effect to fetch user's polls when component mounts or user changes.
   * Only fetches when user is authenticated to prevent unnecessary API calls.
   */
  useEffect(() => {
    const fetchUserPolls = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        // Fetch user's polls with their options for complete data
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
          .eq('created_by', user.id) // Only user's own polls
          .order('created_at', { ascending: false }); // Newest first

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
