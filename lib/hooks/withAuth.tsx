'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Higher-Order Component (HOC) that protects routes requiring authentication.
 * 
 * This HOC wraps components that require user authentication. It automatically:
 * - Checks if a user is currently logged in
 * - Redirects unauthenticated users to the login page
 * - Shows a loading state while checking authentication
 * - Only renders the wrapped component if the user is authenticated
 * 
 * The HOC uses the useAuth hook to monitor authentication state and the
 * Next.js router to handle redirects. It prevents flash of unauthenticated
 * content by showing a loading state during auth checks.
 * 
 * @template P - Props type of the wrapped component
 * @param WrappedComponent - The component to protect with authentication
 * @returns A new component that requires authentication to render
 * 
 * @example
 * ```tsx
 * const ProtectedDashboard = withAuth(Dashboard);
 * 
 * // Or with TypeScript:
 * const ProtectedDashboard = withAuth<DashboardProps>(Dashboard);
 * ```
 */
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithAuthComponent = (props: P) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    /**
     * Effect to handle authentication-based redirects.
     * Only redirects when we're certain the user is not authenticated
     * (loading is false and user is null).
     */
    useEffect(() => {
      if (!loading && !user) {
        // Use replace instead of push to prevent back button issues
        router.replace('/login');
      }
    }, [loading, user, router]);

    // Show loading state while checking authentication
    // This prevents flash of unauthenticated content
    if (loading) {
      return <div>Loading...</div>; // TODO: Replace with proper spinner component
    }

    // Don't render anything while redirecting unauthenticated users
    // This prevents the wrapped component from briefly appearing
    if (!user) {
      return null;
    }

    // User is authenticated - render the wrapped component
    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
