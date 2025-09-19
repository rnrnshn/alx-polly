'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';

/**
 * Login form component for user authentication.
 * 
 * This component provides a clean, accessible form for users to sign in to their
 * Pollly account. It uses server actions for form submission, which means no
 * client-side JavaScript is required for the authentication flow.
 * 
 * Features:
 * - Email and password input fields with proper validation
 * - Server action integration for secure authentication
 * - Link to registration page for new users
 * - Responsive design with shadcn/ui components
 * - Proper form accessibility with labels and required attributes
 * 
 * The form automatically handles redirects on success/failure through the
 * server action, providing a seamless user experience.
 * 
 * @returns JSX element containing the login form
 * 
 * @example
 * ```tsx
 * // Used in login page
 * <LoginForm />
 * ```
 */
export function LoginForm() {

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to Pollly</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          Server action form - no client-side JavaScript needed for submission
          The login server action handles authentication and redirects
        */}
        <form action={login} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="email" // Helps with browser autofill
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="current-password" // Helps with browser autofill
            />
          </div>

          <Button type="submit" className="w-full">
            Sign in
          </Button>

          {/* Navigation link for new users */}
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
