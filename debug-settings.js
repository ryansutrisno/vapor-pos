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

async function checkGlobalSettings() {
  console.log('Checking global settings...');
  
  // Check if there are any settings with tenant_id = NULL
  const { data: globalSettings, error: globalError } = await supabase
    .from('settings')
    .select('*')
    .is('tenant_id', null);
  
  console.log('Global settings count:', globalSettings?.length || 0);
  console.log('Global settings error:', globalError);
  
  if (globalSettings && globalSettings.length > 0) {
    console.log('Global settings found:', globalSettings.map(s => s.key));
  }
  
  // Check all settings
  const { data: allSettings, error: allError } = await supabase
    .from('settings')
    .select('key, tenant_id')
    .order('key');
  
  console.log('All settings count:', allSettings?.length || 0);
  console.log('All settings error:', allError);
  
  if (allSettings) {
    console.log('Settings breakdown:');
    const globalCount = allSettings.filter(s => s.tenant_id === null).length;
    const tenantCount = allSettings.filter(s => s.tenant_id !== null).length;
    console.log('- Global (tenant_id = NULL):', globalCount);
    console.log('- Tenant-specific:', tenantCount);
  }
}

checkGlobalSettings().catch(console.error);