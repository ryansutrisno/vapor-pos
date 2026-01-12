import { vi } from 'vitest'

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    refreshSession: vi.fn(),
    getUser: vi.fn(),
    onAuthStateChange: vi.fn(),
    admin: {
      createUser: vi.fn(),
      updateUser: vi.fn(),
      deleteUser: vi.fn(),
      getUserById: vi.fn(),
      listUsers: vi.fn(),
    },
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn(),
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn(),
      list: vi.fn(),
      getPublicUrl: vi.fn(),
    })),
  },
  rpc: vi.fn(),
}

export const createMockUser = (overrides = {}) => ({
  id: '11111111-1111-1111-1111-111111111111',
  email: 'test@test.com',
  name: 'Test User',
  role: 'admin' as const,
  tenant_id: '33333333-3333-3333-3333-333333333333',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  subscription_plan: 'trial',
  is_active: true,
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

export const createMockSession = (overrides = {}) => ({
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: 1736942400,
  user: createMockUser(),
  ...overrides,
})

export const createMockProduct = (overrides = {}) => ({
  id: 'p0010001-1111-1111-1111-111111111111',
  name: 'SMOK Nord 4',
  category: 'device',
  price: 450000,
  stock: 25,
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  image_url: 'https://example.com/image.jpg',
  description: 'Pod system dengan battery 2000mAh',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

export const createMockStore = (overrides = {}) => ({
  id: 'aaaa1111-1111-1111-1111-111111111111',
  name: 'Vapor Store Central',
  address: 'Jl. Sudirman No. 123, Jakarta Pusat',
  admin_id: '22222222-2222-2222-2222-222222222222',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
  id: 'tx001-1111-1111-1111-111111111111',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  cashier_id: '44444444-4444-4444-4444-444444444444',
  customer_name: 'John Doe',
  total_amount: 535000,
  payment_method: 'cash',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  created_at: '2026-01-15T12:00:00Z',
  ...overrides,
})

export const createMockCartItem = (overrides = {}) => ({
  id: 'cart001',
  product: createMockProduct(),
  quantity: 2,
  subtotal: 900000,
  ...overrides,
})

export const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}

export const setupLocalStorageMock = (initialData: Record<string, string> = {}) => {
  mockLocalStorage.getItem.mockImplementation((key: string) => {
    return initialData[key] || null
  })
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}
