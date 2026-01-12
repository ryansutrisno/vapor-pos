import { useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CashProvider } from './contexts/CashContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { StoreProvider } from './contexts/StoreContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { clearAuthStorage, setupStorageSync, validateSessionWithConnectivity } from './lib/auth';
import { supabase } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Order from './pages/Order';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import { useAuthStore } from './stores/authStore';

function App() {
  const { user, setUser, clearPersistedState, isHydrated, error } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for store hydration
        if (!isHydrated) {
          console.log('App - waiting for store hydration...');
          return;
        }

        console.log('App - initializing auth...');
        setIsLoading(true);

        // Get current session without triggering refresh
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.warn('App - session error during init:', sessionError);
          // Don't clear auth immediately, let user try to access pages
          setIsLoading(false);
          return;
        }

        if (session) {
          console.log('App - found existing session:', session.user.id);
          // Validate session in background to get proper user data
          validateSessionWithConnectivity().catch(error => {
            console.warn('Session validation failed during init:', error);
          });
        }

        setIsLoading(false);
        console.log('App - auth initialization complete');
      } catch (error) {
        console.error('App - auth initialization error:', error);
        setIsLoading(false);

        // Only clear auth if it's a critical error
        if (error instanceof Error && !error.message?.includes('Auth session missing')) {
          clearAuthStorage();
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('App - auth state change:', event, session?.user?.id);

      if (event === 'SIGNED_IN' && session) {
        // Let the auth validation handle setting the user with proper data
        validateSessionWithConnectivity().catch(console.warn);
      } else if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        clearAuthStorage();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('App - token refreshed successfully');
        validateSessionWithConnectivity().catch(console.warn);
      }
    });

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('App - back online, validating session');
      validateSessionWithConnectivity().catch(error => {
        console.warn('Session validation on reconnect failed:', error);
      });
    };

    window.addEventListener('online', handleOnline);

    // Setup storage sync for multi-tab support
    const removeStorageSync = setupStorageSync((syncedUser) => {
      if (syncedUser && (!user || user.email !== syncedUser.email)) {
        console.log('App - syncing user from another tab:', syncedUser.email);
        setUser(syncedUser);
      } else if (!syncedUser && user) {
        console.log('App - user cleared in another tab, logging out');
        clearPersistedState();
      }
    });

    return () => {
      subscription.unsubscribe();
      removeStorageSync();
      window.removeEventListener('online', handleOnline);
    };
  }, [isHydrated, setUser]);

  // Show loading state during auth initialization
  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {!isHydrated ? 'Initializing...' : 'Loading...'}
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2 max-w-md mx-auto">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <StoreProvider>
          <CashProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground transition-colors">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/order" element={<Order />} />
                  <Route path="/dashboard/*" element={<DashboardWithStoreCheck />} />
                </Routes>
              </div>
            </Router>
            <Toaster
              position="top-right"
              expand={true}
              richColors={true}
              closeButton={true}
              visibleToasts={5}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                },
              }}
            />
          </CashProvider>
        </StoreProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Component to handle store selection for kasir role
function DashboardWithStoreCheck() {
  const { user } = useAuthStore();

  // Kasir with assigned store_id should go directly to dashboard
  if (user?.role === 'kasir' && !user?.store_id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Store Belum Ditentukan</h2>
          <p className="text-muted-foreground mb-4">
            Akun kasir Anda belum ditentukan cabang toko oleh admin.
            Silakan hubungi admin untuk mengatur penugasan cabang toko.
          </p>
        </div>
      </div>
    );
  }

  // Wrap dashboard dengan StoreProvider dan CashProvider
  return (
    <StoreProvider>
      <CashProvider>
        <Dashboard />
      </CashProvider>
    </StoreProvider>
  );
}

export default App;
