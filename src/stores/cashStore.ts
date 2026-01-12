import { create } from 'zustand'

export interface CashSession {
  id: string
  store_id: string
  user_id: string
  tenant_id: string
  session_date: string
  opening_cash: number
  closing_cash?: number
  expected_cash?: number
  cash_difference?: number
  total_sales: number
  total_expenses: number
  cash_adjustments: number
  notes?: string
  status: 'open' | 'closed'
  opened_at: string
  closed_at?: string
  created_at: string
  updated_at: string
}

interface CashState {
  currentSession: CashSession | null
  isLoading: boolean
  error: string | null

  createSession: (openingCash: number, notes?: string) => CashSession | null
  closeSession: (closingCash: number, notes?: string) => boolean
  setSession: (session: CashSession | null) => void
  recordSale: (amount: number) => boolean
  recordExpense: (amount: number) => boolean
  recordAdjustment: (amount: number) => boolean
  getExpectedCash: () => number
  getCashDifference: (actualCash: number) => number
  clearError: () => void
}

export const useCashStore = create<CashState>()((set, get) => ({
  currentSession: null,
  isLoading: false,
  error: null,

  createSession: (openingCash: number, notes?: string) => {
    const session: CashSession = {
      id: crypto.randomUUID(),
      store_id: 'default-store',
      user_id: 'default-user',
      tenant_id: 'default-tenant',
      session_date: new Date().toISOString().split('T')[0],
      opening_cash: openingCash,
      total_sales: 0,
      total_expenses: 0,
      cash_adjustments: 0,
      notes: notes,
      status: 'open',
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    set({ currentSession: session, error: null })
    return session
  },

  closeSession: (closingCash: number, notes?: string) => {
    const session = get().currentSession
    if (!session) {
      set({ error: 'No active session' })
      return false
    }

    const expectedCash = get().getExpectedCash()
    const cashDifference = closingCash - expectedCash

    const closedSession: CashSession = {
      ...session,
      closing_cash: closingCash,
      expected_cash: expectedCash,
      cash_difference: cashDifference,
      notes: notes || session.notes,
      status: 'closed',
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    set({ currentSession: null, error: null })
    return true
  },

  setSession: (session: CashSession | null) => {
    set({ currentSession: session, error: null })
  },

  recordSale: (amount: number) => {
    const session = get().currentSession
    if (!session || session.status !== 'open') {
      set({ error: 'No active session' })
      return false
    }

    const updatedSession: CashSession = {
      ...session,
      total_sales: session.total_sales + amount,
      updated_at: new Date().toISOString()
    }

    set({ currentSession: updatedSession, error: null })
    return true
  },

  recordExpense: (amount: number) => {
    const session = get().currentSession
    if (!session || session.status !== 'open') {
      set({ error: 'No active session' })
      return false
    }

    const updatedSession: CashSession = {
      ...session,
      total_expenses: session.total_expenses + amount,
      updated_at: new Date().toISOString()
    }

    set({ currentSession: updatedSession, error: null })
    return true
  },

  recordAdjustment: (amount: number) => {
    const session = get().currentSession
    if (!session || session.status !== 'open') {
      set({ error: 'No active session' })
      return false
    }

    const updatedSession: CashSession = {
      ...session,
      cash_adjustments: session.cash_adjustments + amount,
      updated_at: new Date().toISOString()
    }

    set({ currentSession: updatedSession, error: null })
    return true
  },

  getExpectedCash: () => {
    const session = get().currentSession
    if (!session) return 0

    return session.opening_cash +
           session.total_sales -
           session.total_expenses +
           session.cash_adjustments
  },

  getCashDifference: (actualCash: number) => {
    return actualCash - get().getExpectedCash()
  },

  clearError: () => {
    set({ error: null })
  }
}))

export type { CashState }
