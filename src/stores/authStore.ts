import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { isLocalStorageAvailable, clearAuthStorage } from '@/lib/auth';

// User interface matching the database structure
interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'warehouse' | 'kasir';
  tenant_id?: string;
  store_id?: string;
  subscription_plan?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  clearPersistedState: () => void;
  setError: (error: string | null) => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
    user: null,
    isAuthenticated: false,
    isHydrated: false,
    error: null,
    setUser: (user) => {
      console.log('AuthStore - setUser called with:', user);
      console.log('AuthStore: Setting user:', user?.email || 'null');
      set({ 
        user, 
        isAuthenticated: !!user,
        error: null
      });
    },
    logout: () => {
      console.log('AuthStore: Logging out');
      set({ 
        user: null, 
        isAuthenticated: false,
        error: null
      });
    },
    clearPersistedState: () => {
      console.log('AuthStore: Clearing persisted state');
      try {
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null
        });
        clearAuthStorage();
      } catch (error) {
        console.error('AuthStore: Error clearing persisted state:', error);
        set({ error: 'Failed to clear authentication data' });
      }
    },
    setError: (error) => {
      console.log('AuthStore: Setting error:', error);
      set({ error });
    },
    setHydrated: (hydrated) => {
      set({ isHydrated: hydrated });
    },
  }),
  {
    name: 'vapor-pos-auth',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({ 
      user: state.user, 
      isAuthenticated: state.isAuthenticated 
    }),
    onRehydrateStorage: () => (state) => {
      console.log('AuthStore: Rehydrating from storage');
      if (state) {
        state.setHydrated(true);
        
        // Validate localStorage availability
        if (!isLocalStorageAvailable()) {
          console.warn('AuthStore: localStorage not available, clearing state');
          state.clearPersistedState();
          state.setError('Local storage is not available');
          return;
        }
        
        // Check for corrupted data
        try {
          const storedData = localStorage.getItem('vapor-pos-auth');
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (!parsed.state || typeof parsed.state !== 'object') {
              console.warn('AuthStore: Corrupted storage data detected, clearing');
              state.clearPersistedState();
              state.setError('Authentication data was corrupted');
            }
          }
        } catch (error) {
          console.error('AuthStore: Error parsing stored data:', error);
          state.clearPersistedState();
          state.setError('Failed to restore authentication data');
        }
      }
    },
  }
));

export type { User };