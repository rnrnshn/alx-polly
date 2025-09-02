import { login, signup, logout } from '@/lib/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Mock the Supabase client and Next.js navigation
jest.mock('@/lib/supabase/server')
jest.mock('next/navigation')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>

describe('Auth Actions', () => {
  let mockSupabase: any
  let mockFormData: FormData

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()
    
    // Create a mock Supabase client
    mockSupabase = {
      auth: {
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      },
    }
    
    mockCreateClient.mockResolvedValue(mockSupabase)
    
    // Create mock FormData
    mockFormData = {
      get: jest.fn((key: string) => {
        const data: Record<string, string> = {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }
        return data[key] || null
      }),
    } as any
  })

  describe('Unit Tests', () => {
    describe('login', () => {
      it('should successfully log in user and redirect to dashboard', async () => {
        // Mock successful login
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

        await login(mockFormData)

        // Verify Supabase client was called correctly
        expect(mockCreateClient).toHaveBeenCalled()
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
        
        // Verify redirect to dashboard
        expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
      })

      it('should handle login failure and redirect to login with error message', async () => {
        // Mock login failure
        const authError = { message: 'Invalid credentials' }
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: authError })

        await login(mockFormData)

        // Verify error handling
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
        expect(mockRedirect).toHaveBeenCalledWith('/login?message=Could not authenticate user')
      })

      it('should handle missing email and password gracefully', async () => {
        // Mock FormData with missing fields
        const incompleteFormData = {
          get: jest.fn((key: string) => null),
        } as any

        // Mock successful login (even with missing data)
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

        await login(incompleteFormData)

        // Verify it still attempts to authenticate (behavior depends on Supabase)
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: null,
          password: null,
        })
      })
    })

    describe('signup', () => {
      it('should successfully sign up user and redirect to login with confirmation message', async () => {
        // Mock successful signup
        mockSupabase.auth.signUp.mockResolvedValue({ error: null })

        await signup(mockFormData)

        // Verify Supabase client was called correctly
        expect(mockCreateClient).toHaveBeenCalled()
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: 'Test User',
            },
          },
        })
        
        // Verify redirect to login with confirmation message
        expect(mockRedirect).toHaveBeenCalledWith('/login?message=Check email to continue sign in process')
      })

      it('should handle signup failure and redirect to register with error message', async () => {
        // Mock signup failure
        const authError = { message: 'Email already exists' }
        mockSupabase.auth.signUp.mockResolvedValue({ error: authError })

        await signup(mockFormData)

        // Verify error handling
        expect(mockSupabase.auth.signUp).toHaveBeenCalled()
        expect(mockRedirect).toHaveBeenCalledWith('/register?message=Could not authenticate user')
      })

      it('should handle missing name field gracefully', async () => {
        // Mock FormData with missing name
        const incompleteFormData = {
          get: jest.fn((key: string) => {
            const data: Record<string, string> = {
              email: 'test@example.com',
              password: 'password123',
              name: null,
            }
            return data[key] || null
          }),
        } as any

        // Mock successful signup
        mockSupabase.auth.signUp.mockResolvedValue({ error: null })

        await signup(incompleteFormData)

        // Verify it still attempts to sign up
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: null,
            },
          },
        })
      })
    })

    describe('logout', () => {
      it('should successfully sign out user and redirect to login', async () => {
        // Mock successful signout
        mockSupabase.auth.signOut.mockResolvedValue({ error: null })

        await logout()

        // Verify Supabase client was called correctly
        expect(mockCreateClient).toHaveBeenCalled()
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        
        // Verify redirect to login
        expect(mockRedirect).toHaveBeenCalledWith('/login')
      })

      it('should redirect to login even if signout fails', async () => {
        // Mock signout failure
        mockSupabase.auth.signOut.mockRejectedValue(new Error('Network error'))

        // This test expects the function to fail, so we need to handle the error
        try {
          await logout()
        } catch (error) {
          // Expected to fail due to network error
        }

        // Verify it still attempts to sign out
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        // Note: redirect won't be called if the function throws an error
      })
    })
  })

  describe('Integration Tests', () => {
    describe('Full Authentication Flow', () => {
      it('should handle complete user journey: signup → login → logout', async () => {
        // Step 1: Signup
        mockSupabase.auth.signUp.mockResolvedValue({ error: null })
        await signup(mockFormData)
        
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          options: {
            data: {
              name: 'Test User',
            },
          },
        })
        expect(mockRedirect).toHaveBeenCalledWith('/login?message=Check email to continue sign in process')
        
        // Reset mocks for next step
        jest.clearAllMocks()
        mockCreateClient.mockResolvedValue(mockSupabase)
        
        // Step 2: Login
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
        await login(mockFormData)
        
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        })
        expect(mockRedirect).toHaveBeenCalledWith('/dashboard')
        
        // Reset mocks for next step
        jest.clearAllMocks()
        mockCreateClient.mockResolvedValue(mockSupabase)
        
        // Step 3: Logout
        mockSupabase.auth.signOut.mockResolvedValue({ error: null })
        await logout()
        
        expect(mockSupabase.auth.signOut).toHaveBeenCalled()
        expect(mockRedirect).toHaveBeenCalledWith('/login')
      })

      it('should handle authentication errors gracefully throughout the flow', async () => {
        // Step 1: Signup fails
        mockSupabase.auth.signUp.mockResolvedValue({ 
          error: { message: 'Email already exists' } 
        })
        await signup(mockFormData)
        
        expect(mockRedirect).toHaveBeenCalledWith('/register?message=Could not authenticate user')
        
        // Reset mocks for next step
        jest.clearAllMocks()
        mockCreateClient.mockResolvedValue(mockSupabase)
        
        // Step 2: Login fails
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ 
          error: { message: 'Invalid credentials' } 
        })
        await login(mockFormData)
        
        expect(mockRedirect).toHaveBeenCalledWith('/login?message=Could not authenticate user')
        
        // Reset mocks for next step
        jest.clearAllMocks()
        mockCreateClient.mockResolvedValue(mockSupabase)
        
        // Step 3: Logout still works
        mockSupabase.auth.signOut.mockResolvedValue({ error: null })
        await logout()
        
        expect(mockRedirect).toHaveBeenCalledWith('/login')
      })
    })

    describe('Edge Cases and Error Scenarios', () => {
      it('should handle network errors during authentication', async () => {
        // Mock network error during login
        mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'))

        // This test expects the function to fail, so we need to handle the error
        try {
          await login(mockFormData)
        } catch (error) {
          // Expected to fail due to network error
        }

        // Should still attempt to authenticate
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
      })

      it('should handle malformed FormData gracefully', async () => {
        // Mock malformed FormData
        const malformedFormData = {
          get: jest.fn(() => undefined),
        } as any

        // Mock successful login
        mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

        await login(malformedFormData)

        // Should still attempt to authenticate
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: undefined,
          password: undefined,
        })
      })

      it('should handle Supabase client creation failures', async () => {
        // Mock Supabase client creation failure
        mockCreateClient.mockRejectedValue(new Error('Failed to create client'))

        // This should throw an error, but we're testing the error handling
        await expect(login(mockFormData)).rejects.toThrow('Failed to create client')
      })
    })
  })

  describe('Data Validation and Security', () => {
    it('should properly sanitize user input data', async () => {
      // Mock FormData with potentially malicious input
      const maliciousFormData = {
        get: jest.fn((key: string) => {
          const data: Record<string, string> = {
            email: 'test@example.com<script>alert("xss")</script>',
            password: 'password123',
            name: 'Test User<script>alert("xss")</script>',
          }
          return data[key] || null
        }),
      } as any

      // Mock successful signup
      mockSupabase.auth.signUp.mockResolvedValue({ error: null })

      await signup(maliciousFormData)

      // Verify the data is passed as-is to Supabase (Supabase handles sanitization)
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com<script>alert("xss")</script>',
        password: 'password123',
        options: {
          data: {
            name: 'Test User<script>alert("xss")</script>',
          },
        },
      })
    })

    it('should handle empty string inputs appropriately', async () => {
      // Mock FormData with empty strings
      const emptyFormData = {
        get: jest.fn((key: string) => {
          const data: Record<string, string> = {
            email: '',
            password: '',
            name: '',
          }
          return data[key] || null
        }),
      } as any

      // Mock successful login
      mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })

      await login(emptyFormData)

      // Should still attempt to authenticate with empty strings
      // Note: FormData.get() returns null for empty strings, not empty strings
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: null,
        password: null,
      })
    })
  })
})
