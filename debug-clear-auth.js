// Debug script to clear auth and test with valid user
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testWithValidUser() {
  console.log('=== Testing with valid superadmin user ===');
  
  try {
    // Valid superadmin ID from database
    const validSuperadminId = '6761cb25-172f-44f3-adfa-5cdfe455b4fd';
    
    console.log(`Testing user query with ID: ${validSuperadminId}`);
    
    // Test user query
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('id', validSuperadminId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
    } else {
      console.log('User data:', userData);
    }
    
    // Test settings query with correct syntax
    console.log('\n=== Testing settings query with correct syntax ===');
    
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .is('tenant_id', null)
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    
    if (settingsError) {
      console.error('Error fetching settings:', settingsError);
    } else {
      console.log(`Settings found: ${settingsData?.length || 0} records`);
      if (settingsData && settingsData.length > 0) {
        console.log('First few settings:');
        settingsData.slice(0, 3).forEach(setting => {
          console.log(`- ${setting.key}: ${setting.value} (category: ${setting.category})`);
        });
      }
    }
    
    // Test with wrong syntax to confirm error
    console.log('\n=== Testing with wrong syntax (should fail) ===');
    try {
      const { data: wrongData, error: wrongError } = await supabase
        .from('settings')
        .select('*')
        .eq('tenant_id', 'null')
        .order('category', { ascending: true });
      
      if (wrongError) {
        console.log('Expected error with wrong syntax:', wrongError.message);
      } else {
        console.log('Unexpected: wrong syntax worked');
      }
    } catch (err) {
      console.log('Expected error with wrong syntax:', err.message);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testWithValidUser().then(() => {
  console.log('\nDone testing.');
  process.exit(0);
});