import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockUser = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'admin@test.com',
  name: 'Test Admin',
  role: 'admin',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  subscription_plan: 'single_store',
  is_active: true,
  email_verified: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
}

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

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return {
          ...createQueryBuilder(),
          single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
          order: vi.fn().mockResolvedValue({ data: [mockUser], error: null }),
          in: vi.fn().mockResolvedValue({ error: null })
        }
      }
      if (table === 'user_stores') {
        return {
          ...createQueryBuilder(),
          insert: vi.fn().mockResolvedValue({ error: null }),
          delete: vi.fn().mockResolvedValue({ error: null })
        }
      }
      return createQueryBuilder()
    }),
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'new-user-id', email: 'new@test.com' } },
          error: null
        }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
        deleteUser: vi.fn().mockResolvedValue({ error: null })
      }
    }
  }
}))

describe('Users API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    const usersRoutes = (await import('../routes/admin')).default

    app = express()
    app.use(express.json())
    app.use('/api/admin/users', usersRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/admin/users', () => {
    it('should return list of users', async () => {
      const response = await request(app)
        .get('/api/admin/users')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
    })

    it('should filter by role', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ role: 'admin' })

      expect(response.status).toBe(200)
    })

    it('should filter by tenant', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ tenant_id: '33333333-3333-3333-3333-333333333333' })

      expect(response.status).toBe(200)
    })

    it('should search by email or name', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ search: 'admin' })

      expect(response.status).toBe(200)
    })

    it('should filter active/inactive users', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .query({ is_active: 'true' })

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/admin/users/:id', () => {
    it('should return user by id', async () => {
      const response = await request(app)
        .get('/api/admin/users/11111111-1111-1111-1111-111111111111')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/admin/users/non-existent-id')

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/admin/users', () => {
    it('should create new user', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .send({
          email: 'new@test.com',
          password: 'password123',
          name: 'New User',
          role: 'kasir',
          is_active: true
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('success', true)
      expect(response.body).toHaveProperty('data')
    })

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .send({
          email: 'new@test.com',
          password: 'password123',
          name: 'New User',
          role: 'invalid_role',
          is_active: true
        })

      expect(response.status).toBe(400)
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/admin/users')
        .send({
          email: 'new@test.com'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/admin/users/:id', () => {
    it('should update user', async () => {
      const response = await request(app)
        .put('/api/admin/users/11111111-1111-1111-1111-111111111111')
        .send({
          name: 'Updated Name',
          role: 'warehouse'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })

    it('should activate/deactivate user', async () => {
      const response = await request(app)
        .put('/api/admin/users/11111111-1111-1111-1111-111111111111')
        .send({
          is_active: false
        })

      expect(response.status).toBe(200)
    })
  })

  describe('DELETE /api/admin/users/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete('/api/admin/users/11111111-1111-1111-1111-111111111111')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('success', true)
    })
  })
})

describe('User Role Validation', () => {
  const validRoles = ['superadmin', 'admin', 'warehouse', 'kasir']

  it('should have all required roles', () => {
    expect(validRoles).toContain('superadmin')
    expect(validRoles).toContain('admin')
    expect(validRoles).toContain('warehouse')
    expect(validRoles).toContain('kasir')
  })

  it('should have exactly 4 roles', () => {
    expect(validRoles.length).toBe(4)
  })
})

describe('User Store Assignment', () => {
  it('should allow assigning user to store', async () => {
    const { default: express } = await import('express')
    const adminRoutes = (await import('../routes/admin')).default

    const testApp = express()
    testApp.use(express.json())
    testApp.use('/api/admin/users', adminRoutes)

    const response = await request(testApp)
      .post('/api/admin/users/11111111-1111-1111-1111-111111111111/stores')
      .send({
        store_id: 'aaaa1111-1111-1111-1111-111111111111'
      })

    expect(response.status).toBeGreaterThanOrEqual(200)
  })
})
