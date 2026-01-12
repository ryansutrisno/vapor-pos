// Debug script to check users in database
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

async function checkUsers() {
  console.log('=== Checking all users in database ===');
  
  try {
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users?.length || 0} users:`);
    users?.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Tenant ID: ${user.tenant_id}`);
      console.log(`   Active: ${user.is_active}`);
      console.log('---');
    });
    
    // Check specific user ID
    const targetUserId = 'd8a49dc8-86d5-4d63-9bba-e24f2e961bd8';
    console.log(`\n=== Checking specific user ID: ${targetUserId} ===`);
    
    const { data: specificUser, error: specificError } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();
    
    if (specificError) {
      console.error('Error or user not found:', specificError);
    } else {
      console.log('User found:', specificUser);
    }
    
    // Check superadmin users
    console.log('\n=== Checking superadmin users ===');
    const { data: superadmins, error: superError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'superadmin');
    
    if (superError) {
      console.error('Error fetching superadmins:', superError);
    } else {
      console.log(`Found ${superadmins?.length || 0} superadmin users:`);
      superadmins?.forEach(user => {
        console.log(`- ${user.email} (ID: ${user.id})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkUsers().then(() => {
  console.log('\nDone checking users.');
  process.exit(0);
});