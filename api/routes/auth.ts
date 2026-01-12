/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import express from 'express'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import crypto from 'crypto'
import sgMail from '@sendgrid/mail'
import { Router } from 'express';


const router = Router();

/**
 * User Registration (Trial)
 * POST /api/auth/register-trial
 */
router.post('/register-trial', async (req, res) => {
  try {
    const registerTrialSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      company: z.string().min(1, 'Company name is required'),
      phone: z.string().min(1, 'Phone number is required'),
      address: z.string().optional()
    })
    
    console.log('Trial registration request:', { ...req.body, password: '[REDACTED]' })
    
    // Validate request body
    const validatedData = registerTrialSchema.parse(req.body)
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email.toLowerCase())
      .single()
    
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    // Create user with trial settings
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        role: 'admin',
        tenant_id: crypto.randomUUID(),
        subscription_plan: 'trial',
        is_active: false,
        email_verified: false,
        email_verification_token: verificationToken,
        is_trial_user: true,
        trial_started_at: null,
        trial_expires_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (userError) {
      console.error('Error creating user:', userError)
      return res.status(400).json({ error: userError.message })
    }
    
    console.log('User created successfully:', newUser.id)
    
    // Send verification email
    try {
      await sendVerificationEmail(validatedData.email, verificationToken, validatedData.name)
      console.log('Verification email sent successfully')
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
    }
    
    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * User Registration (Regular)
 * POST /api/auth/register
 * For creating new users after trial or by admin
 */
router.post('/register', async (req, res) => {
  try {
    const registerSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      email: z.string().email('Invalid email format'),
      password: z.string().min(6, 'Password must be at least 6 characters'),
      role: z.enum(['admin', 'warehouse', 'kasir']),
      tenant_id: z.string().uuid('Invalid tenant ID'),
      store_id: z.string().uuid('Invalid store ID').optional(),
      company: z.string().min(1, 'Company name is required').optional(),
      phone: z.string().min(1, 'Phone number is required').optional(),
      address: z.string().optional()
    })

    console.log('Registration request:', { ...req.body, password: '[REDACTED]' })

    const validatedData = registerSchema.parse(req.body)

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedData.email.toLowerCase())
      .single()

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)
    const now = new Date().toISOString()

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        role: validatedData.role,
        tenant_id: validatedData.tenant_id,
        store_id: validatedData.store_id,
        subscription_plan: 'single_store',
        is_active: true,
        email_verified: true,
        created_at: now,
        updated_at: now
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creating user:', userError)
      return res.status(400).json({ error: userError.message })
    }

    console.log('User created successfully:', newUser.id)

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * User Login
 * POST /api/auth/login
 * For users with direct login credentials (not Supabase Auth)
 */
router.post('/login', async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required')
    })

    console.log('Login request:', req.body.email)

    const validatedData = loginSchema.parse(req.body)

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email.toLowerCase())
      .single()

    if (userError || !user) {
      console.log('User not found')
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!user.is_active) {
      console.log('User account is inactive')
      return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' })
    }

    const { data: session, error: sessionError } = await supabase
      .from('cash_sessions')
      .select('id, status')
      .eq('user_id', user.id)
      .eq('status', 'open')
      .maybeSingle()

    if (sessionError) {
      console.error('Error checking session:', sessionError)
    }

    const userStores = user.store_id ? [user.store_id] : []

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenant_id: user.tenant_id,
      store_id: user.store_id,
      subscription_plan: user.subscription_plan,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at
    }

    console.log('Login successful for user:', user.email)

    res.json({
      message: 'Login successful',
      user: responseUser,
      session_id: session?.id || null,
      user_stores: userStores
    })

  } catch (error) {
    console.error('Login error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.issues
      })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { user_id } = req.body

    console.log('Logout request for user:', user_id)

    if (user_id) {
      const { error: closeSessionError } = await supabase
        .from('cash_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .eq('status', 'open')

      if (closeSessionError) {
        console.error('Error closing cash session:', closeSessionError)
      }
    }

    console.log('Logout successful')

    res.json({ message: 'Logout successful' })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * Email Verification
 * POST /api/auth/verify-email
 */
router.post('/verify-email', async (req, res) => {
  try {
    const verifyEmailSchema = z.object({
      token: z.string().min(1, 'Token is required'),
      email: z.string().email('Invalid email format')
    })
    
    console.log('Email verification request:', req.body)
    
    const validatedData = verifyEmailSchema.parse(req.body)
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email.toLowerCase())
      .eq('email_verification_token', validatedData.token)
      .single()
    
    if (userError || !user) {
      console.log('User not found or invalid token')
      return res.status(400).json({ error: 'Invalid verification token' })
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' })
    }
    
    const now = new Date()
    const trialExpires = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000))
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verification_token: null,
        is_active: true,
        trial_started_at: now.toISOString(),
        trial_expires_at: trialExpires.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error updating user:', updateError)
      return res.status(500).json({ error: 'Failed to verify email' })
    }
    
    console.log('Email verified successfully for user:', user.id)
    
    res.json({
      message: 'Email verified successfully. Your 14-day trial has started!',
      trial_expires_at: trialExpires.toISOString()
    })
    
  } catch (error) {
    console.error('Email verification error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * Resend Verification Email
 * POST /api/auth/resend-verification
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const resendVerificationSchema = z.object({
      email: z.string().email('Invalid email format')
    })
    
    console.log('Resend verification request:', req.body)
    
    const validatedData = resendVerificationSchema.parse(req.body)
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', validatedData.email.toLowerCase())
      .single()
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' })
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex')
    
    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verification_token: verificationToken,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
    
    if (updateError) {
      console.error('Error updating verification token:', updateError)
      return res.status(500).json({ error: 'Failed to generate new verification token' })
    }
    
    try {
      await sendVerificationEmail(user.email, verificationToken, user.name)
      console.log('Verification email resent successfully')
    } catch (emailError) {
      console.error('Error resending verification email:', emailError)
      return res.status(500).json({ error: 'Failed to send verification email' })
    }
    
    res.json({ message: 'Verification email sent successfully' })
    
  } catch (error) {
    console.error('Resend verification error:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.issues 
      })
    }
    
    res.status(500).json({ error: 'Internal server error' })
  }
});

/**
 * User Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    const { user_id } = req.body

    console.log('Logout request for user:', user_id)

    if (user_id) {
      const { error: closeSessionError } = await supabase
        .from('cash_sessions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('user_id', user_id)
        .eq('status', 'open')

      if (closeSessionError) {
        console.error('Error closing cash session:', closeSessionError)
      }
    }

    console.log('Logout successful')

    res.json({ message: 'Logout successful' })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
});

// Helper function to get SendGrid configuration
async function getSendGridConfig() {
  const { data: settings } = await supabase
    .from('settings')
    .select('key, value')
    .in('key', ['sendgrid_api_key', 'sendgrid_from_email', 'sendgrid_from_name'])
    .is('tenant_id', null)

  const config: Record<string, string> = {}
  settings?.forEach(setting => {
    config[setting.key] = setting.value
  })

  return config
}

// Helper function to send verification email
async function sendVerificationEmail(email: string, token: string, name: string) {
  try {
    const config = await getSendGridConfig()
    
    if (!config.sendgrid_api_key) {
      throw new Error('SendGrid API key not configured')
    }

    sgMail.setApiKey(config.sendgrid_api_key)

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}&email=${encodeURIComponent(email)}`

    const msg = {
      to: email,
      from: {
        email: config.sendgrid_from_email || 'noreply@vaporpos.com',
        name: config.sendgrid_from_name || 'VaporPOS'
      },
      subject: 'Verify Your Email - VaporPOS Trial',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to VaporPOS!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #495057; margin-top: 0;">Hi ${name},</h2>
            
            <p style="font-size: 16px; margin-bottom: 20px;">Thank you for signing up for VaporPOS 14-day free trial! To get started, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #6c757d; word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #1976d2; margin-top: 0;">Your 14-Day Trial Includes:</h3>
              <ul style="color: #424242; margin: 0; padding-left: 20px;">
                <li>Complete POS system for vapor stores</li>
                <li>Inventory management</li>
                <li>Sales reporting and analytics</li>
                <li>Multi-user access (Admin, Warehouse, Cashier)</li>
                <li>24/7 customer support</li>
              </ul>
            </div>
            
            <p style="font-size: 14px; color: #6c757d;">This verification link will expire in 24 hours. If you didn't create an account with VaporPOS, you can safely ignore this email.</p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #6c757d; text-align: center; margin: 0;">© 2024 VaporPOS. All rights reserved.</p>
          </div>
        </body>
        </html>
      `
    }

    await sgMail.send(msg)
    console.log('Verification email sent to:', email)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw error
  }
}

export default router;