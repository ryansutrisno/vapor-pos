/**
 * Stores API routes
 * Store management operations
 */
import { Router } from 'express';
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const router = Router()

const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
  address: z.string().min(1, 'Address is required'),
  admin_id: z.string().uuid('Invalid admin ID'),
  is_active: z.boolean().optional()
})

const updateStoreSchema = createStoreSchema.partial()

router.get('/', async (req, res) => {
  try {
    const { tenant_id, is_active, page = 1, limit = 20 } = req.query

    let query = supabase
      .from('stores')
      .select('*', { count: 'exact' })
      .order('name')

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id as string)
    }

    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true')
    }

    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: stores, error, count } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      stores: stores || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching stores:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !store) {
      return res.status(404).json({ error: 'Store not found' })
    }

    res.json({ store })
  } catch (error) {
    console.error('Error fetching store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const validatedData = createStoreSchema.parse(req.body)
    const { tenant_id } = req.body

    if (!tenant_id) {
      return res.status(400).json({ error: 'tenant_id is required' })
    }

    const { data: store, error } = await supabase
      .from('stores')
      .insert({
        ...validatedData,
        tenant_id,
        is_active: validatedData.is_active ?? true
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Store created successfully',
      store
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error creating store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = updateStoreSchema.parse(req.body)

    const { data: store, error } = await supabase
      .from('stores')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    if (!store) {
      return res.status(404).json({ error: 'Store not found' })
    }

    res.json({
      message: 'Store updated successfully',
      store
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error updating store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({ message: 'Store deleted successfully' })
  } catch (error) {
    console.error('Error deleting store:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id/staff', async (req, res) => {
  try {
    const { id } = req.params

    const { data: staff, error } = await supabase
      .from('user_stores')
      .select(`
        *,
        user:users(*)
      `)
      .eq('store_id', id)

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      staff: staff || [],
      count: staff?.length || 0
    })
  } catch (error) {
    console.error('Error fetching store staff:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
