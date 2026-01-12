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

// Demo users to update
const demoUsers = [
  'superadmin@vaporpos.com',
  'admin@demo.com',
  'warehouse@demo.com',
  'kasir@demo.com'
]

async function updateAuthIds() {
  console.log('🔄 Updating auth_id for existing users...')
  
  for (const email of demoUsers) {
    try {
      console.log(`\n📧 Processing ${email}...`)
      
      // Get auth user by email
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
      
      if (authError) {
        console.log(`   ❌ Error getting auth users: ${authError.message}`)
        continue
      }
      
      const authUser = authUsers.users.find(u => u.email === email)
      if (!authUser) {
        console.log(`   ⚠️  Auth user not found for ${email}`)
        continue
      }
      
      console.log(`   🆔 Found auth user: ${authUser.id}`)
      
      // Get database user
      const { data: dbUser, error: dbError } = await supabase
        .from('users')
        .select('id, email, auth_id, role')
        .eq('email', email)
        .single()
      
      if (dbError) {
        console.log(`   ❌ Error getting database user: ${dbError.message}`)
        continue
      }
      
      if (!dbUser) {
        console.log(`   ⚠️  Database user not found for ${email}`)
        continue
      }
      
      console.log(`   📊 Database user: ID=${dbUser.id}, Auth ID=${dbUser.auth_id}, Role=${dbUser.role}`)
      
      // Update auth_id if needed
      if (dbUser.auth_id !== authUser.id) {
        console.log(`   🔄 Updating auth_id from ${dbUser.auth_id} to ${authUser.id}...`)
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ auth_id: authUser.id })
          .eq('id', dbUser.id)
        
        if (updateError) {
          console.log(`   ❌ Error updating auth_id: ${updateError.message}`)
        } else {
          console.log(`   ✅ Successfully updated auth_id for ${email}`)
        }
      } else {
        console.log(`   ✅ Auth ID already correct for ${email}`)
      }
      
    } catch (error) {
      console.error(`   ❌ Unexpected error for ${email}:`, error.message)
    }
  }
  
  console.log('\n🎉 Auth ID update process completed!')
  
  // Verify all users
  console.log('\n🔍 Verifying all users...')
  const { data: allUsers, error: verifyError } = await supabase
    .from('users')
    .select('id, email, auth_id, role')
    .in('email', demoUsers)
  
  if (verifyError) {
    console.log('❌ Error verifying users:', verifyError.message)
  } else {
    console.log('\n📊 Final user status:')
    allUsers.forEach(user => {
      console.log(`   ${user.email}: DB ID=${user.id}, Auth ID=${user.auth_id}, Role=${user.role}`)
    })
  }
}

// Run the update
updateAuthIds().catch(console.error)