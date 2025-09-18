import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '@/providers/RootStoreProvider';
import { isPublicRoute, allowsUnverifiedUsers, getRequiredRoles } from '@/utils/routeConfig';
import LoadingMain from '@/components/Loading/LoadingMain';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const userStore = useUserStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkRouteAccess = async () => {
      const { pathname } = router;

      // Allow public routes
      if (isPublicRoute(pathname)) {
        setIsAuthorized(true);
        setIsLoading(false);
        return;
      }

      // For protected routes, check authentication
      if (!userStore.isAuthenticated) {
        // Try to refresh the token
        const refreshSuccess = await userStore.refreshToken();
        
        if (!refreshSuccess) {
          // Redirect to sign in if not authenticated
          router.replace('/auth/sign-in');
          return;
        }
      }

      // Check if user exists
      if (!userStore.user) {
        router.replace('/auth/sign-in');
        return;
      }

      // Check email verification requirement
      if (userStore.user.status !== 'active' && !allowsUnverifiedUsers(pathname)) {
        router.replace('/auth/verify');
        return;
      }

      // Check role requirements
      const requiredRoles = getRequiredRoles(pathname);
      if (requiredRoles.length > 0 && !userStore.hasAnyRole(requiredRoles)) {
        router.replace('/unauthorized');
        return;
      }

      // All checks passed
      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Only run the check when the router is ready
    if (router.isReady) {
      checkRouteAccess();
    }
  }, [router.isReady, router.pathname, userStore.isAuthenticated, userStore.user]);

  // Handle route changes
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      setIsLoading(true);
      setIsAuthorized(false);
    };

    const handleRouteChangeComplete = () => {
      // The main useEffect will handle the authorization check
    };

    router.events.on('routeChangeStart', handleRouteChange);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  // Show loading while checking authorization
  if (isLoading) {
    return <LoadingMain />;
  }

  // Show content if authorized
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Show nothing if not authorized (redirect is in progress)
  return null;
};

export default observer(RouteGuard);
