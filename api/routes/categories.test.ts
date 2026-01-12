import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

describe('Categories API', () => {
  let app: express.Express

  beforeEach(async () => {
    const categoriesRoutes = (await import('../routes/categories')).default
    
    app = express()
    app.use(express.json())
    app.use('/api/categories', categoriesRoutes)
  })

  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('categories')
      expect(response.body.categories).toHaveLength(4)
    })

    it('should include all required category ids', async () => {
      const response = await request(app)
        .get('/api/categories')

      const categoryIds = response.body.categories.map((c: { id: string }) => c.id)
      expect(categoryIds).toContain('device')
      expect(categoryIds).toContain('liquid')
      expect(categoryIds).toContain('peripheral')
      expect(categoryIds).toContain('service')
    })

    it('should have correct category names', async () => {
      const response = await request(app)
        .get('/api/categories')

      const categoryMap = response.body.categories.reduce((acc: Record<string, string>, c: { id: string; name: string }) => {
        acc[c.id] = c.name
        return acc
      }, {})

      expect(categoryMap.device).toBe('Device')
      expect(categoryMap.liquid).toBe('Liquid')
      expect(categoryMap.peripheral).toBe('Peripheral')
      expect(categoryMap.service).toBe('Service')
    })
  })

  describe('GET /api/categories/:id', () => {
    it('should return category by id', async () => {
      const response = await request(app)
        .get('/api/categories/device')

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('category')
      expect(response.body.category.id).toBe('device')
      expect(response.body.category.name).toBe('Device')
    })

    it('should return 404 for invalid category', async () => {
      const response = await request(app)
        .get('/api/categories/invalid')

      expect(response.status).toBe(404)
      expect(response.body).toHaveProperty('error', 'Category not found')
    })
  })

  describe('POST /api/categories', () => {
    it('should return 405 - categories cannot be created', async () => {
      const response = await request(app)
        .post('/api/categories')
        .send({ id: 'new_category', name: 'New Category' })

      expect(response.status).toBe(405)
      expect(response.body).toHaveProperty('error', 'Categories cannot be created or modified')
    })
  })

  describe('PUT /api/categories/:id', () => {
    it('should return 405 - categories cannot be modified', async () => {
      const response = await request(app)
        .put('/api/categories/device')
        .send({ name: 'Updated Device' })

      expect(response.status).toBe(405)
      expect(response.body).toHaveProperty('error', 'Categories cannot be created or modified')
    })
  })

  describe('DELETE /api/categories/:id', () => {
    it('should return 405 - categories cannot be deleted', async () => {
      const response = await request(app)
        .delete('/api/categories/device')

      expect(response.status).toBe(405)
      expect(response.body).toHaveProperty('error', 'Categories cannot be deleted')
    })
  })
})
