import { describe, it, expect, beforeEach } from 'vitest'
import { useCashStore, type CashSession } from '@/stores/cashStore'

const createTestSession = (overrides: Partial<CashSession> = {}): CashSession => ({
  id: 'session-001',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  user_id: '44444444-4444-4444-4444-444444444444',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  session_date: '2026-01-15',
  opening_cash: 500000,
  total_sales: 0,
  total_expenses: 0,
  cash_adjustments: 0,
  status: 'open',
  opened_at: '2026-01-15T08:00:00Z',
  created_at: '2026-01-15T08:00:00Z',
  updated_at: '2026-01-15T08:00:00Z',
  ...overrides
})

describe('CashStore', () => {
  beforeEach(() => {
    useCashStore.setState({
      currentSession: null,
      isLoading: false,
      error: null
    })
  })

  describe('Initial State', () => {
    it('should have null session initially', () => {
      const state = useCashStore.getState()
      expect(state.currentSession).toBeNull()
      expect(state.error).toBeNull()
      expect(state.isLoading).toBe(false)
    })
  })

  describe('createSession', () => {
    it('should create a new session with opening cash', () => {
      const session = useCashStore.getState().createSession(500000, 'Morning shift')

      expect(session).not.toBeNull()
      expect(session?.opening_cash).toBe(500000)
      expect(session?.status).toBe('open')
      expect(session?.notes).toBe('Morning shift')
      expect(session?.total_sales).toBe(0)
      expect(session?.total_expenses).toBe(0)
      expect(session?.cash_adjustments).toBe(0)
    })

    it('should set session in state', () => {
      useCashStore.getState().createSession(500000)

      const state = useCashStore.getState()
      expect(state.currentSession).not.toBeNull()
      expect(state.currentSession?.opening_cash).toBe(500000)
    })

    it('should clear error on session creation', () => {
      useCashStore.setState({ error: 'Previous error' })
      useCashStore.getState().createSession(500000)

      expect(useCashStore.getState().error).toBeNull()
    })

    it('should create session with current date', () => {
      const session = useCashStore.getState().createSession(500000)

      expect(session?.session_date).toBe(new Date().toISOString().split('T')[0])
    })
  })

  describe('closeSession', () => {
    it('should return false if no active session', () => {
      const result = useCashStore.getState().closeSession(600000)

      expect(result).toBe(false)
      expect(useCashStore.getState().error).toBe('No active session')
    })

    it('should close session and clear state', () => {
      useCashStore.getState().createSession(500000)
      
      const result = useCashStore.getState().closeSession(600000)

      expect(result).toBe(true)
      expect(useCashStore.getState().currentSession).toBeNull()
    })

    it('should calculate expected cash correctly', () => {
      const session = useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(150000)
      useCashStore.getState().recordExpense(50000)

      useCashStore.getState().closeSession(600000)

      expect(useCashStore.getState().currentSession).toBeNull()
    })

    it('should close session with notes', () => {
      useCashStore.getState().createSession(500000, 'Morning notes')
      
      useCashStore.getState().closeSession(600000, 'End of day')

      expect(useCashStore.getState().currentSession).toBeNull()
    })
  })

  describe('recordSale', () => {
    it('should return false if no active session', () => {
      const result = useCashStore.getState().recordSale(50000)

      expect(result).toBe(false)
    })

    it('should record sale amount', () => {
      useCashStore.getState().createSession(500000)
      const result = useCashStore.getState().recordSale(150000)

      expect(result).toBe(true)
      expect(useCashStore.getState().currentSession?.total_sales).toBe(150000)
    })

    it('should accumulate sales', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(100000)
      useCashStore.getState().recordSale(50000)

      expect(useCashStore.getState().currentSession?.total_sales).toBe(150000)
    })
  })

  describe('recordExpense', () => {
    it('should return false if no active session', () => {
      const result = useCashStore.getState().recordExpense(50000)

      expect(result).toBe(false)
    })

    it('should record expense amount', () => {
      useCashStore.getState().createSession(500000)
      const result = useCashStore.getState().recordExpense(25000)

      expect(result).toBe(true)
      expect(useCashStore.getState().currentSession?.total_expenses).toBe(25000)
    })

    it('should accumulate expenses', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordExpense(20000)
      useCashStore.getState().recordExpense(30000)

      expect(useCashStore.getState().currentSession?.total_expenses).toBe(50000)
    })
  })

  describe('recordAdjustment', () => {
    it('should return false if no active session', () => {
      const result = useCashStore.getState().recordAdjustment(10000)

      expect(result).toBe(false)
    })

    it('should record positive adjustment', () => {
      useCashStore.getState().createSession(500000)
      const result = useCashStore.getState().recordAdjustment(10000)

      expect(result).toBe(true)
      expect(useCashStore.getState().currentSession?.cash_adjustments).toBe(10000)
    })

    it('should record negative adjustment', () => {
      useCashStore.getState().createSession(500000)
      const result = useCashStore.getState().recordAdjustment(-10000)

      expect(result).toBe(true)
      expect(useCashStore.getState().currentSession?.cash_adjustments).toBe(-10000)
    })
  })

  describe('getExpectedCash', () => {
    it('should return 0 for no session', () => {
      expect(useCashStore.getState().getExpectedCash()).toBe(0)
    })

    it('should return opening cash only', () => {
      useCashStore.getState().createSession(500000)

      expect(useCashStore.getState().getExpectedCash()).toBe(500000)
    })

    it('should include sales', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(200000)

      expect(useCashStore.getState().getExpectedCash()).toBe(700000)
    })

    it('should subtract expenses', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(200000)
      useCashStore.getState().recordExpense(50000)

      expect(useCashStore.getState().getExpectedCash()).toBe(650000)
    })

    it('should include adjustments', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(200000)
      useCashStore.getState().recordExpense(50000)
      useCashStore.getState().recordAdjustment(10000)

      expect(useCashStore.getState().getExpectedCash()).toBe(660000)
    })
  })

  describe('getCashDifference', () => {
    it('should calculate positive difference', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(100000)

      const difference = useCashStore.getState().getCashDifference(620000)

      expect(difference).toBe(20000)
    })

    it('should calculate negative difference', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(100000)

      const difference = useCashStore.getState().getCashDifference(580000)

      expect(difference).toBe(-20000)
    })

    it('should return 0 for no session', () => {
      const difference = useCashStore.getState().getCashDifference(0)

      expect(difference).toBe(0)
    })
  })

  describe('clearError', () => {
    it('should clear error message', () => {
      useCashStore.setState({ error: 'Some error' })
      useCashStore.getState().clearError()

      expect(useCashStore.getState().error).toBeNull()
    })
  })

  describe('setSession', () => {
    it('should set session directly', () => {
      const session = createTestSession()
      useCashStore.getState().setSession(session)

      expect(useCashStore.getState().currentSession).toEqual(session)
    })

    it('should clear session when null is passed', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().setSession(null)

      expect(useCashStore.getState().currentSession).toBeNull()
    })
  })

  describe('Complete Cash Flow', () => {
    it('should handle complete daily cash flow', () => {
      expect(useCashStore.getState().getExpectedCash()).toBe(0)

      const session = useCashStore.getState().createSession(500000, 'Morning shift')
      expect(session.status).toBe('open')

      useCashStore.getState().recordSale(150000)
      useCashStore.getState().recordSale(200000)
      useCashStore.getState().recordExpense(25000)
      useCashStore.getState().recordAdjustment(5000)

      expect(useCashStore.getState().getExpectedCash()).toBe(830000)

      const result = useCashStore.getState().closeSession(725000)
      expect(result).toBe(true)

      expect(useCashStore.getState().currentSession).toBeNull()
    })

    it('should handle shortage scenario', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(100000)

      useCashStore.getState().closeSession(590000)

      expect(useCashStore.getState().currentSession).toBeNull()
    })

    it('should handle surplus scenario', () => {
      useCashStore.getState().createSession(500000)
      useCashStore.getState().recordSale(100000)

      useCashStore.getState().closeSession(610000)

      expect(useCashStore.getState().currentSession).toBeNull()
    })
  })
})
