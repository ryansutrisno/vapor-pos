import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { createUser } from '@/test/factories/testData'
import { setupLocalStorageMock } from '@/test/mocks/supabaseMock'

const TEST_USER = createUser({
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@test.com',
  name: 'Test User',
  role: 'admin',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  is_active: true
})

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupLocalStorageMock({})
    localStorage.clear()
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      error: null
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
      expect(state.isHydrated).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('setUser', () => {
    it('should set user and update isAuthenticated to true', () => {
      useAuthStore.getState().setUser(TEST_USER)

      const state = useAuthStore.getState()
      expect(state.user).toEqual(TEST_USER)
      expect(state.isAuthenticated).toBe(true)
      expect(state.error).toBeNull()
    })

    it('should set user to null and isAuthenticated to false', () => {
      useAuthStore.getState().setUser(TEST_USER)
      useAuthStore.getState().setUser(null)

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should clear error when setting user', () => {
      useAuthStore.getState().setError('Some error')
      useAuthStore.getState().setUser(TEST_USER)

      const state = useAuthStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      useAuthStore.getState().setUser(TEST_USER)
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.user).toBeNull()
      expect(state.isAuthenticated).toBe(false)
    })

    it('should clear error on logout', () => {
      useAuthStore.getState().setUser(TEST_USER)
      useAuthStore.getState().setError('Some error')
      useAuthStore.getState().logout()

      const state = useAuthStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('setError', () => {
    it('should set error message', () => {
      useAuthStore.getState().setError('Login failed')

      const state = useAuthStore.getState()
      expect(state.error).toBe('Login failed')
    })

    it('should clear error when set to null', () => {
      useAuthStore.getState().setError('Login failed')
      useAuthStore.getState().setError(null)

      const state = useAuthStore.getState()
      expect(state.error).toBeNull()
    })
  })

  describe('setHydrated', () => {
    it('should set isHydrated to true', () => {
      expect(useAuthStore.getState().isHydrated).toBe(false)
      useAuthStore.getState().setHydrated(true)
      expect(useAuthStore.getState().isHydrated).toBe(true)
    })

    it('should set isHydrated to false', () => {
      useAuthStore.getState().setHydrated(true)
      useAuthStore.getState().setHydrated(false)
      expect(useAuthStore.getState().isHydrated).toBe(false)
    })
  })

  describe('User Data Integrity', () => {
    it('should preserve all user properties', () => {
      const fullUser = createUser({
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        tenant_id: '33333333-3333-3333-3333-333333333333',
        store_id: 'aaaa1111-1111-1111-1111-111111111111',
        subscription_plan: 'single_store',
        is_active: true
      })

      useAuthStore.getState().setUser(fullUser)

      const state = useAuthStore.getState()
      expect(state.user?.id).toBe(fullUser.id)
      expect(state.user?.email).toBe(fullUser.email)
      expect(state.user?.name).toBe(fullUser.name)
      expect(state.user?.role).toBe(fullUser.role)
      expect(state.user?.tenant_id).toBe(fullUser.tenant_id)
      expect(state.user?.store_id).toBe(fullUser.store_id)
      expect(state.user?.subscription_plan).toBe(fullUser.subscription_plan)
      expect(state.user?.is_active).toBe(fullUser.is_active)
    })

    it('should handle different user roles correctly', () => {
      const roles = ['superadmin', 'admin', 'warehouse', 'kasir'] as const

      roles.forEach(role => {
        const user = createUser({ role })
        useAuthStore.getState().setUser(user)
        expect(useAuthStore.getState().user?.role).toBe(role)
        expect(useAuthStore.getState().isAuthenticated).toBe(true)
      })
    })

    it('should handle superadmin with null tenant_id', () => {
      const superadmin = createUser({
        role: 'superadmin',
        tenant_id: null
      })

      useAuthStore.getState().setUser(superadmin)

      expect(useAuthStore.getState().user?.role).toBe('superadmin')
      expect(useAuthStore.getState().user?.tenant_id).toBeNull()
    })
  })

  describe('State Transitions', () => {
    it('should handle complete auth flow', () => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false)

      useAuthStore.getState().setUser(TEST_USER)
      expect(useAuthStore.getState().isAuthenticated).toBe(true)

      useAuthStore.getState().setError('Session expired')
      expect(useAuthStore.getState().error).toBe('Session expired')

      useAuthStore.getState().logout()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      expect(useAuthStore.getState().error).toBeNull()
    })

    it('should handle multiple setUser calls', () => {
      const user1 = createUser({ email: 'user1@test.com' })
      const user2 = createUser({ email: 'user2@test.com' })

      useAuthStore.getState().setUser(user1)
      expect(useAuthStore.getState().user?.email).toBe('user1@test.com')

      useAuthStore.getState().setUser(user2)
      expect(useAuthStore.getState().user?.email).toBe('user2@test.com')

      useAuthStore.getState().setUser(null)
      expect(useAuthStore.getState().user).toBeNull()
    })
  })
})
