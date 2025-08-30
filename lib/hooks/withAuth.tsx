'use client';

import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithAuthComponent = (props: P) => {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.replace('/login');
      }
    }, [isLoading, user, router]);

    if (isLoading) {
      return <div>Loading...</div>; // Or a spinner component
    }

    if (!user) {
      return null; // Render nothing while redirecting
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuthComponent;
};

export default withAuth;
