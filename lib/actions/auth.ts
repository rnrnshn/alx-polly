'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Authenticates a user with email and password credentials.
 * 
 * This server action handles user login by validating credentials against Supabase Auth.
 * On successful authentication, the user is redirected to the dashboard. On failure,
 * they are redirected back to the login page with an error message.
 * 
 * @param formData - Form data containing email and password fields
 * @throws Redirects to login page with error message if authentication fails
 * @throws Redirects to dashboard on successful authentication
 * 
 * @example
 * ```tsx
 * <form action={login}>
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <button type="submit">Sign In</button>
 * </form>
 * ```
 */
export async function login(formData: FormData) {
  const supabase = await createClient()

  // Extract and validate form data - type-cast since we know these fields exist
  // This assumes the form has proper validation on the client side
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Attempt to authenticate with Supabase Auth
  // This will validate credentials and establish a session if successful
  const { error } = await supabase.auth.signInWithPassword(data)

  // Handle authentication failure - redirect with error message
  // The error message will be displayed on the login page
  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  // Successful authentication - redirect to user dashboard
  redirect('/dashboard')
}

/**
 * Registers a new user account with email, password, and name.
 * 
 * This server action creates a new user account in Supabase Auth and automatically
 * creates a corresponding profile record via database triggers. The user will need
 * to verify their email address before they can log in.
 * 
 * @param formData - Form data containing email, password, and name fields
 * @throws Redirects to register page with error message if registration fails
 * @throws Redirects to login page with verification message on success
 * 
 * @example
 * ```tsx
 * <form action={signup}>
 *   <input name="name" type="text" required />
 *   <input name="email" type="email" required />
 *   <input name="password" type="password" required />
 *   <button type="submit">Create Account</button>
 * </form>
 * ```
 */
export async function signup(formData: FormData) {
  const supabase = await createClient()

  // Extract form data with user metadata for profile creation
  // The name is stored in user metadata and will be used by the database trigger
  // to create the initial profile record
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        name: formData.get('name') as string,
      }
    }
  }

  // Create new user account in Supabase Auth
  // This will trigger email verification and profile creation
  const { error } = await supabase.auth.signUp(data)

  // Handle registration failure - redirect with error message
  if (error) {
    redirect('/register?message=Could not authenticate user')
  }

  // Successful registration - redirect to login with verification message
  // User must check their email and click the verification link
  redirect('/login?message=Check email to continue sign in process')
}

/**
 * Signs out the current user and clears their session.
 * 
 * This server action terminates the user's authentication session by calling
 * Supabase's signOut method, which clears all session cookies and tokens.
 * The user is then redirected to the login page.
 * 
 * @throws Redirects to login page after successful logout
 * 
 * @example
 * ```tsx
 * <form action={logout}>
 *   <button type="submit">Sign Out</button>
 * </form>
 * ```
 */
export async function logout() {
  const supabase = await createClient()
  
  // Clear the user's authentication session
  // This removes all session cookies and tokens
  await supabase.auth.signOut()
  
  // Redirect to login page after successful logout
  redirect('/login')
}

