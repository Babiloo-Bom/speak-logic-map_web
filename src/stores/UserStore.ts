import { makeAutoObservable } from "mobx";
import { isTokenExpired, getStoredAuthData, storeAuthData, clearAuthStorage } from '@/utils/authHelpers';

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  location?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

export class UserStore {
  user: User | null = null;
  profile: Profile | null = null;
  accessToken: string | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;

  // Legacy properties for backward compatibility
  username: string = '';
  password: string = '';

  constructor() {
    makeAutoObservable(this);
    this.initializeFromStorage();
  }

  // Initialize user data from localStorage
  initializeFromStorage = (): void => {
    if (typeof window !== 'undefined') {
      const { user, accessToken, profile } = getStoredAuthData();

      if (accessToken && user) {
        // Check if token is expired
        if (isTokenExpired(accessToken)) {
          this.clearAuth();
          return;
        }

        this.accessToken = accessToken;
        this.user = user;
        this.profile = profile;
        this.isAuthenticated = true;

        // Set legacy username for backward compatibility
        this.username = user.email || '';
      }
    }
  };

  // Legacy method for backward compatibility
  setUser = (un: string, pw: string): void => {
    this.username = un;
    this.password = pw;
  };

  // New authentication methods
  setAuthData = (user: User, accessToken: string, profile?: Profile): void => {
    this.user = user;
    this.accessToken = accessToken;
    this.isAuthenticated = true;
    this.username = user.email; // For backward compatibility

    if (profile) {
      this.profile = profile;
    }

    // Store in localStorage using helper
    storeAuthData(user, accessToken, profile);
  };

  setProfile = (profile: Profile): void => {
    this.profile = profile;

    // Update profile in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('profile', JSON.stringify(profile));
    }
  };

  updateUserRole = (newRole: string): void => {
    if (this.user) {
      this.user = { ...this.user, role: newRole };

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    }
  };

  logout = async (): Promise<void> => {
    try {
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      this.clearAuth();
    }
  };

  clearAuth = (): void => {
    this.user = null;
    this.profile = null;
    this.accessToken = null;
    this.isAuthenticated = false;
    this.username = '';
    this.password = '';

    // Clear localStorage using helper
    clearAuthStorage();
  };

  // Token refresh
  refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include', // Include httpOnly cookies
      });

      if (response.ok) {
        const data = await response.json();
        this.setAuthData(data.user, data.accessToken);
        return true;
      } else {
        this.clearAuth();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuth();
      return false;
    }
  };

  // Get auth header for API calls
  getAuthHeader = (): string | null => {
    return this.accessToken ? `Bearer ${this.accessToken}` : null;
  };

  // Check if user has specific role
  hasRole = (role: string): boolean => {
    return this.user?.role === role;
  };

  // Check if user has any of the specified roles
  hasAnyRole = (roles: string[]): boolean => {
    return this.user ? roles.includes(this.user.role) : false;
  };

  // Get user display name
  getDisplayName = (): string => {
    if (this.profile?.first_name && this.profile?.last_name) {
      return `${this.profile.first_name} ${this.profile.last_name}`;
    }
    if (this.profile?.pen_name) {
      return this.profile.pen_name;
    }
    return this.user?.email || 'User';
  };
}
