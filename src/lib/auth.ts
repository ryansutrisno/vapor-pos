import { supabase } from './supabase';
import type { User } from '@/stores/authStore';

/**
 * Validates if the current session is still valid
 * @returns Promise<boolean> - true if session is valid, false otherwise
 */
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return false;
    }

    if (!session) {
      console.log('No session found');
      return false;
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at < now) {
      console.log('Session token expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Session validation failed:', error);
    return false;
  }
};

/**
 * Refreshes the current session token
 * @returns Promise<boolean> - true if refresh successful, false otherwise
 */
export const refreshSession = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      
      // Handle specific auth session missing error
      if (error.message?.includes('Auth session missing')) {
        console.log('Auth session missing, signing out to clear invalid state');
        await supabase.auth.signOut();
        clearAuthStorage();
        return false;
      }
      
      return false;
    }

    if (data.session) {
      console.log('Session refreshed successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('Session refresh failed:', error);
    
    // Handle AuthSessionMissingError specifically
    if (error instanceof Error && error.message?.includes('Auth session missing')) {
      console.log('Caught AuthSessionMissingError, clearing auth state');
      await supabase.auth.signOut();
      clearAuthStorage();
    }
    
    return false;
  }
};

/**
 * Fetches user data from database by email
 * @param email - User email
 * @returns Promise<User | null> - User data or null if not found
 */
export const fetchUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('User fetch error:', error);
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
};

/**
 * Validates session and refreshes if needed
 * @returns Promise<{ isValid: boolean; user: User | null }>
 */
export const validateAndRefreshSession = async (): Promise<{ isValid: boolean; user: User | null }> => {
  try {
    // First check if session exists and is valid
    const isValid = await validateSession();
    
    if (!isValid) {
      // Try to refresh the session
      const refreshed = await refreshSession();
      
      if (!refreshed) {
        return { isValid: false, user: null };
      }
    }

    // Get current session after validation/refresh
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.email) {
      return { isValid: false, user: null };
    }

    // Fetch user data
    const user = await fetchUserByEmail(session.user.email);
    
    return { isValid: !!user, user };
  } catch (error) {
    console.error('Session validation and refresh failed:', error);
    return { isValid: false, user: null };
  }
};

/**
 * Safely signs out user and clears all data
 */
export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign out error:', error);
  }
};

/**
 * Checks if localStorage is available and working
 * @returns boolean - true if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safely clears all auth-related data from localStorage
 */
export const clearAuthStorage = (): void => {
  try {
    if (isLocalStorageAvailable()) {
      localStorage.removeItem('vapor-pos-auth');
      console.log('Auth storage cleared');
    }
  } catch (error) {
    console.error('Failed to clear auth storage:', error);
  }
};

/**
 * Checks if the browser is online
 * @returns boolean - true if online, false if offline
 */
export const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

/**
 * Validates session with network connectivity check
 * @returns Promise<{ isValid: boolean; user: User | null; isOffline: boolean }>
 */
export const validateSessionWithConnectivity = async (): Promise<{ 
  isValid: boolean; 
  user: User | null; 
  isOffline: boolean;
}> => {
  // Check network connectivity first
  if (!isOnline()) {
    console.log('Device is offline, skipping session validation');
    return { isValid: false, user: null, isOffline: true };
  }

  try {
    const result = await validateAndRefreshSession();
    return { ...result, isOffline: false };
  } catch (error) {
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log('Network error during session validation');
      return { isValid: false, user: null, isOffline: true };
    }
    
    console.error('Session validation failed:', error);
    return { isValid: false, user: null, isOffline: false };
  }
};

/**
 * Sets up storage event listener for multi-tab synchronization
 * @param callback - Function to call when auth storage changes
 * @returns Function to remove the event listener
 */
export const setupStorageSync = (callback: (user: User | null) => void): (() => void) => {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'vapor-pos-auth') {
      try {
        if (event.newValue) {
          const parsed = JSON.parse(event.newValue);
          const user = parsed.state?.user || null;
          console.log('Storage sync: User updated from another tab:', user?.email || 'null');
          callback(user);
        } else {
          console.log('Storage sync: User cleared from another tab');
          callback(null);
        }
      } catch (error) {
        console.error('Storage sync: Error parsing storage data:', error);
        callback(null);
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }

  return () => {};
};

/**
 * Debounced session validation to prevent excessive API calls
 */
let validationTimeout: NodeJS.Timeout | null = null;

export const debouncedSessionValidation = (callback: () => void, delay: number = 1000): void => {
  if (validationTimeout) {
    clearTimeout(validationTimeout);
  }
  
  validationTimeout = setTimeout(callback, delay);
};

/**
 * Clears browser cache and storage to prevent stale data issues
 */
export const clearBrowserCache = async (): Promise<void> => {
  try {
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
      console.log('localStorage cleared');
    }
    
    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      console.log('sessionStorage cleared');
    }
    
    // Clear cache if available (modern browsers)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('Browser caches cleared');
    }
    
    // Force reload to ensure fresh data
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  } catch (error) {
    console.error('Error clearing browser cache:', error);
  }
};

/**
 * Forces a hard refresh of the page to clear any cached data
 */
export const forceRefresh = (): void => {
  if (typeof window !== 'undefined') {
    // Force reload from server, bypassing cache
    window.location.reload();
  }
};