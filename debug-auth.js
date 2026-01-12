import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugAuth() {
  console.log('=== Debugging Authentication and RLS ===');
  
  // Check current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('Current user:', user?.id);
  console.log('User error:', userError);
  
  if (!user) {
    console.log('No authenticated user found. Need to login first.');
    return;
  }
  
  // Check user data in users table
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('id, email, role, tenant_id')
    .eq('id', user.id)
    .single();
  
  console.log('User data from users table:', userData);
  console.log('User data error:', userDataError);
  
  if (userData) {
    console.log('User role:', userData.role);
    console.log('User tenant_id:', userData.tenant_id);
    console.log('Is superadmin:', userData.role === 'superadmin');
  }
  
  // Test settings access
  console.log('\n=== Testing Settings Access ===');
  
  // Try to get all settings
  const { data: allSettings, error: allError } = await supabase
    .from('settings')
    .select('*');
  
  console.log('All settings count:', allSettings?.length || 0);
  console.log('All settings error:', allError);
  
  // Try to get global settings specifically
  const { data: globalSettings, error: globalError } = await supabase
    .from('settings')
    .select('*')
    .is('tenant_id', null);
  
  console.log('Global settings count:', globalSettings?.length || 0);
  console.log('Global settings error:', globalError);
  
  if (globalError) {
    console.log('Global settings error details:', JSON.stringify(globalError, null, 2));
  }
}

debugAuth().catch(console.error);