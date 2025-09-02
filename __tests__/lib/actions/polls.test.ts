import { createPoll, getPolls, updatePoll, deletePoll, getPollById, submitVote } from '@/lib/actions/polls'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CreatePollData } from '@/lib/types/database'

// Mock the Supabase client
jest.mock('@/lib/supabase/server')
jest.mock('next/cache')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>

describe('Poll Actions', () => {
  let mockSupabase: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create a mock Supabase client with proper method chaining
    const createMockTable = () => {
      const mockTable = {}
      
      // Create all methods as functions that return the same object
      const methods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order']
      methods.forEach(method => {
        mockTable[method] = jest.fn().mockReturnValue(mockTable)
      })
      
      // single() returns a promise, not the table
      mockTable.single = jest.fn()
      
      return mockTable
    }
    
    // Create a more robust mock that handles method chaining
    const createRobustMockTable = () => {
      const mockTable = {}
      
      // Define all the methods that should be chainable
      const chainableMethods = ['select', 'insert', 'update', 'delete', 'eq', 'in', 'order']
      
      // Create each method as a jest mock that returns the table itself
      chainableMethods.forEach(method => {
        mockTable[method] = jest.fn(() => mockTable)
      })
      
      // single() is not chainable, it returns a promise
      mockTable.single = jest.fn()
      
      return mockTable
    }
    
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn((table) => {
        // Return the appropriate table mock based on the table name
        switch (table) {
          case 'profiles':
            return mockSupabase.profiles
          case 'polls':
            return mockSupabase.polls
          case 'poll_options':
            return mockSupabase.poll_options
          case 'votes':
            return mockSupabase.votes
          default:
            return mockSupabase.polls // fallback
        }
      }),
      profiles: createRobustMockTable(),
      polls: createRobustMockTable(),
      poll_options: createRobustMockTable(),
      votes: createRobustMockTable(),
    }
    
    mockCreateClient.mockResolvedValue(mockSupabase)
  })

  describe('createPoll', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' }
    const mockProfile = { id: 'profile-123' }
    const mockPoll = { id: 'poll-123', title: 'Test Poll' }
    
    const validPollData: CreatePollData = {
      title: 'Test Poll',
      description: 'Test Description',
      is_public: true,
      allow_multiple_votes: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }

    it('should create a poll successfully', async () => {
      // Mock successful responses
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.profiles.select().eq().single.mockResolvedValue({ data: mockProfile, error: null })
      mockSupabase.polls.insert().select().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.insert.mockResolvedValue({ error: null })

      const result = await createPoll(validPollData)

      expect(result.success).toBe(true)
      expect(result.pollId).toBe('poll-123')
      expect(result.redirect).toBe('/polls')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls')
    })

    it('should handle authentication error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'Auth error' } })

      const result = await createPoll(validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You must be logged in to create a poll')
    })

    it('should handle profile not found error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.profiles.select().eq().single.mockResolvedValue({ data: null, error: { message: 'Profile not found' } })

      const result = await createPoll(validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User profile not found. Please try logging out and back in.')
    })

    it('should handle poll creation error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.profiles.select().eq().single.mockResolvedValue({ data: mockProfile, error: null })
      mockSupabase.polls.insert().select().single.mockResolvedValue({ data: null, error: { message: 'Poll creation failed' } })

      const result = await createPoll(validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create poll: Poll creation failed')
    })

    it('should handle poll options creation error and cleanup', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.profiles.select().eq().single.mockResolvedValue({ data: mockProfile, error: null })
      mockSupabase.polls.insert().select().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.insert.mockResolvedValue({ error: { message: 'Options creation failed' } })

      const result = await createPoll(validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to create poll options: Options creation failed')
      // Verify cleanup was attempted
      expect(mockSupabase.polls.delete).toHaveBeenCalled()
    })
  })

  describe('getPolls', () => {
    const mockPolls = [
      {
        id: 'poll-1',
        title: 'Poll 1',
        poll_options: [{ id: 'opt-1', text: 'Option 1', order_index: 1 }],
        profiles: { name: 'User 1' }
      }
    ]

    it('should fetch public polls successfully', async () => {
      mockSupabase.polls.select().eq().eq().order.mockResolvedValue({ data: mockPolls, error: null })

      const result = await getPolls()

      expect(result.polls).toEqual(mockPolls)
      expect(result.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      mockSupabase.polls.select().eq().eq().order.mockResolvedValue({ data: null, error: { message: 'Fetch failed' } })

      const result = await getPolls()

      expect(result.polls).toEqual([])
      expect(result.error).toBe('Failed to fetch polls: Fetch failed')
    })

    it('should ensure poll_options is always an array', async () => {
      const pollsWithoutOptions = [{ id: 'poll-1', title: 'Poll 1', poll_options: null }]
      mockSupabase.polls.select().eq().eq().order.mockResolvedValue({ data: pollsWithoutOptions, error: null })

      const result = await getPolls()

      expect(result.polls[0].poll_options).toEqual([])
    })
  })

  describe('updatePoll', () => {
    const mockUser = { id: 'user-123' }
    const mockPoll = { created_by: 'user-123' }
    const validPollData: CreatePollData = {
      title: 'Updated Poll',
      description: 'Updated Description',
      is_public: true,
      allow_multiple_votes: true,
      options: ['Updated Option 1', 'Updated Option 2']
    }

    it('should update a poll successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.polls.update().eq.mockResolvedValue({ error: null })
      mockSupabase.poll_options.delete().eq.mockResolvedValue({ error: null })
      mockSupabase.poll_options.insert.mockResolvedValue({ error: null })

      const result = await updatePoll('poll-123', validPollData)

      expect(result.success).toBe(true)
      expect(result.pollId).toBe('poll-123')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls')
    })

    it('should handle unauthorized update attempt', async () => {
      const unauthorizedPoll = { created_by: 'other-user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: unauthorizedPoll, error: null })

      const result = await updatePoll('poll-123', validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only update your own polls')
    })

    it('should handle poll not found error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: null, error: { message: 'Poll not found' } })

      const result = await updatePoll('poll-123', validPollData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll not found')
    })
  })

  describe('deletePoll', () => {
    const mockUser = { id: 'user-123' }
    const mockPoll = { created_by: 'user-123' }

    it('should delete a poll successfully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.delete().eq.mockResolvedValue({ error: null })
      mockSupabase.polls.delete().eq.mockResolvedValue({ error: null })

      const result = await deletePoll('poll-123')

      expect(result.success).toBe(true)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/dashboard')
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls')
    })

    it('should handle unauthorized delete attempt', async () => {
      const unauthorizedPoll = { created_by: 'other-user-123' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: unauthorizedPoll, error: null })

      const result = await deletePoll('poll-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('You can only delete your own polls')
    })

    it('should handle poll options deletion error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.delete().eq.mockResolvedValue({ error: { message: 'Options deletion failed' } })

      const result = await deletePoll('poll-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to delete poll options: Options deletion failed')
    })
  })

  describe('getPollById', () => {
    const mockPoll = {
      id: 'poll-123',
      title: 'Test Poll',
      poll_options: [{ id: 'opt-1', text: 'Option 1', order_index: 1 }]
    }

    it('should fetch a poll by ID successfully', async () => {
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })

      const result = await getPollById('poll-123')

      expect(result.success).toBe(true)
      expect(result.poll).toEqual(mockPoll)
    })

    it('should handle poll not found error', async () => {
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: null, error: { message: 'Poll not found' } })

      const result = await getPollById('poll-123')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to fetch poll: Poll not found')
      expect(result.poll).toBeNull()
    })
  })

  describe('submitVote', () => {
    const mockUser = { id: 'user-123' }
    const mockPoll = { 
      status: 'active', 
      expires_at: null, 
      allow_multiple_votes: false 
    }
    const mockOptions = [{ id: 'opt-1' }]
    const voteData = {
      poll_id: 'poll-123',
      option_ids: ['opt-1'],
      voter_name: 'John Doe',
      voter_email: 'john@example.com'
    }

    it('should submit a vote successfully for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: mockOptions, error: null })
      mockSupabase.votes.select().eq().eq.mockResolvedValue({ data: [], error: null })
      mockSupabase.votes.insert.mockResolvedValue({ error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(true)
      expect(mockRevalidatePath).toHaveBeenCalledWith('/polls/poll-123')
    })

    it('should submit a vote successfully for anonymous user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: mockOptions, error: null })
      mockSupabase.votes.insert.mockResolvedValue({ error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(true)
    })

    it('should handle poll not found error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: null, error: { message: 'Poll not found' } })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll not found')
    })

    it('should handle inactive poll error', async () => {
      const inactivePoll = { ...mockPoll, status: 'inactive' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: inactivePoll, error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll is not active')
    })

    it('should handle expired poll error', async () => {
      const expiredPoll = { ...mockPoll, expires_at: '2020-01-01T00:00:00Z' }
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: expiredPoll, error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Poll has expired')
    })

    it('should handle invalid options error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: [], error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid options selected')
    })

    it('should handle duplicate vote error for single vote polls', async () => {
      const existingVotes = [{ id: 'vote-1' }]
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: mockOptions, error: null })
      mockSupabase.votes.select().eq().eq.mockResolvedValue({ data: existingVotes, error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('You have already voted on this poll')
    })

    it('should allow multiple votes for polls that allow it', async () => {
      const multipleVotePoll = { ...mockPoll, allow_multiple_votes: true }
      const existingVotes = [{ id: 'vote-1' }]
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: multipleVotePoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: mockOptions, error: null })
      mockSupabase.votes.select().eq().eq.mockResolvedValue({ data: existingVotes, error: null })
      mockSupabase.votes.insert.mockResolvedValue({ error: null })

      const result = await submitVote(voteData)

      expect(result.success).toBe(true)
    })

    it('should handle vote insertion error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null })
      mockSupabase.polls.select().eq().single.mockResolvedValue({ data: mockPoll, error: null })
      mockSupabase.poll_options.select().eq().in.mockResolvedValue({ data: mockOptions, error: null })
      mockSupabase.votes.select().eq().eq.mockResolvedValue({ data: [], error: null })
      mockSupabase.votes.insert.mockResolvedValue({ error: { message: 'Vote insertion failed' } })

      const result = await submitVote(voteData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to submit vote: Vote insertion failed')
    })
  })
})
