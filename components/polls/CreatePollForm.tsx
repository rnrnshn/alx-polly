'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreatePollData } from '@/lib/types';

export function CreatePollForm() {
  const [formData, setFormData] = useState<CreatePollData>({
    title: '',
    description: '',
    options: ['', ''],
    isPublic: true,
    allowMultipleVotes: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ''],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option),
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

    if (formData.options.some(option => !option.trim())) {
      setError('All options must be filled');
      setIsLoading(false);
      return;
    }

    if (new Set(formData.options.map(opt => opt.trim())).size !== formData.options.length) {
      setError('Options must be unique');
      setIsLoading(false);
      return;
    }

    try {
      // TODO: Implement actual API call to create poll
      console.log('Creating poll:', formData);
      
      // Mock success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to create poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
        <CardDescription>
          Create a poll to gather opinions from your audience
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
                checked={formData.isPublic}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isPublic">Make this poll public</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowMultipleVotes"
                checked={formData.allowMultipleVotes}
                onChange={(e) => setFormData(prev => ({ ...prev, allowMultipleVotes: e.target.checked }))}
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
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
