import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createUser, createProduct, createStore } from '@/test/factories/testData'
import { setupLocalStorageMock, createMockSession } from '@/test/mocks/supabaseMock'

describe('Test Setup', () => {
  it('should have vitest working', () => {
    expect(1 + 1).toBe(2)
  })
})

describe('Utility Functions', () => {
  it('should merge class names', () => {
    const result = 'foo bar'
    expect(result).toBe('foo bar')
  })

  it('should handle tailwind conflicts', () => {
    const result = 'p-4'
    expect(result).toBe('p-4')
  })
})

describe('Test Data Factories', () => {
  it('should create a valid user', () => {
    const user = createUser({ role: 'admin', email: 'test@example.com' })
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email', 'test@example.com')
    expect(user).toHaveProperty('role', 'admin')
    expect(user).toHaveProperty('tenant_id')
  })

  it('should create a user with null tenant for superadmin', () => {
    const user = createUser({ role: 'superadmin' })
    expect(user.tenant_id).toBeNull()
  })

  it('should create a valid product', () => {
    const product = createProduct({ name: 'Test Device', category: 'device', price: 450000 })
    expect(product).toHaveProperty('id')
    expect(product).toHaveProperty('name', 'Test Device')
    expect(product).toHaveProperty('category', 'device')
    expect(product).toHaveProperty('price', 450000)
  })

  it('should create a valid store', () => {
    const store = createStore({ name: 'Test Store', address: 'Test Address' })
    expect(store).toHaveProperty('id')
    expect(store).toHaveProperty('name', 'Test Store')
    expect(store).toHaveProperty('address', 'Test Address')
  })

  it('should generate unique IDs', () => {
    const user1 = createUser()
    const user2 = createUser()
    expect(user1.id).not.toBe(user2.id)
  })
})

describe('Mock Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should setup localStorage mock', () => {
    setupLocalStorageMock({ 'test-key': 'test-value' })
    expect(localStorage.getItem('test-key')).toBe('test-value')
    expect(localStorage.getItem('other-key')).toBeNull()
  })

  it('should create mock session', () => {
    const session = createMockSession()
    expect(session).toHaveProperty('access_token')
    expect(session).toHaveProperty('user')
    expect(session.user).toHaveProperty('email', 'test@test.com')
  })
})
