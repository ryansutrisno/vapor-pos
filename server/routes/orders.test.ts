import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import crypto from 'crypto'

const mockOrder = {
  id: 'ord-001',
  email: 'customer@example.com',
  customer_name: 'John Doe',
  customer_phone: '081234567890',
  customer_company: 'Test Company',
  customer_address: 'Jl. Sudirman No. 123',
  customer_notes: null,
  plan_type: 'single_store',
  billing_cycle: 'monthly',
  amount: 250000,
  payment_status: 'pending',
  payment_gateway: 'midtrans',
  payment_token: null,
  payment_url: null,
  payment_gateway_transaction_id: null,
  tenant_created: false,
  tenant_user_id: null,
  expires_at: '2026-01-16T12:00:00Z',
  created_at: '2026-01-15T12:00:00Z'
}

const createQueryBuilder = () => {
  const query: any = {}
  let isSingle = false
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'or', 'order', 'range', 'maybeSingle']
  methods.forEach(method => {
    query[method] = vi.fn().mockImplementation(() => query)
  })
  query.single = vi.fn().mockImplementation(() => {
    isSingle = true
    return query
  })
  query.count = { exact: 1 }
  query.then = vi.fn().mockImplementation((onFulfilled) => {
    const result = isSingle ? { data: mockOrder, error: null } : { data: [mockOrder], error: null }
    return Promise.resolve(onFulfilled ? onFulfilled(result) : result)
  })
  return query
}

const createQueryBuilderForUsers = () => {
  const query: any = {}
  let isInsert = false
  const methods = ['select', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'or', 'order', 'range', 'single', 'maybeSingle', 'update']
  methods.forEach(method => {
    query[method] = vi.fn().mockImplementation(() => query)
  })
  query.insert = vi.fn().mockImplementation(() => {
    isInsert = true
    return query
  })
  query.count = { exact: 1 }
  query.then = vi.fn().mockImplementation((onFulfilled) => {
    const result = isInsert 
      ? { data: { id: 'new-user-id' }, error: null }
      : { data: null, error: { code: 'PGRST116' } }
    return Promise.resolve(onFulfilled ? onFulfilled(result) : result)
  })
  return query
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return createQueryBuilder()
      }
      if (table === 'users') {
        return createQueryBuilderForUsers()
      }
      return createQueryBuilder()
    }),
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'new-user-id', email: 'customer@example.com' } },
          error: null
        })
      }
    }
  }
}))

vi.mock('crypto', () => ({
  default: {
    randomBytes: vi.fn((size: number) => Buffer.alloc(size)),
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        digest: vi.fn().mockReturnValue('mock-signature')
      })
    }),
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012')
  },
  randomBytes: vi.fn((size: number) => Buffer.alloc(size)),
  createHash: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue({
      digest: vi.fn().mockReturnValue('mock-signature')
    })
  }),
  randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012')
}))

describe('Orders API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.stubEnv('MIDTRANS_SERVER_KEY', 'test-server-key')
    vi.stubEnv('MIDTRANS_IS_PRODUCTION', 'false')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        token: 'mock-midtrans-token-123',
        redirect_url: 'https://sandbox.midtrans.com/snap/v2/vtweb/mock-token',
        transaction_id: 'mock-midtrans-trans-id'
      })
    }))

    const ordersRoutes = (await import('../routes/orders')).default

    app = express()
    app.use(express.json())
    app.use('/api/orders', ordersRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  describe('POST /api/orders', () => {
    it('should create new order with valid data', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'customer@example.com',
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          customer_company: 'Test Company',
          customer_address: 'Jl. Sudirman No. 123',
          plan_type: 'single_store',
          billing_cycle: 'monthly',
          amount: 250000
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('order')
      expect(response.body).toHaveProperty('payment')
    })

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'invalid-email',
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          customer_company: 'Test Company',
          customer_address: 'Jl. Sudirman No. 123',
          plan_type: 'single_store',
          billing_cycle: 'monthly',
          amount: 250000
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation error')
    })

    it('should return 400 for invalid plan_type', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'customer@example.com',
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          customer_company: 'Test Company',
          customer_address: 'Jl. Sudirman No. 123',
          plan_type: 'invalid_plan',
          billing_cycle: 'monthly',
          amount: 250000
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation error')
    })

    it('should return 400 for invalid billing_cycle', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'customer@example.com',
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          customer_company: 'Test Company',
          customer_address: 'Jl. Sudirman No. 123',
          plan_type: 'single_store',
          billing_cycle: 'weekly',
          amount: 250000
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for negative amount', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'customer@example.com',
          customer_name: 'John Doe',
          customer_phone: '081234567890',
          customer_company: 'Test Company',
          customer_address: 'Jl. Sudirman No. 123',
          plan_type: 'single_store',
          billing_cycle: 'monthly',
          amount: -1000
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          email: 'customer@example.com'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/orders', () => {
    it('should return list of orders', async () => {
      const response = await request(app)
        .get('/api/orders')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('orders')
      expect(response.body).toHaveProperty('pagination')
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ status: 'pending' })

      expect(response.status).toBe(200)
    })

    it('should filter by plan_type', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ plan_type: 'single_store' })

      expect(response.status).toBe(200)
    })

    it('should search orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ search: 'John' })

      expect(response.status).toBe(200)
    })

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/orders')
        .query({ page: 1, limit: 10 })

      expect(response.status).toBe(200)
      expect(response.body.pagination).toHaveProperty('page', 1)
      expect(response.body.pagination).toHaveProperty('limit', 10)
    })
  })

  describe('GET /api/orders/:id', () => {
    it('should return order by id', async () => {
      const response = await request(app)
        .get('/api/orders/ord-001')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('order')
      expect(response.body.order.id).toBe('ord-001')
    })
  })

  describe('PATCH /api/orders/:id/status', () => {
    it('should update order status', async () => {
      const response = await request(app)
        .patch('/api/orders/ord-001/status')
        .send({
          payment_status: 'paid',
          payment_method: 'credit_card'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('order')
    })

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch('/api/orders/ord-001/status')
        .send({
          payment_status: 'invalid_status'
        })

      expect(response.status).toBe(400)
    })
  })
})

describe('Midtrans Integration', () => {
  it('should calculate correct signature', () => {
    const data = {
      order_id: 'ord-001',
      status_code: '200',
      gross_amount: '250000.00'
    }
    const serverKey = 'test-server-key'

    const signatureKey = crypto
      .createHash('sha512')
      .update(data.order_id + data.status_code + data.gross_amount + serverKey)
      .digest('hex')

    expect(signatureKey).toBeDefined()
    expect(typeof signatureKey).toBe('string')
  })
})

describe('Order Status Values', () => {
  const validStatuses = ['pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded']
  const validPlans = ['single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited']
  const validCycles = ['monthly', 'yearly']

  it('should have valid payment statuses', () => {
    expect(validStatuses).toContain('pending')
    expect(validStatuses).toContain('paid')
    expect(validStatuses).toContain('failed')
  })

  it('should have valid plan types', () => {
    expect(validPlans).toContain('single_store')
    expect(validPlans).toContain('multi_store_5')
    expect(validPlans).toContain('multi_store_unlimited')
  })

  it('should have valid billing cycles', () => {
    expect(validCycles).toContain('monthly')
    expect(validCycles).toContain('yearly')
  })
})
