'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { EditPollFormData, PollWithOptions, EditPollData } from '@/lib/types/database';
import { updatePoll, getPollById } from '@/lib/actions/polls';

interface EditPollFormProps {
  pollId: string;
}

export function EditPollForm({ pollId }: EditPollFormProps) {
  const [formData, setFormData] = useState<EditPollFormData>({
    title: '',
    description: '',
    options: ['', ''],
    is_public: true,
    allow_multiple_votes: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState('');

  const router = useRouter();

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const result = await getPollById(pollId);
        
        if (result.success && result.poll) {
          const poll = result.poll as PollWithOptions;
          // Transform PollWithOptions to EditPollData format
          const editPollData: EditPollData = {
            id: poll.id,
            title: poll.title,
            description: poll.description,
            options: poll.poll_options.map(option => option.text),
            is_public: poll.is_public,
            allow_multiple_votes: poll.allow_multiple_votes,
            expires_at: poll.expires_at,
            created_at: poll.created_at,
            updated_at: poll.updated_at,
            created_by: poll.created_by,
          };
          setFormData({
            title: poll.title,
            description: poll.description || '',
            options: poll.poll_options.map(option => option.text),
            is_public: poll.is_public,
            allow_multiple_votes: poll.allow_multiple_votes,
            expires_at: poll.expires_at || undefined,
          });
        } else {
          setError(result.error || 'Failed to load poll');
        }
      } catch (err) {
        setError('Failed to load poll');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData((prev: EditPollFormData) => ({
        ...prev,
        options: [...prev.options, ''],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev: EditPollFormData) => ({
        ...prev,
        options: prev.options.filter((_: string, i: number) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev: EditPollFormData) => ({
      ...prev,
      options: prev.options.map((option: string, i: number) => i === index ? value : option),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate form
    if (!formData.title.trim()) {
      setError('Poll title is required');
      setIsLoading(false);
      return;
    }

    if (formData.options.some((option: string) => !option.trim())) {
      setError('All options must be filled');
      setIsLoading(false);
      return;
    }

    if (new Set(formData.options.map((opt: string) => opt.trim())).size !== formData.options.length) {
      setError('Options must be unique');
      setIsLoading(false);
      return;
    }

    try {
      const result = await updatePoll(pollId, formData);
      
      if (result.success) {
        toast.success('Poll updated successfully!');
        router.push('/dashboard');
      } else {
        setError(result.error || 'Failed to update poll. Please try again.');
      }
    } catch (err) {
      setError('Failed to update poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Loading poll...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !isInitialLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Poll</CardTitle>
        <CardDescription>
          Update your poll details and options
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              placeholder="What's your question?"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add more context to your poll..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Poll Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 10}
              >
                Add Option
              </Button>
            </div>
            
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    required
                  />
                  {formData.options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isPublic">Make this poll public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowMultipleVotes"
                checked={formData.allow_multiple_votes}
                onChange={(e) => setFormData(prev => ({ ...prev, allow_multiple_votes: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="allowMultipleVotes">Allow multiple votes per user</Label>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Poll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
