import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with enhanced auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Increase session refresh threshold to prevent frequent logouts
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Set storage key to avoid conflicts
    storageKey: 'vapor-pos-supabase-auth',
    // Custom storage implementation for better reliability
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value)
        } catch {
          // Silently fail if localStorage is not available
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Silently fail if localStorage is not available
        }
      }
    }
  },
  // Add retry configuration for better reliability
  global: {
    headers: {
      'X-Client-Info': 'vapor-pos-web'
    }
  }
})



// Types for database tables
export type UserRole = 'superadmin' | 'admin' | 'warehouse' | 'kasir'
export type ProductCategory = 'device' | 'liquid' | 'peripheral' | 'service'
export type PlanType = 'single_store' | 'multi_store_5' | 'multi_store_20' | 'multi_store_unlimited'
export type BillingCycle = 'monthly' | 'yearly'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  tenant_id?: string
  subscription_plan: PlanType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Store {
  id: string
  name: string
  address: string
  admin_id: string
  tenant_id: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  store_id: string
  tenant_id: string
  image_url?: string
  description?: string
  created_at: string
}

export interface Transaction {
  id: string
  store_id: string
  cashier_id: string
  customer_name?: string
  total_amount: number
  payment_method: string
  tenant_id: string
  created_at: string
}

export interface TransactionItem {
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}

export interface UserStore {
  id: string
  user_id: string
  store_id: string
  assigned_at: string
}

export interface Order {
  id: string
  email: string
  plan_type: PlanType
  billing_cycle: BillingCycle
  amount: number
  payment_status: PaymentStatus
  payment_id?: string
  approved_by?: string
  created_at: string
}