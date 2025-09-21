'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { PollWithOptions } from '@/lib/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { getPollResults } from '@/lib/actions/polls';

interface PollDetailProps {
  poll: PollWithOptions;
}

interface PollResult {
  option_id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
}

interface VoteStats {
  totalVotes: number;
  maxVotes: number;
  optionsWithStats: Array<{
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
    isLeading: boolean;
  }>;
}

interface VoterInfo {
  name: string;
  email: string;
}

// Extracted components for better readability
function PollHeader({ poll, isExpired }: { poll: PollWithOptions; isExpired: boolean }) {
  return (
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
  );
}

function VotingProgress({ voteStats }: { voteStats: VoteStats }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current Results</CardTitle>
        <CardDescription>
          {voteStats.totalVotes} total vote{voteStats.totalVotes !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {voteStats.optionsWithStats.map((option) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{option.text}</span>
                  {option.isLeading && (
                    <Badge variant="default" className="text-xs">Leading</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {option.voteCount} vote{option.voteCount !== 1 ? 's' : ''} ({option.percentage.toFixed(1)}%)
                </div>
              </div>
              <Progress 
                value={option.percentage} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VotingOptions({
  options,
  selectedOptions,
  allowMultipleVotes,
  onOptionChange
}: {
  options: PollWithOptions['poll_options'];
  selectedOptions: string[];
  allowMultipleVotes: boolean;
  onOptionChange: (optionId: string, checked: boolean) => void;
}) {
  if (allowMultipleVotes) {
    return (
      <div className="space-y-3">
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            <Checkbox
              id={option.id}
              checked={selectedOptions.includes(option.id)}
              onCheckedChange={(checked) => 
                onOptionChange(option.id, checked as boolean)
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
    );
  }

  return (
    <RadioGroup 
      value={selectedOptions[0] || ''} 
      onValueChange={(value) => onOptionChange(value, true)}
    >
      {options.map((option) => (
        <div key={option.id} className="flex items-center space-x-2">
          <RadioGroupItem value={option.id} id={option.id} />
          <Label htmlFor={option.id}>{option.text}</Label>
        </div>
      ))}
    </RadioGroup>
  );
}

function VoterInformationForm({
  voterInfo,
  onVoterInfoChange
}: {
  voterInfo: VoterInfo;
  onVoterInfoChange: (field: keyof VoterInfo, value: string) => void;
}) {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-sm font-medium">Your Information (Optional)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="voterName">Name</Label>
          <input
            id="voterName"
            type="text"
            value={voterInfo.name}
            onChange={(e) => onVoterInfoChange('name', e.target.value)}
            placeholder="Your name (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="voterEmail">Email</Label>
          <input
            id="voterEmail"
            type="email"
            value={voterInfo.email}
            onChange={(e) => onVoterInfoChange('email', e.target.value)}
            placeholder="Your email (optional)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

function VotingForm({
  poll,
  options,
  selectedOptions,
  voterInfo,
  isSubmitting,
  onOptionChange,
  onVoterInfoChange,
  onSubmit
}: {
  poll: PollWithOptions;
  options: PollWithOptions['poll_options'];
  selectedOptions: string[];
  voterInfo: VoterInfo;
  isSubmitting: boolean;
  onOptionChange: (optionId: string, checked: boolean) => void;
  onVoterInfoChange: (field: keyof VoterInfo, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
        <CardDescription>
          {Boolean(poll.allow_multiple_votes)
            ? 'You can select multiple options' 
            : 'Please select one option'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-3">
            <VotingOptions
              options={options}
              selectedOptions={selectedOptions}
              allowMultipleVotes={poll.allow_multiple_votes}
              onOptionChange={onOptionChange}
            />
          </div>

          <VoterInformationForm
            voterInfo={voterInfo}
            onVoterInfoChange={onVoterInfoChange}
          />

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
  );
}

function PollClosedMessage({ isExpired }: { isExpired: boolean }) {
  return (
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
  );
}

function PollInformation({ poll, options }: { poll: PollWithOptions; options: PollWithOptions['poll_options'] }) {
  return (
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
        <div>Voting type: {Boolean(poll.allow_multiple_votes) ? 'Multiple choice' : 'Single choice'}</div>
      </CardContent>
    </Card>
  );
}

function ThankYouMessage() {
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

export function PollDetail({ poll }: PollDetailProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [voterInfo, setVoterInfo] = useState<VoterInfo>({ name: '', email: '' });
  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [isLoadingResults, setIsLoadingResults] = useState(true);

  const isExpired = Boolean(poll.expires_at && new Date(poll.expires_at) < new Date());
  const options = poll.poll_options || [];

  // Fetch poll results on component mount
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoadingResults(true);
      try {
        const result = await getPollResults(poll.id);
        if (result.success && result.data) {
          setPollResults(result.data);
        } else {
          console.error('Failed to fetch poll results:', result.error);
        }
      } catch (error) {
        console.error('Error fetching poll results:', error);
      } finally {
        setIsLoadingResults(false);
      }
    };

    fetchResults();
  }, [poll.id]);

  // Memoized vote statistics calculation using real data
  const voteStats = useMemo((): VoteStats => {
    if (isLoadingResults || pollResults.length === 0) {
      // Show loading state or fallback to 0 votes
      const totalVotes = 0;
      const maxVotes = 0;
      
      const optionsWithStats = options.map((option) => ({
        id: option.id,
        text: option.text,
        voteCount: 0,
        percentage: 0,
        isLeading: false,
      }));

      return { totalVotes, maxVotes, optionsWithStats };
    }

    // Calculate real statistics from poll results
    const totalVotes = pollResults.reduce((sum, result) => sum + Number(result.vote_count), 0);
    const maxVotes = Math.max(...pollResults.map(result => Number(result.vote_count)), 0);
    
    const optionsWithStats = options.map((option) => {
      const result = pollResults.find(r => r.option_id === option.id);
      const voteCount = result ? Number(result.vote_count) : 0;
      const percentage = result ? Number(result.percentage) : 0;
      
      return {
        id: option.id,
        text: option.text,
        voteCount,
        percentage,
        isLeading: voteCount === maxVotes && maxVotes > 0,
      };
    });

    return { totalVotes, maxVotes, optionsWithStats };
  }, [options, pollResults, isLoadingResults]);

  // Memoized handlers for better performance
  const handleOptionChange = useCallback((optionId: string, checked: boolean) => {
    if (Boolean(poll.allow_multiple_votes)) {
      setSelectedOptions(prev => 
        checked 
          ? [...prev, optionId]
          : prev.filter(id => id !== optionId)
      );
    } else {
      setSelectedOptions(checked ? [optionId] : []);
    }
  }, [poll.allow_multiple_votes]);

  const handleVoterInfoChange = useCallback((field: keyof VoterInfo, value: string) => {
    setVoterInfo(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmitVote = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedOptions.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const voteData = {
        option_ids: selectedOptions,
        voter_name: voterInfo.name || undefined,
        voter_email: voterInfo.email || undefined,
      };

      const response = await fetch(`/api/polls/${poll.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteData),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Vote submitted successfully!');
        setHasVoted(true);
        
        // Refresh poll results after successful vote
        try {
          const resultsResponse = await getPollResults(poll.id);
          if (resultsResponse.success && resultsResponse.data) {
            setPollResults(resultsResponse.data);
          }
        } catch (error) {
          console.error('Error refreshing poll results:', error);
        }
      } else {
        toast.error(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [poll.id, selectedOptions, voterInfo]);

  if (hasVoted) {
    return <ThankYouMessage />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PollHeader poll={poll} isExpired={isExpired} />
      <VotingProgress voteStats={voteStats} />

      {!isExpired && poll.status === 'active' ? (
        <VotingForm
          poll={poll}
          options={options}
          selectedOptions={selectedOptions}
          voterInfo={voterInfo}
          isSubmitting={isSubmitting}
          onOptionChange={handleOptionChange}
          onVoterInfoChange={handleVoterInfoChange}
          onSubmit={handleSubmitVote}
        />
      ) : (
        <PollClosedMessage isExpired={isExpired} />
      )}

      <PollInformation poll={poll} options={options} />
    </div>
  );
}
