import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express from 'express'

const mockProduct = {
  id: 'p001-1111-1111-1111-111111111111',
  name: 'SMOK Nord 4',
  category: 'device',
  price: 450000,
  stock: 25,
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  image_url: null,
  description: 'Pod system dengan battery 2000mAh',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
}

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'products') {
        const query: any = {}
        const chainMethods = ['select', 'eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'ilike', 'like', 'in', 'is', 'or', 'order']
        chainMethods.forEach(method => {
          query[method] = vi.fn().mockReturnThis()
        })
        query.range = vi.fn().mockResolvedValue({ data: [mockProduct], error: null, count: 1 })
        query.single = vi.fn().mockResolvedValue({ data: mockProduct, error: null })
        query.maybeSingle = vi.fn().mockResolvedValue({ data: mockProduct, error: null })
        query.update = vi.fn().mockReturnThis()
        query.insert = vi.fn().mockReturnThis()
        query.delete = vi.fn().mockReturnThis()
        query.then = vi.fn((resolve, reject) => {
          resolve({ data: mockProduct, error: null })
        })
        return query
      }
      return { select: vi.fn().mockReturnThis() }
    })
  }
}))

describe('Products API', () => {
  let app: express.Express

  beforeEach(async () => {
    vi.resetModules()
    vi.clearAllMocks()

    const productsRoutes = (await import('../routes/products')).default

    app = express()
    app.use(express.json())
    app.use('/api/products', productsRoutes)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return list of products', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ page: 1, limit: 20 })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('products')
      expect(response.body).toHaveProperty('pagination')
    })

    it('should filter products by store_id', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ store_id: 'aaaa1111-1111-1111-1111-111111111111' })

      expect(response.status).toBe(200)
    })

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ category: 'device' })

      expect(response.status).toBe(200)
    })

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products')
        .query({ search: 'SMOK' })

      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/products/:id', () => {
    it('should return product by id', async () => {
      const response = await request(app)
        .get('/api/products/p001-1111-1111-1111-111111111111')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('product')
      expect(response.body.product.id).toBe('p001-1111-1111-1111-111111111111')
    })

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/non-existent-id')

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const newProduct = {
        name: 'Vaporesso XROS',
        category: 'device',
        price: 350000,
        stock: 30,
        store_id: 'aaaa1111-1111-1111-1111-111111111111',
        description: 'Pod system dengan adjustable airflow'
      }

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)

      expect(response.status).toBe(201)
      expect(response.body).toHaveProperty('message', 'Product created successfully')
      expect(response.body).toHaveProperty('product')
    })

    it('should return 400 for invalid category', async () => {
      const newProduct = {
        name: 'Test Product',
        category: 'invalid_category',
        price: 100000,
        stock: 10,
        store_id: 'aaaa1111-1111-1111-1111-111111111111'
      }

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)

      expect(response.status).toBe(400)
    })

    it('should return 400 for negative price', async () => {
      const newProduct = {
        name: 'Test Product',
        category: 'device',
        price: -100000,
        stock: 10,
        store_id: 'aaaa1111-1111-1111-1111-111111111111'
      }

      const response = await request(app)
        .post('/api/products')
        .send(newProduct)

      expect(response.status).toBe(400)
    })
  })

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const updateData = {
        name: 'SMOK Nord 4 Updated',
        price: 420000
      }

      const response = await request(app)
        .put('/api/products/p001-1111-1111-1111-111111111111')
        .send(updateData)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Product updated successfully')
    })

    it('should return 400 for negative stock', async () => {
      const updateData = {
        stock: -5
      }

      const response = await request(app)
        .put('/api/products/p001-1111-1111-1111-111111111111')
        .send(updateData)

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete('/api/products/p001-1111-1111-1111-111111111111')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('message', 'Product deleted successfully')
    })
  })
})
