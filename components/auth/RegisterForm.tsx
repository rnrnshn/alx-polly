'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { signup } from '@/lib/actions/auth';

/**
 * Registration form component for new user signup.
 * 
 * This component provides a user-friendly form for creating new Pollly accounts.
 * It collects essential user information (name, email, password) and uses server
 * actions for secure account creation. The form includes proper validation and
 * accessibility features.
 * 
 * Features:
 * - Full name, email, and password input fields
 * - Server action integration for secure registration
 * - Automatic profile creation via database triggers
 * - Email verification flow (user must verify email before login)
 * - Link to login page for existing users
 * - Responsive design with shadcn/ui components
 * 
 * After successful registration, users are redirected to the login page with
 * a message to check their email for verification.
 * 
 * @returns JSX element containing the registration form
 * 
 * @example
 * ```tsx
 * // Used in register page
 * <RegisterForm />
 * ```
 */
export function RegisterForm() {

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Join Pollly to create and participate in polls
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 
          Server action form for user registration
          The signup server action handles account creation and email verification
        */}
        <form action={signup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              required
              autoComplete="name" // Helps with browser autofill
            />
          </div>

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
              placeholder="Create a password"
              required
              autoComplete="new-password" // Helps with browser autofill
            />
          </div>

          <Button type="submit" className="w-full">
            Create account
          </Button>

          {/* Navigation link for existing users */}
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}