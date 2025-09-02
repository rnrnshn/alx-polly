import { CreatePollData } from '@/lib/types/database'

export const createMockUser = (overrides = {}) => ({
  id: 'user-123',
  email: 'test@example.com',
  ...overrides,
})

export const createMockProfile = (overrides = {}) => ({
  id: 'profile-123',
  email: 'test@example.com',
  name: 'Test User',
  avatar_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockPoll = (overrides = {}) => ({
  id: 'poll-123',
  title: 'Test Poll',
  description: 'Test Description',
  status: 'active' as const,
  is_public: true,
  allow_multiple_votes: false,
  expires_at: null,
  created_by: 'profile-123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockPollOption = (overrides = {}) => ({
  id: 'opt-123',
  poll_id: 'poll-123',
  text: 'Test Option',
  order_index: 1,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createMockVote = (overrides = {}) => ({
  id: 'vote-123',
  poll_id: 'poll-123',
  option_id: 'opt-123',
  voter_id: 'user-123',
  voter_email: null,
  voter_name: null,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

export const createValidPollData = (overrides = {}): CreatePollData => ({
  title: 'Test Poll',
  description: 'Test Description',
  is_public: true,
  allow_multiple_votes: false,
  expires_at: null,
  options: ['Option 1', 'Option 2', 'Option 3'],
  ...overrides,
})

export const createMockSupabaseClient = () => ({
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
  })),
})

export const mockSupabaseResponse = <T>(data: T, error: any = null) => ({
  data,
  error,
})

export const mockSupabaseError = (message: string) => ({
  data: null,
  error: { message },
})
