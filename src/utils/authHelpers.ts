import type { JWTPayload } from '@/lib/auth';

/**
 * Parse JWT token to get payload
 */
export const parseJWTToken = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseJWTToken(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // Check if token is expired (with 1 minute buffer)
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < (now + 60);
};

/**
 * Get time until token expires in seconds
 */
export const getTokenExpiryTime = (token: string): number => {
  const payload = parseJWTToken(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
};

/**
 * Format user display name
 */
export const formatUserDisplayName = (user: any, profile?: any): string => {
  if (profile?.first_name && profile?.last_name) {
    return `${profile.first_name} ${profile.last_name}`;
  }
  if (profile?.pen_name) {
    return profile.pen_name;
  }
  if (user?.email) {
    return user.email.split('@')[0]; // Use email prefix as fallback
  }
  return 'User';
};

/**
 * Clear all authentication data from storage
 */
export const clearAuthStorage = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Store authentication data
 */
export const storeAuthData = (user: any, accessToken: string, profile?: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    if (profile) {
      localStorage.setItem('profile', JSON.stringify(profile));
    }
  }
};

/**
 * Get stored authentication data
 */
export const getStoredAuthData = (): { user: any | null; accessToken: string | null; profile: any | null } => {
  if (typeof window === 'undefined') {
    return { user: null, accessToken: null, profile: null };
  }

  try {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    const profileStr = localStorage.getItem('profile');

    const user = userStr ? JSON.parse(userStr) : null;
    const profile = profileStr ? JSON.parse(profileStr) : null;

    return { user, accessToken, profile };
  } catch (error) {
    console.error('Error getting stored auth data:', error);
    clearAuthStorage();
    return { user: null, accessToken: null, profile: null };
  }
};
