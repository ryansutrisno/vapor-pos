/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { useStoreId } from './StoreContext';
import { toast } from '@/lib/toast';

interface CashSession {
  id: string;
  store_id: string;
  user_id: string;
  tenant_id: string;
  session_date: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  total_sales: number;
  total_expenses: number;
  cash_adjustments: number;
  notes?: string;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
}

interface CashContextType {
  currentSession: CashSession | null;
  isSessionActive: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Session management
  createSession: (openingCash: number, notes?: string) => Promise<CashSession | null>;
  closeSession: (closingCash: number, notes?: string) => Promise<boolean>;
  refreshSession: () => Promise<void>;
  
  // Cash operations
  recordSale: (amount: number, transactionId: string) => Promise<boolean>;
  recordExpense: (amount: number, description: string) => Promise<boolean>;
  recordAdjustment: (amount: number, description: string) => Promise<boolean>;
  
  // Calculations
  getExpectedCash: () => number;
  getCashDifference: (actualCash: number) => number;
}

const CashContext = createContext<CashContextType | undefined>(undefined);

export const useCash = (): CashContextType => {
  const context = useContext(CashContext);
  if (!context) {
    throw new Error('useCash must be used within a CashProvider');
  }
  return context;
};

interface CashProviderProps {
  children: ReactNode;
}

export const CashProvider: React.FC<CashProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const storeId = useStoreId();

  const isSessionActive = currentSession?.status === 'open';

  // Load current session on mount and when store changes
  useEffect(() => {
    if (user && storeId) {
      loadCurrentSession();
    } else {
      setCurrentSession(null);
    }
  }, [user, storeId]);

  const loadCurrentSession = async () => {
    if (!user || !storeId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error: fetchError } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('store_id', storeId)
        .eq('session_date', today)
        .eq('status', 'open')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setCurrentSession(data || null);
    } catch (err: any) {
      console.error('Error loading cash session:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (openingCash: number, notes?: string): Promise<CashSession | null> => {
    if (!user || !storeId) {
      setError('User atau store tidak ditemukan');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check for existing session
      const { data: existingSession } = await supabase
        .from('cash_sessions')
        .select('*')
        .eq('store_id', storeId)
        .eq('session_date', today)
        .eq('status', 'open')
        .single();

      if (existingSession) {
        setError('Sudah ada sesi kas yang aktif untuk hari ini');
        return null;
      }

      const { data: newSession, error: insertError } = await supabase
        .from('cash_sessions')
        .insert({
          store_id: storeId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          session_date: today,
          opening_cash: openingCash,
          notes: notes?.trim() || null,
          status: 'open'
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      setCurrentSession(newSession);
      toast.success(`Sesi kas berhasil dibuka dengan cash awal Rp ${openingCash.toLocaleString('id-ID')}`);
      return newSession;
      
    } catch (err: any) {
      console.error('Error creating cash session:', err);
      setError(err.message);
      toast.error('Gagal membuat sesi kas');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const closeSession = async (closingCash: number, notes?: string): Promise<boolean> => {
    if (!currentSession) {
      setError('Tidak ada sesi kas yang aktif');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const expectedCash = getExpectedCash();
      const cashDifference = closingCash - expectedCash;

      const { error: updateError } = await supabase
        .from('cash_sessions')
        .update({
          closing_cash: closingCash,
          expected_cash: expectedCash,
          cash_difference: cashDifference,
          notes: notes?.trim() || currentSession.notes,
          status: 'closed',
          closed_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      if (updateError) {
        throw updateError;
      }

      setCurrentSession(null);
      toast.success('Sesi kas berhasil ditutup');
      return true;
      
    } catch (err: any) {
      console.error('Error closing cash session:', err);
      setError(err.message);
      toast.error('Gagal menutup sesi kas');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    await loadCurrentSession();
  };

  const recordSale = async (amount: number, transactionId: string): Promise<boolean> => {
    if (!currentSession) return false;

    try {
      const { error: updateError } = await supabase
        .from('cash_sessions')
        .update({
          total_sales: currentSession.total_sales + amount
        })
        .eq('id', currentSession.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCurrentSession(prev => prev ? {
        ...prev,
        total_sales: prev.total_sales + amount
      } : null);

      return true;
    } catch (err: any) {
      console.error('Error recording sale:', err);
      return false;
    }
  };

  const recordExpense = async (amount: number, description: string): Promise<boolean> => {
    if (!currentSession) return false;

    try {
      const { error: updateError } = await supabase
        .from('cash_sessions')
        .update({
          total_expenses: currentSession.total_expenses + amount
        })
        .eq('id', currentSession.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCurrentSession(prev => prev ? {
        ...prev,
        total_expenses: prev.total_expenses + amount
      } : null);

      return true;
    } catch (err: any) {
      console.error('Error recording expense:', err);
      return false;
    }
  };

  const recordAdjustment = async (amount: number, description: string): Promise<boolean> => {
    if (!currentSession) return false;

    try {
      const { error: updateError } = await supabase
        .from('cash_sessions')
        .update({
          cash_adjustments: currentSession.cash_adjustments + amount
        })
        .eq('id', currentSession.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setCurrentSession(prev => prev ? {
        ...prev,
        cash_adjustments: prev.cash_adjustments + amount
      } : null);

      return true;
    } catch (err: any) {
      console.error('Error recording adjustment:', err);
      return false;
    }
  };

  const getExpectedCash = (): number => {
    if (!currentSession) return 0;
    
    return currentSession.opening_cash + 
           currentSession.total_sales - 
           currentSession.total_expenses + 
           currentSession.cash_adjustments;
  };

  const getCashDifference = (actualCash: number): number => {
    return actualCash - getExpectedCash();
  };

  const value: CashContextType = {
    currentSession,
    isSessionActive,
    isLoading,
    error,
    createSession,
    closeSession,
    refreshSession,
    recordSale,
    recordExpense,
    recordAdjustment,
    getExpectedCash,
    getCashDifference
  };

  return (
    <CashContext.Provider value={value}>
      {children}
    </CashContext.Provider>
  );
};

export default CashProvider;