import { makeAutoObservable } from "mobx";

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
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          this.accessToken = token;
          this.user = JSON.parse(userData);
          this.isAuthenticated = true;
          
          // Set legacy username for backward compatibility
          this.username = this.user?.email || '';
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
          this.clearAuth();
        }
      }
    }
  };

  // Legacy method for backward compatibility
  setUser = (un: string, pw: string): void => {
    this.username = un;
    this.password = pw;
  };

  // New authentication methods
  setAuthData = (user: User, accessToken: string): void => {
    this.user = user;
    this.accessToken = accessToken;
    this.isAuthenticated = true;
    this.username = user.email; // For backward compatibility
    
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
  };

  setProfile = (profile: Profile): void => {
    this.profile = profile;
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
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
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
