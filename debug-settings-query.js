// Debug script to test settings query directly
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uefktvolepvytlkyjwla.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmt0dm9sZXB2eXRsa3lqd2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDY3NDYsImV4cCI6MjA3MTQyMjc0Nn0.KKSk-jk0si8O-eBJEejT_229uhTX_j5isEWOI3m9lGE'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlZmt0dm9sZXB2eXRsa3lqd2xhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTg0Njc0NiwiZXhwIjoyMDcxNDIyNzQ2fQ.XnD-DGlxzbnshXK2SMjAg2rjtRcED_4UwfOkUbsB_Yw'

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey)
const supabaseService = createClient(supabaseUrl, supabaseServiceKey)

async function testSettingsQuery() {
  console.log('=== Testing Settings Query ===')
  
  try {
    // Test 1: Get all settings without filter (using service role)
    console.log('\n1. Testing: Get all settings (no filter) - Service Role')
    const { data: allSettings, error: allError } = await supabaseService
      .from('settings')
      .select('*')
    
    console.log('All settings count:', allSettings?.length || 0)
    console.log('Error:', allError)
    if (allSettings?.length > 0) {
      console.log('Sample setting:', allSettings[0])
      console.log('Settings with tenant_id NULL:', allSettings.filter(s => s.tenant_id === null).length)
      console.log('Settings with tenant_id NOT NULL:', allSettings.filter(s => s.tenant_id !== null).length)
    }
    
    // Test 2: Get settings with tenant_id IS NULL (using service role)
    console.log('\n2. Testing: Get settings with tenant_id IS NULL - Service Role')
    const { data: globalSettings, error: globalError } = await supabaseService
      .from('settings')
      .select('*')
      .is('tenant_id', null)
    
    console.log('Global settings count:', globalSettings?.length || 0)
    console.log('Error:', globalError)
    if (globalSettings?.length > 0) {
      console.log('Sample global setting:', globalSettings[0])
      console.log('All global settings keys:', globalSettings.map(s => s.key))
    }
    
    // Test 2b: Same query with anon role
    console.log('\n2b. Testing: Get settings with tenant_id IS NULL - Anon Role')
    const { data: globalSettingsAnon, error: globalErrorAnon } = await supabaseAnon
      .from('settings')
      .select('*')
      .is('tenant_id', null)
    
    console.log('Global settings count (anon):', globalSettingsAnon?.length || 0)
    console.log('Error (anon):', globalErrorAnon)
    
    // Test 3: Get current user
    console.log('\n3. Testing: Get current user')
    const { data: { user }, error: userError } = await supabaseAnon.auth.getUser()
    console.log('Current user:', user?.id)
    console.log('User error:', userError)
    
    if (user) {
      // Test 4: Get user data from users table
      console.log('\n4. Testing: Get user data from users table')
      const { data: userData, error: userDataError } = await supabaseService
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      console.log('User data:', userData)
      console.log('User data error:', userDataError)
    }
    
    // Test 5: Test RLS policies by trying to access settings as different roles
    console.log('\n5. Testing: RLS policies')
    const { data: rlsTest, error: rlsError } = await supabaseAnon
      .from('settings')
      .select('*')
      .is('tenant_id', null)
      .limit(1)
    
    console.log('RLS test result (anon):', rlsTest?.length || 0, 'records')
    console.log('RLS test error (anon):', rlsError)
    
    // Test 5b: Check if we can get superadmin user
    console.log('\n5b. Testing: Get superadmin user')
    const { data: superadminUsers, error: superadminError } = await supabaseService
      .from('users')
      .select('*')
      .eq('role', 'superadmin')
    
    console.log('Superadmin users count:', superadminUsers?.length || 0)
    console.log('Superadmin error:', superadminError)
    if (superadminUsers?.length > 0) {
      console.log('Superadmin user:', superadminUsers[0])
    }
    
  } catch (error) {
    console.error('Test failed:', error)
  }
}

// Run the test
testSettingsQuery()