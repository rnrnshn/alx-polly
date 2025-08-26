'use client';

import { Poll } from '@/lib/types';
import { PollCard } from '@/components/polls/PollCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { useState } from 'react';

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
  {
    id: '3',
    title: 'Which framework do you prefer for web development?',
    description: 'Share your thoughts on modern web frameworks',
    options: [
      { id: '8', text: 'React', votes: 89, pollId: '3', createdAt: new Date(), updatedAt: new Date() },
      { id: '9', text: 'Vue', votes: 34, pollId: '3', createdAt: new Date(), updatedAt: new Date() },
      { id: '10', text: 'Angular', votes: 28, pollId: '3', createdAt: new Date(), updatedAt: new Date() },
      { id: '11', text: 'Svelte', votes: 19, pollId: '3', createdAt: new Date(), updatedAt: new Date() },
    ],
    isActive: true,
    isPublic: true,
    allowMultipleVotes: false,
    createdBy: '2',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-08'),
  },
];

export default function PollsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const filteredPolls = mockPolls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         poll.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && poll.isActive) ||
                         (filter === 'expired' && poll.expiresAt && new Date() > poll.expiresAt);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Polls</h1>
            <p className="text-muted-foreground">
              Discover and participate in polls created by the community
            </p>
          </div>
          <Button asChild>
            <Link href="/polls/create">Create Poll</Link>
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search polls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                >
                  Active
                </Button>
                <Button
                  variant={filter === 'expired' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('expired')}
                >
                  Expired
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Polls Grid */}
        {filteredPolls.length > 0 ? (
          <div className="grid gap-6">
            {filteredPolls.map((poll) => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No polls found matching your search' : 'No polls available'}
              </p>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => setSearchTerm('')}
                >
                  Clear search
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
