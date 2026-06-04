/**
 * Cash Sessions API routes
 * Cash drawer management operations
 */
import { Router } from 'express';
import { supabase } from '../lib/supabase'
import { z } from 'zod'

const router = Router()

const createSessionSchema = z.object({
  store_id: z.string().uuid('Invalid store ID'),
  opening_cash: z.number().min(0, 'Opening cash cannot be negative'),
  notes: z.string().optional()
})

const closeSessionSchema = z.object({
  closing_cash: z.number().min(0, 'Closing cash cannot be negative'),
  notes: z.string().optional()
})

const recordTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['sale', 'expense', 'adjustment']),
  description: z.string().optional()
})

router.get('/', async (req, res) => {
  try {
    const { store_id, status, start_date, end_date, page = 1, limit = 20 } = req.query

    let query = supabase
      .from('cash_sessions')
      .select('*', { count: 'exact' })
      .order('opened_at', { ascending: false })

    if (store_id) {
      query = query.eq('store_id', store_id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (start_date) {
      query = query.gte('session_date', start_date as string)
    }

    if (end_date) {
      query = query.lte('session_date', end_date as string)
    }

    const offset = (Number(page) - 1) * Number(limit)
    query = query.range(offset, offset + Number(limit) - 1)

    const { data: sessions, error, count } = await query

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      sessions: sessions || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    })
  } catch (error) {
    console.error('Error fetching cash sessions:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/today', async (req, res) => {
  try {
    const { store_id, user_id } = req.query

    if (!store_id) {
      return res.status(400).json({ error: 'store_id is required' })
    }

    const today = new Date().toISOString().split('T')[0]

    let query = supabase
      .from('cash_sessions')
      .select('*')
      .eq('store_id', store_id as string)
      .eq('session_date', today)
      .eq('status', 'open')

    if (user_id) {
      query = query.eq('user_id', user_id as string)
    }

    const { data: session, error } = await query.single()

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message })
    }

    res.json({ session })
  } catch (error) {
    console.error('Error fetching today session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { data: session, error } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !session) {
      return res.status(404).json({ error: 'Cash session not found' })
    }

    res.json({ session })
  } catch (error) {
    console.error('Error fetching cash session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/', async (req, res) => {
  try {
    const validatedData = createSessionSchema.parse(req.body)
    const { user_id, tenant_id } = req.body

    if (!user_id || !tenant_id) {
      return res.status(400).json({ error: 'user_id and tenant_id are required' })
    }

    const { data: existingSession, error: checkError } = await supabase
      .from('cash_sessions')
      .select('id')
      .eq('store_id', validatedData.store_id)
      .eq('session_date', new Date().toISOString().split('T')[0])
      .eq('status', 'open')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(400).json({ error: checkError.message })
    }

    if (existingSession) {
      return res.status(409).json({ error: 'Active session already exists for today' })
    }

    const { data: session, error } = await supabase
      .from('cash_sessions')
      .insert({
        store_id: validatedData.store_id,
        user_id,
        tenant_id,
        session_date: new Date().toISOString().split('T')[0],
        opening_cash: validatedData.opening_cash,
        notes: validatedData.notes,
        status: 'open',
        total_sales: 0,
        total_expenses: 0,
        cash_adjustments: 0
      })
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Cash session created successfully',
      session
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error creating cash session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/close', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = closeSessionSchema.parse(req.body)

    const { data: session, error: fetchError } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Cash session not found' })
    }

    if (session.status !== 'open') {
      return res.status(400).json({ error: 'Session is already closed' })
    }

    const expectedCash = session.opening_cash +
                         session.total_sales -
                         session.total_expenses +
                         session.cash_adjustments
    const cashDifference = validatedData.closing_cash - expectedCash

    const { data: updatedSession, error } = await supabase
      .from('cash_sessions')
      .update({
        closing_cash: validatedData.closing_cash,
        expected_cash: expectedCash,
        cash_difference: cashDifference,
        notes: validatedData.notes || session.notes,
        status: 'closed',
        closed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: 'Cash session closed successfully',
      session: updatedSession,
      reconciliation: {
        expected: expectedCash,
        actual: validatedData.closing_cash,
        difference: cashDifference
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error closing cash session:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.post('/:id/record', async (req, res) => {
  try {
    const { id } = req.params
    const validatedData = recordTransactionSchema.parse(req.body)

    const { data: session, error: fetchError } = await supabase
      .from('cash_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !session) {
      return res.status(404).json({ error: 'Cash session not found' })
    }

    if (session.status !== 'open') {
      return res.status(400).json({ error: 'Session is closed' })
    }

    const updateData: Record<string, number | string> = {
      updated_at: new Date().toISOString()
    }

    if (validatedData.type === 'sale') {
      updateData.total_sales = session.total_sales + validatedData.amount
    } else if (validatedData.type === 'expense') {
      updateData.total_expenses = session.total_expenses + validatedData.amount
    } else {
      updateData.cash_adjustments = session.cash_adjustments + validatedData.amount
    }

    const { data: updatedSession, error } = await supabase
      .from('cash_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    res.json({
      message: `${validatedData.type} recorded successfully`,
      session: updatedSession
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }
    console.error('Error recording transaction:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
