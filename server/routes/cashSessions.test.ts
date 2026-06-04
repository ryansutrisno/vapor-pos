import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

const createQueryBuilder = () => {
  const query: Record<string, any> = {}
  const methods = ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'in', 'is', 'or', 'order', 'range', 'single', 'maybeSingle']
  methods.forEach(method => {
    query[method] = vi.fn().mockReturnValue(query)
  })
  query.count = { exact: 1 }
  query.then = vi.fn()
  return query
}

const mockSession = {
  id: 'session-001',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  user_id: '44444444-4444-4444-4444-444444444444',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  session_date: '2026-01-15',
  opening_cash: 500000,
  total_sales: 150000,
  total_expenses: 25000,
  cash_adjustments: 5000,
  status: 'open',
  opened_at: '2026-01-15T08:00:00Z',
  created_at: '2026-01-15T08:00:00Z',
  updated_at: '2026-01-15T08:00:00Z'
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'cash_sessions' || table === 'cash_expenses' || table === 'transactions') {
        return createQueryBuilder()
      }
      return { select: vi.fn().mockReturnThis() }
    })
  }
}))

describe('Cash Sessions API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    const cashRoutes = (await import('../routes/cashSessions')).default

    app = express()
    app.use(express.json())
    app.use('/api/cash-sessions', cashRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/cash-sessions', () => {
    it('should return list of cash sessions', async () => {
      const response = await request(app)
        .get('/api/cash-sessions')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('sessions')
      expect(response.body).toHaveProperty('pagination')
    })

    it('should filter by store_id', async () => {
      const response = await request(app)
        .get('/api/cash-sessions')
        .query({ store_id: 'aaaa1111-1111-1111-1111-111111111111' })

      expect(response.status).toBe(200)
    })

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/cash-sessions')
        .query({ status: 'open' })

      expect(response.status).toBe(200)
    })

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/cash-sessions')
        .query({ start_date: '2026-01-01', end_date: '2026-01-31' })

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/cash-sessions/today', () => {
    it('should return today session for store', async () => {
      const response = await request(app)
        .get('/api/cash-sessions/today')
        .query({ store_id: 'aaaa1111-1111-1111-1111-111111111111' })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('session')
    })

    it('should return 400 without store_id', async () => {
      const response = await request(app)
        .get('/api/cash-sessions/today')

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'store_id is required')
    })
  })

  describe('GET /api/cash-sessions/:id', () => {
    it('should return session by id', async () => {
      const response = await request(app)
        .get('/api/cash-sessions/session-001')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('session')
      expect(response.body.session.id).toBe('session-001')
    })
  })

  describe('POST /api/cash-sessions', () => {
    it('should create new cash session', async () => {
      const response = await request(app)
        .post('/api/cash-sessions')
        .send({
          store_id: 'aaaa1111-1111-1111-1111-111111111111',
          opening_cash: 500000,
          notes: 'Morning shift',
          user_id: '44444444-4444-4444-4444-444444444444',
          tenant_id: '33333333-3333-3333-3333-333333333333'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message', 'Cash session created successfully')
      expect(response.body).toHaveProperty('session')
    })

    it('should return 400 for invalid store_id', async () => {
      const response = await request(app)
        .post('/api/cash-sessions')
        .send({
          store_id: 'invalid-uuid',
          opening_cash: 500000
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for negative opening cash', async () => {
      const response = await request(app)
        .post('/api/cash-sessions')
        .send({
          store_id: 'aaaa1111-1111-1111-1111-111111111111',
          opening_cash: -1000
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 without user_id', async () => {
      const response = await request(app)
        .post('/api/cash-sessions')
        .send({
          store_id: 'aaaa1111-1111-1111-1111-111111111111',
          opening_cash: 500000
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/cash-sessions/:id/close', () => {
    it('should close session with reconciliation', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/close')
        .send({
          closing_cash: 625000,
          notes: 'End of day'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Cash session closed successfully')
      expect(response.body).toHaveProperty('reconciliation')
    })

    it('should return 400 for negative closing cash', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/close')
        .send({
          closing_cash: -1000
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/cash-sessions/:id/record', () => {
    it('should record sale', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/record')
        .send({
          amount: 50000,
          type: 'sale',
          description: 'Cash sale'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'sale recorded successfully')
    })

    it('should record expense', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/record')
        .send({
          amount: 10000,
          type: 'expense',
          description: 'Office supplies'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'expense recorded successfully')
    })

    it('should record adjustment', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/record')
        .send({
          amount: 5000,
          type: 'adjustment',
          description: 'Cash count adjustment'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'adjustment recorded successfully')
    })

    it('should return 400 for negative amount', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/record')
        .send({
          amount: -1000,
          type: 'sale'
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/cash-sessions/session-001/record')
        .send({
          amount: 10000,
          type: 'invalid_type'
        })

      expect(response.status).toBe(400)
    })
  })
})
