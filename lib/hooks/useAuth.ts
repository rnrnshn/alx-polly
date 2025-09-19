'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
/**
 * Custom hook for managing user authentication state.
 * 
 * This hook provides real-time authentication state management by:
 * - Fetching the current user on mount
 * - Listening for authentication state changes (login/logout)
 * - Providing loading state during authentication checks
 * 
 * The hook automatically subscribes to Supabase auth state changes and
 * updates the user state accordingly. It also handles cleanup of the
 * subscription when the component unmounts.
 * 
 * @returns Object containing:
 *   - user: Current authenticated user or null if not logged in
 *   - loading: Boolean indicating if authentication state is being checked
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, loading } = useAuth();
 *   
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please log in</div>;
 *   
 *   return <div>Welcome, {user.email}!</div>;
 * }
 * ```
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    /**
     * Fetches the current user from Supabase Auth.
     * This is called on component mount to get the initial auth state.
     */
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    // Get initial user state
    getUser()

    /**
     * Subscribe to authentication state changes.
     * This listener will fire when users log in, log out, or when their
     * session is refreshed. It ensures the UI stays in sync with auth state.
     */
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Cleanup subscription on unmount to prevent memory leaks
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}
