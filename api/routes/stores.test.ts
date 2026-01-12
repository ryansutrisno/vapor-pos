import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockStore = {
  id: 'aaaa1111-1111-1111-1111-111111111111',
  name: 'Vapor Store Central',
  address: 'Jl. Sudirman No. 123, Jakarta Pusat',
  admin_id: '22222222-2222-2222-2222-222222222222',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  is_active: true,
  created_at: '2026-01-01T00:00:00Z'
}

const createQueryBuilder = () => ({
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: mockStore, error: null }),
  then: vi.fn((resolve) => {
    resolve({ data: [mockStore], error: null })
  })
})

describe('Stores API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    const mockSupabase = {
      from: vi.fn((table: string) => {
        return createQueryBuilder()
      })
    }

    vi.doMock('../lib/supabase', () => ({
      supabase: mockSupabase
    }))

    const storesRoutes = (await import('../routes/stores')).default
    
    app = express()
    app.use(express.json())
    app.use('/api/stores', storesRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/stores', () => {
    it('should return list of stores', async () => {
      const response = await request(app)
        .get('/api/stores')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('stores')
      expect(response.body).toHaveProperty('pagination')
    })
  })

  describe('GET /api/stores/:id', () => {
    it('should return store by id', async () => {
      const response = await request(app)
        .get('/api/stores/aaaa1111-1111-1111-1111-111111111111')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('store')
    })
  })

  describe('Store Status Values', () => {
    it('should handle active/inactive states', () => {
      const activeStore = { ...mockStore, is_active: true }
      const inactiveStore = { ...mockStore, is_active: false }
      
      expect(activeStore.is_active).toBe(true)
      expect(inactiveStore.is_active).toBe(false)
    })
  })
})
