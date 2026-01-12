/**
 * Products API routes
 * CRUD operations for products
 */
import { Router } from 'express';
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const router = Router()

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['device', 'liquid', 'peripheral', 'service']),
  price: z.number().positive('Price must be positive'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  store_id: z.string().uuid('Invalid store ID'),
  image_url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable()
})

const updateProductSchema = productSchema.partial()

router.get('/', async (req, res) => {
  try {
    const { store_id, category, search, page = 1, limit = 20 } = req.query

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .order('name')

    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: products, error, count } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      products: products || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const validatedData = productSchema.parse(req.body)

    const { data: product, error } = await supabase
      .from('products')
      .insert(validatedData)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error creating product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateProductSchema.parse(req.body)

    const { data: product, error } = await supabase
      .from('products')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({
      message: 'Product updated successfully',
      product
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error updating product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Invalid product IDs' })
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', ids)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: `${ids.length} products deleted successfully` })
  } catch (error) {
    console.error('Error bulk deleting products:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/bulk-update-stock', async (req, res) => {
  try {
    const { updates } = req.body

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Invalid updates' })
    }

    const results = []
    for (const update of updates) {
      const { id, stock } = update
      const { data, error } = await supabase
        .from('products')
        .update({ stock })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        results.push({ id, success: false, error: error.message })
      } else {
        results.push({ id, success: true, data })
      }
    }

    res.json({
      message: 'Bulk update completed',
      results
    })
  } catch (error) {
    console.error('Error bulk updating stock:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
