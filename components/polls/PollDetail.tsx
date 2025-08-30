'use client';

import { useState } from 'react';
import { PollWithOptions } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { submitVote } from '@/lib/actions/polls';

interface PollDetailProps {
  poll: PollWithOptions;
}

export function PollDetail({ poll }: PollDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voterName, setVoterName] = useState('');
  const [voterEmail, setVoterEmail] = useState('');

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date();
  const options = poll.poll_options || [];

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (poll.allow_multiple_votes) {
      if (checked) {
        setSelectedOptions(prev => [...prev, optionId]);
      } else {
        setSelectedOptions(prev => prev.filter(id => id !== optionId));
      }
    } else {
      setSelectedOptions(checked ? [optionId] : []);
    }
  };

  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const voteData = {
        poll_id: poll.id,
        option_ids: selectedOptions,
        voter_name: voterName || undefined,
        voter_email: voterEmail || undefined,
      };

      const result = await submitVote(voteData);
      
      if (result.success) {
        toast.success('Vote submitted successfully!');
        setHasVoted(true);
      } else {
        toast.error(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold">Thank you for voting!</h2>
              <p className="text-muted-foreground">
                Your vote has been recorded successfully.
              </p>
              <Button onClick={() => window.location.reload()}>
                View Results
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Poll Header */}
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <CardTitle className="text-2xl">{poll.title}</CardTitle>
            {poll.description && (
              <CardDescription className="text-base">
                {poll.description}
              </CardDescription>
            )}
            <div className="flex flex-wrap gap-2">
              {!poll.is_public && (
                <Badge variant="secondary">Private</Badge>
              )}
              {poll.allow_multiple_votes && (
                <Badge variant="outline">Multiple votes allowed</Badge>
              )}
              {isExpired && (
                <Badge variant="destructive">Expired</Badge>
              )}
              <Badge variant={poll.status === 'active' ? 'default' : 'secondary'}>
                {poll.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voting Form */}
      {!isExpired && poll.status === 'active' ? (
        <Card>
          <CardHeader>
            <CardTitle>Cast Your Vote</CardTitle>
            <CardDescription>
              {poll.allow_multiple_votes 
                ? 'You can select multiple options' 
                : 'Please select one option'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitVote} className="space-y-6">
              {/* Voting Options */}
              <div className="space-y-3">
                {poll.allow_multiple_votes ? (
                  // Multiple choice with checkboxes
                  <div className="space-y-3">
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={selectedOptions.includes(option.id)}
                          onCheckedChange={(checked) => 
                            handleOptionChange(option.id, checked as boolean)
                          }
                        />
                        <Label 
                          htmlFor={option.id} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {option.text}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Single choice with radio buttons
                  <RadioGroup 
                    value={selectedOptions[0] || ''} 
                    onValueChange={(value) => setSelectedOptions([value])}
                  >
                    {options.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id}>{option.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Voter Information (Optional) */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium">Your Information (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="voterName">Name</Label>
                    <input
                      id="voterName"
                      type="text"
                      value={voterName}
                      onChange={(e) => setVoterName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="voterEmail">Email</Label>
                    <input
                      id="voterEmail"
                      type="email"
                      value={voterEmail}
                      onChange={(e) => setVoterEmail(e.target.value)}
                      placeholder="Your email (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || selectedOptions.length === 0}
              >
                {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        /* Poll Closed/Expired Message */
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-4xl">🔒</div>
              <h2 className="text-xl font-semibold">Poll is not available for voting</h2>
              <p className="text-muted-foreground">
                {isExpired 
                  ? 'This poll has expired and is no longer accepting votes.'
                  : 'This poll is currently inactive.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Poll Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Poll Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div>Created: {new Date(poll.created_at).toLocaleDateString()}</div>
          {poll.expires_at && (
            <div>Expires: {new Date(poll.expires_at).toLocaleDateString()}</div>
          )}
          <div>Total options: {options.length}</div>
          <div>Voting type: {poll.allow_multiple_votes ? 'Multiple choice' : 'Single choice'}</div>
        </CardContent>
      </Card>
    </div>
  );
}
