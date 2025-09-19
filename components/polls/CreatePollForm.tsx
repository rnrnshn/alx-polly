'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { CreatePollData } from '@/lib/types/database';

/**
 * Interactive form component for creating new polls.
 * 
 * This component provides a comprehensive interface for poll creation with:
 * - Dynamic option management (add/remove options)
 * - Form validation (required fields, unique options)
 * - Poll settings (public/private, multiple votes)
 * - Real-time feedback and error handling
 * - Automatic redirect on successful creation
 * 
 * The form uses controlled components with local state management and
 * integrates with the createPoll server action for data persistence.
 * It includes client-side validation to provide immediate feedback
 * before server submission.
 * 
 * Features:
 * - Minimum 2 options, maximum 10 options
 * - Option uniqueness validation
 * - Loading states and success feedback
 * - Responsive design with shadcn/ui components
 * 
 * @returns JSX element containing the poll creation form
 * 
 * @example
 * ```tsx
 * // Used in poll creation page
 * <CreatePollForm />
 * ```
 */
export function CreatePollForm() {
  const [formData, setFormData] = useState<CreatePollData>({
    title: '',
    description: '',
    options: ['', ''],
    is_public: true,
    allow_multiple_votes: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const router = useRouter();

  /**
   * Adds a new empty option to the poll.
   * Enforces maximum limit of 10 options to prevent UI clutter.
   */
  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, ''],
      }));
    }
  };

  /**
   * Removes an option at the specified index.
   * Enforces minimum of 2 options to ensure valid poll structure.
   */
  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  /**
   * Updates the text content of a specific option.
   * Uses immutable update pattern to maintain React state consistency.
   */
  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option),
    }));
  };

  /**
   * Handles form submission with comprehensive validation and error handling.
   * 
   * Performs client-side validation before server submission:
   * - Title is required and not empty
   * - All options must be filled
   * - Options must be unique (case-sensitive)
   * 
   * On successful creation, shows success feedback and redirects to polls page.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Client-side validation for better UX
    if (!formData.title.trim()) {
      setError('Poll title is required');
      setIsLoading(false);
      return;
    }

    // Ensure all options are filled
    if (formData.options.some(option => !option.trim())) {
      setError('All options must be filled');
      setIsLoading(false);
      return;
    }

    // Check for duplicate options using Set for uniqueness
    if (new Set(formData.options.map(opt => opt.trim())).size !== formData.options.length) {
      setError('Options must be unique');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok) {
        setIsSuccess(true);
        toast.success('Poll created successfully! Redirecting to polls...');
        
        // Brief delay to show success message before redirect
        setTimeout(() => {
          router.push('/polls');
        }, 1500);
      } else {
        setError(result.error || 'Failed to create poll. Please try again.');
      }
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

          {isSuccess && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              ✅ Poll created successfully! Redirecting to polls...
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
            <Button type="submit" disabled={isLoading || isSuccess}>
              {isLoading ? 'Creating...' : isSuccess ? 'Created!' : 'Create Poll'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
