export interface RouteConfig {
  path: string;
  isPublic: boolean;
  requiredRoles?: string[];
  requireEmailVerification?: boolean;
}

// Define which routes are public (don't require authentication)
export const PUBLIC_ROUTES: string[] = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify',
  '/login', // Legacy route that redirects
  '/unauthorized'
];

// Define routes that require authentication but allow unverified users
export const UNVERIFIED_ALLOWED_ROUTES: string[] = [
  '/auth/verify',
  '/profile', // Allow users to access profile to resend verification
  '/unauthorized'
];

// Check if a route is public (doesn't require authentication)
export const isPublicRoute = (pathname: string): boolean => {
  // Check exact matches first
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }
  
  // Check if it's an auth route
  if (pathname.startsWith('/auth/')) {
    return true;
  }
  
  // Check if it's an API route (handled separately)
  if (pathname.startsWith('/api/')) {
    return true;
  }
  
  return false;
};

// Check if a route allows unverified users
export const allowsUnverifiedUsers = (pathname: string): boolean => {
  return UNVERIFIED_ALLOWED_ROUTES.includes(pathname) || isPublicRoute(pathname);
};

// Get required roles for a route (if any)
export const getRequiredRoles = (pathname: string): string[] => {
  // Define role-based routes here
  const roleBasedRoutes: Record<string, string[]> = {
    '/admin': ['admin'],
    '/dashboard': ['admin', 'user'],
    // Add more role-based routes as needed
  };
  
  return roleBasedRoutes[pathname] || [];
};
