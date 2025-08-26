'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { Poll } from '@/lib/types';
import { PollCard } from '@/components/polls/PollCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

// Mock data for demonstration
const mockPolls: Poll[] = [
  {
    id: '1',
    title: 'What\'s your favorite programming language?',
    description: 'Let\'s see what the community prefers',
    options: [
      { id: '1', text: 'JavaScript', votes: 45, pollId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', text: 'Python', votes: 38, pollId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', text: 'TypeScript', votes: 32, pollId: '1', createdAt: new Date(), updatedAt: new Date() },
      { id: '4', text: 'Rust', votes: 15, pollId: '1', createdAt: new Date(), updatedAt: new Date() },
    ],
    isActive: true,
    isPublic: true,
    allowMultipleVotes: false,
    createdBy: '1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    title: 'Best pizza topping?',
    description: 'The age-old debate continues',
    options: [
      { id: '5', text: 'Pepperoni', votes: 67, pollId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '6', text: 'Mushrooms', votes: 23, pollId: '2', createdAt: new Date(), updatedAt: new Date() },
      { id: '7', text: 'Pineapple', votes: 12, pollId: '2', createdAt: new Date(), updatedAt: new Date() },
    ],
    isActive: true,
    isPublic: true,
    allowMultipleVotes: true,
    createdBy: '1',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to view your dashboard
          </p>
          <Button asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
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
              <div className="text-2xl font-bold">{mockPolls.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockPolls.reduce((sum, poll) => 
                  sum + poll.options.reduce((optSum, opt) => optSum + opt.votes, 0), 0
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
                {mockPolls.filter(poll => poll.isActive).length}
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

          {mockPolls.length > 0 ? (
            <div className="grid gap-6">
              {mockPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
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
