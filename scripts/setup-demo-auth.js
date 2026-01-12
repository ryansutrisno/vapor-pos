import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uefktvolepvytlkyjwla.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmt0dm9sZXB2eXRsa3lqd2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg0Njc0NiwiZXhwIjoyMDcxNDIyNzQ2fQ.XnD-DGlxzbnshXK2SMjAg2rjtRcED_4UwfOkUbsB_Yw'

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Demo users to create
const demoUsers = [
  {
    email: 'superadmin@vaporpos.com',
    password: 'demo123',
    role: 'superadmin'
  },
  {
    email: 'admin@demo.com',
    password: 'demo123',
    role: 'admin'
  },
  {
    email: 'warehouse@demo.com',
    password: 'demo123',
    role: 'warehouse'
  },
  {
    email: 'kasir@demo.com',
    password: 'demo123',
    role: 'kasir'
  }
]

async function setupDemoAuth() {
  console.log('🚀 Setting up demo authentication accounts...')
  
  for (const user of demoUsers) {
    try {
      console.log(`\n📧 Creating auth account for ${user.email}...`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true // Auto-confirm email
      })
      
      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log(`   ⚠️  Auth account already exists for ${user.email}`)
          continue
        }
        throw authError
      }
      
      console.log(`   ✅ Auth account created for ${user.email}`)
      console.log(`   🆔 Auth ID: ${authData.user.id}`)
      
      // Update users table with auth ID (now using correct column)
      const { error: updateError } = await supabase
        .from('users')
        .update({ auth_id: authData.user.id })
        .eq('email', user.email)
      
      if (updateError) {
        console.log(`   ⚠️  Could not update users table: ${updateError.message}`)
        console.log(`   📝  Error details:`, updateError)
      } else {
        console.log(`   ✅ Updated users table with auth ID: ${authData.user.id}`)
      }
      
      // Verify the update worked
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('id, email, auth_id, role')
        .eq('email', user.email)
        .single()
      
      if (verifyError) {
        console.log(`   ⚠️  Could not verify user update: ${verifyError.message}`)
      } else {
        console.log(`   ✅ Verified user: DB ID=${verifyData.id}, Auth ID=${verifyData.auth_id}, Role=${verifyData.role}`)
      }
      
    } catch (error) {
      console.error(`   ❌ Error creating auth for ${user.email}:`, error.message)
    }
  }
  
  console.log('\n🎉 Demo authentication setup completed!')
  console.log('\n📋 Demo Credentials:')
  console.log('   Superadmin: superadmin@vaporpos.com / demo123')
  console.log('   Admin: admin@demo.com / demo123')
  console.log('   Warehouse: warehouse@demo.com / demo123')
  console.log('   Kasir: kasir@demo.com / demo123')
  console.log('\n🌐 You can now login at: http://localhost:5173/login')
}

// Run the setup
setupDemoAuth().catch(console.error)