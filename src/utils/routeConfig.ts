export interface RouteConfig {
  path: string;
  isPublic: boolean;
  requiredRoles?: string[];
  requireEmailVerification?: boolean;
}

// Define which routes are public (don't require authentication)
export const PUBLIC_ROUTES: string[] = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
  "/login", // Legacy route that redirects
  "/unauthorized",
];

// Define routes that require authentication but allow unverified users
export const UNVERIFIED_ALLOWED_ROUTES: string[] = [
  "/auth/verify",
  "/profile", // Allow users to access profile to resend verification
  "/unauthorized",
  "/dashboard",
  "/manager-search",
  "/manager-rating",
  "/manager-search/manager-rating",
  "/my-rating",
  "/function-ratings",
];

// Check if a route is public (doesn't require authentication)
export const isPublicRoute = (pathname: string): boolean => {
  // Special case: profile detail wizard should be protected (requires auth)
  if (pathname === "/auth/add-user-detail") {
    return false;
  }

  // Check exact matches first
  if (PUBLIC_ROUTES.includes(pathname)) {
    return true;
  }

  // Check if it's an auth route
  if (pathname.startsWith("/auth/")) {
    return true;
  }

  // Check if it's an API route (handled separately)
  if (pathname.startsWith("/api/")) {
    return true;
  }

  return false;
};

// Check if a route allows unverified users
export const allowsUnverifiedUsers = (pathname: string): boolean => {
  return (
    UNVERIFIED_ALLOWED_ROUTES.includes(pathname) ||
    pathname.startsWith("/function-ratings/") ||
    isPublicRoute(pathname)
  );
};

// Get required roles for a route (if any)
export const getRequiredRoles = (pathname: string): string[] => {
  // Define role-based routes here
  const roleBasedRoutes: Record<string, string[]> = {
    "/admin": ["admin"],
    "/dashboard": ["admin", "user", "manager"],
    // Add more role-based routes as needed
  };

  // Check if pathname matches any role-based route
  if (roleBasedRoutes[pathname]) {
    return roleBasedRoutes[pathname];
  }

  // Check if pathname starts with admin routes (for sub-routes)
  if (pathname.startsWith("/admin")) {
    return ["admin"];
  }

  return [];
};
