import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '@/providers/RootStoreProvider';
import LoadingMain from '@/components/Loading/LoadingMain';

interface WithAuthOptions {
  requiredRoles?: string[];
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) => {
  const {
    requiredRoles = [],
    redirectTo = '/auth/sign-in',
    requireEmailVerification = false
  } = options;

  const AuthenticatedComponent: React.FC<P> = (props) => {
    const userStore = useUserStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      const checkAuth = async () => {
        // If not authenticated, try to refresh token
        if (!userStore.isAuthenticated) {
          const refreshSuccess = await userStore.refreshToken();
          if (!refreshSuccess) {
            // Redirect to login if refresh fails
            router.replace(redirectTo);
            return;
          }
        }

        // Check if user exists
        if (!userStore.user) {
          router.replace(redirectTo);
          return;
        }

        // Check email verification if required
        if (requireEmailVerification && userStore.user.status !== 'active') {
          router.replace('/auth/verify');
          return;
        }

        // Check role requirements
        if (requiredRoles.length > 0 && !userStore.hasAnyRole(requiredRoles)) {
          router.replace('/unauthorized');
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      };

      checkAuth();
    }, [userStore.isAuthenticated, userStore.user, userStore, router, requireEmailVerification, requiredRoles, redirectTo]);

    // Show loading while checking authentication
    if (isLoading) {
      return <LoadingMain />;
    }

    // Show nothing if not authorized (redirect is in progress)
    if (!isAuthorized) {
      return null;
    }

    // Render the protected component
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return observer(AuthenticatedComponent);
};

export default withAuth;
