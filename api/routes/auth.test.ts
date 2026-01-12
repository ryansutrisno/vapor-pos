import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'
import crypto from 'crypto'

vi.mock('crypto', async () => {
  const actual = await import('crypto')
  return {
    ...actual,
    default: {
      ...actual,
      randomBytes: vi.fn((size: number) => {
        if (size === 32) {
          return Buffer.from('12345678901234567890123456789012', 'utf8')
        }
        return Buffer.alloc(size)
      }),
      randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012')
    },
    randomBytes: vi.fn((size: number) => {
      if (size === 32) {
        return Buffer.from('12345678901234567890123456789012', 'utf8')
      }
      return Buffer.alloc(size)
    }),
    randomUUID: vi.fn(() => 'test-uuid-1234-5678-9012')
  }
})

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
  is_trial_user: false,
  trial_started_at: null,
  trial_expires_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
}

describe('Trial Registration API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'users') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
            then: vi.fn()
          }
        }
        if (table === 'settings') {
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            is: vi.fn().mockResolvedValue({ data: [], error: null }),
            then: vi.fn()
          }
        }
        if (table === 'cash_sessions') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            update: vi.fn().mockResolvedValue({ error: null }),
            then: vi.fn()
          }
        }
        return { select: vi.fn().mockReturnThis() }
      }),
      auth: {
        admin: {
          createUser: vi.fn()
        }
      }
    }

    vi.doMock('../lib/supabase', () => ({
      supabase: mockSupabase
    }))

    const authRoutes = (await import('../routes/auth')).default
    
    app = express()
    app.use(express.json())
    app.use('/api/auth', authRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('POST /api/auth/register-trial', () => {
    it('should register a new trial user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register-trial')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          company: 'Test Company',
          phone: '081234567890',
          address: 'Test Address'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe('john@example.com')
    })

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register-trial')
        .send({
          name: 'John Doe',
          email: 'existing@example.com',
          password: 'password123',
          company: 'Test Company',
          phone: '081234567890'
        })

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('error', 'Email already registered')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register-trial')
        .send({
          name: 'John Doe',
          email: 'invalid-email',
          password: 'password123',
          company: 'Test Company',
          phone: '081234567890'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register-trial')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: '12345',
          company: 'Test Company',
          phone: '081234567890'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register-trial')
        .send({
          email: 'john@example.com'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'admin',
          tenant_id: '33333333-3333-3333-3333-333333333333',
          store_id: 'aaaa1111-1111-1111-1111-111111111111',
          company: 'Test Company',
          phone: '081234567891'
        })

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message', 'Registration successful')
      expect(response.body.user.email).toBe('jane@example.com')
      expect(response.body.user.role).toBe('admin')
    })

    it('should return 409 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'existing@example.com',
          password: 'password123',
          role: 'admin',
          tenant_id: '33333333-3333-3333-3333-333333333333'
        })

      expect(response.status).toBe(409)
      expect(response.body).toHaveProperty('error', 'Email already registered')
    })

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'invalid_role',
          tenant_id: '33333333-3333-3333-3333-333333333333'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should return 400 for invalid tenant_id format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'admin',
          tenant_id: 'invalid-uuid'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Login successful')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe('admin@test.com')
    })

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        })

      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Invalid email or password')
    })

    it('should return 403 for inactive user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'inactive@test.com',
          password: 'password123'
        })

      expect(response.status).toBe(403)
      expect(response.body).toHaveProperty('error', 'Account is inactive. Please contact administrator.')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          user_id: '11111111-1111-1111-1111-111111111111'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Logout successful')
    })

    it('should logout without user_id', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({})

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Logout successful')
    })
  })

  describe('POST /api/auth/verify-email', () => {
    it('should verify email successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'valid-token',
          email: 'test@example.com'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Email verified successfully. Your 14-day trial has started!')
      expect(response.body).toHaveProperty('trial_expires_at')
    })

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'invalid-token',
          email: 'test@example.com'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Invalid verification token')
    })

    it('should return 400 for already verified email', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'already-verified-token',
          email: 'alreadyverified@example.com'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email already verified')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'valid-token',
          email: 'invalid-email'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })

    it('should return 400 for missing token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          email: 'test@example.com'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })

  describe('POST /api/auth/resend-verification', () => {
    it('should resend verification email for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'unverified@example.com'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Verification email sent successfully')
    })

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'nonexistent@example.com'
        })

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error', 'User not found')
    })

    it('should return 400 for already verified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'alreadyverified@example.com'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email already verified')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'invalid-email'
        })

      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Validation failed')
    })
  })
})
