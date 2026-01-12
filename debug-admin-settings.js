import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAdminSettings() {
  console.log('🔍 Checking admin settings in database...')
  
  try {
    // Check all settings
    const { data: allSettings, error: allError } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })
    
    if (allError) {
      console.error('❌ Error fetching all settings:', allError)
      return
    }
    
    console.log(`📊 Total settings found: ${allSettings?.length || 0}`)
    
    // Group by category
    const categories = {}
    allSettings?.forEach(setting => {
      if (!categories[setting.category]) {
        categories[setting.category] = []
      }
      categories[setting.category].push(setting)
    })
    
    console.log('\n📋 Settings by category:')
    Object.keys(categories).forEach(category => {
      console.log(`\n🏷️  ${category} (${categories[category].length} settings):`)
      categories[category].forEach(setting => {
        console.log(`   - ${setting.key}: "${setting.value}" (${setting.data_type}) [tenant_id: ${setting.tenant_id || 'NULL'}]`)
      })
    })
    
    // Check specifically for admin categories
    const adminCategories = ['store_branding', 'business_operations', 'receipt_settings', 'notification_settings']
    console.log('\n🎯 Admin-specific categories:')
    adminCategories.forEach(category => {
      const count = categories[category]?.length || 0
      console.log(`   - ${category}: ${count} settings ${count === 0 ? '❌' : '✅'}`)
    })
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkAdminSettings()