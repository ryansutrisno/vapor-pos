/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase'

// Safe wrapper for auth operations that handles session errors
async function safeAuthOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof Error && error.message?.includes('Auth session missing')) {
      console.warn('Auth session missing during operation, returning fallback value')
      return fallback
    }
    throw error
  }
}

// Check if current user exists in database (graceful version)
async function checkUserExists(): Promise<boolean> {
  return safeAuthOperation(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return false
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('id')
      .eq('auth_id', user.id) // Use auth_id instead of id
      .single()

    // If user not found in database, log warning but don't force logout
    if (error && error.code === 'PGRST116') {
      console.warn('checkUserExists - user not found in database, auth ID:', user.id)
      return false
    }
    
    return !error && !!userData
  }, false)
}

// Get current user's tenant_id
async function getCurrentUserTenantId(): Promise<string | null> {
  return safeAuthOperation(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('getCurrentUserTenantId - user:', user?.id)
    if (!user) {
      console.log('getCurrentUserTenantId - no user found')
      return null
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('tenant_id, role')
      .eq('auth_id', user.id) // Use auth_id instead of id
      .single()

    console.log('getCurrentUserTenantId - userData:', userData)
    console.log('getCurrentUserTenantId - error:', error)
    
    // If user not found in database, log warning but don't force logout
    if (error && error.code === 'PGRST116') {
      console.warn('getCurrentUserTenantId - user not found in database, auth ID:', user.id)
      // Return null to indicate no tenant access, but don't force logout
      // This allows the app to handle the missing user gracefully
      return null
    }
    
    if (error || !userData) {
      console.log('getCurrentUserTenantId - returning null due to error or no data')
      return null
    }
    
    // Superadmin can access global settings (tenant_id = null)
    const result = userData.role === 'superadmin' ? null : userData.tenant_id
    console.log('getCurrentUserTenantId - role:', userData.role, 'returning:', result)
    return result
  }, null)
}

// Check if current user is superadmin
async function isSuperAdmin(): Promise<boolean> {
  return safeAuthOperation(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('isSuperAdmin - user:', user?.id)
    if (!user) {
      console.log('isSuperAdmin - no user found, returning false')
      return false
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id) // Use auth_id instead of id
      .single()

    console.log('isSuperAdmin - userData:', userData)
    console.log('isSuperAdmin - error:', error)
    
    // If user not found in database, log warning but don't force logout
    if (error && error.code === 'PGRST116') {
      console.warn('isSuperAdmin - user not found in database, auth ID:', user.id)
      // Return false to indicate not superadmin, but don't force logout
      // This allows the app to handle the missing user gracefully
      return false
    }
    
    const result = userData?.role === 'superadmin'
    console.log('isSuperAdmin - role:', userData?.role, 'returning:', result)
    return result
  }, false)
}

export interface Setting {
  id: string
  key: string
  value: string
  category: string
  description: string
  data_type: 'string' | 'number' | 'boolean' | 'json'
  is_public: boolean
  tenant_id: string | null
  created_at: string
  updated_at: string
}

export interface SettingsCache {
  [key: string]: any
}

// Cache for frequently accessed settings
let settingsCache: SettingsCache = {}
let cacheExpiry: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Type-safe setting keys
export const SETTING_KEYS = {
  // Application
  APP_NAME: 'app_name',
  APP_LOGO: 'app_logo',
  APP_THEME: 'app_theme',
  APP_VERSION: 'app_version',
  MAINTENANCE_MODE: 'maintenance_mode',
  
  // Email
  SMTP_HOST: 'smtp_host',
  SMTP_PORT: 'smtp_port',
  SMTP_USERNAME: 'smtp_username',
  SMTP_PASSWORD: 'smtp_password',
  SMTP_FROM_EMAIL: 'smtp_from_email',
  SMTP_FROM_NAME: 'smtp_from_name',
  EMAIL_NOTIFICATIONS: 'email_notifications',
  
  // Security
  PASSWORD_MIN_LENGTH: 'password_min_length',
  PASSWORD_REQUIRE_UPPERCASE: 'password_require_uppercase',
  PASSWORD_REQUIRE_NUMBERS: 'password_require_numbers',
  PASSWORD_REQUIRE_SYMBOLS: 'password_require_symbols',
  SESSION_TIMEOUT: 'session_timeout',
  MAX_LOGIN_ATTEMPTS: 'max_login_attempts',
  LOCKOUT_DURATION: 'lockout_duration',
  
  // Backup
  BACKUP_ENABLED: 'backup_enabled',
  BACKUP_FREQUENCY: 'backup_frequency',
  BACKUP_RETENTION: 'backup_retention',
  BACKUP_LOCATION: 'backup_location',
  
  // System
  TIMEZONE: 'timezone',
  CURRENCY: 'currency',
  DATE_FORMAT: 'date_format',
  TIME_FORMAT: 'time_format',
  LANGUAGE: 'language'
} as const

// Parse setting value based on data type
function parseSettingValue(value: string, dataType: string): any {
  switch (dataType) {
    case 'boolean':
      return value === 'true'
    case 'number':
      return parseFloat(value)
    case 'json':
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    default:
      return value
  }
}

// Convert value to string for storage
function stringifySettingValue(value: any, dataType: string): string {
  switch (dataType) {
    case 'boolean':
      return value ? 'true' : 'false'
    case 'number':
      return value.toString()
    case 'json':
      return JSON.stringify(value)
    default:
      return value.toString()
  }
}

// Force create global settings if they don't exist
export async function ensureGlobalSettings(): Promise<void> {
  console.log('ensureGlobalSettings - checking if global settings exist')
  
  // Use RPC function to check if global settings exist
  const { data: existingSettings, error } = await supabase.rpc('get_global_settings')
  
  if (error) {
    console.error('Error checking global settings:', error)
    return
  }
  
  if (existingSettings && existingSettings.length > 0) {
    console.log('ensureGlobalSettings - global settings already exist')
    return
  }
  
  console.log('ensureGlobalSettings - creating global settings')
  
  // Create default global settings
  const defaultSettings = [
    { key: 'app_name', value: 'VaporPOS', category: 'application', description: 'Application name displayed in UI', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'app_logo', value: '/logo.png', category: 'application', description: 'Application logo URL', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'app_theme', value: 'system', category: 'application', description: 'Default application theme (light/dark/system)', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'app_version', value: '1.0.0', category: 'application', description: 'Current application version', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'maintenance_mode', value: 'false', category: 'application', description: 'Enable maintenance mode', data_type: 'boolean', is_public: false, tenant_id: null },
    { key: 'timezone', value: 'Asia/Jakarta', category: 'system', description: 'Default system timezone', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'currency', value: 'IDR', category: 'system', description: 'Default currency', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'date_format', value: 'DD/MM/YYYY', category: 'system', description: 'Default date format', data_type: 'string', is_public: true, tenant_id: null },
    { key: 'language', value: 'id', category: 'system', description: 'Default language (id/en)', data_type: 'string', is_public: true, tenant_id: null }
  ]
  
  const { error: insertError } = await supabase
    .from('settings')
    .insert(defaultSettings)
  
  if (insertError) {
    console.error('Error creating global settings:', insertError)
  } else {
    console.log('ensureGlobalSettings - global settings created successfully')
  }
}

// Note: executeWithFallback function removed - now using direct RPC calls for superadmin
// and direct queries for tenant users to avoid UUID parsing errors

// Get all settings (filtered by tenant)
export async function getAllSettings(): Promise<Setting[]> {
  // Graceful user validation - no forced logout
  const userExists = await checkUserExists()
  
  if (!userExists) {
    console.warn('getAllSettings - User not found in database, returning empty array')
    // Return empty array instead of forcing logout
    // This allows the app to handle missing users gracefully
    return []
  }
  
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  
  // Clear cache to ensure fresh data
  clearSettingsCache()
  
  console.log('getAllSettings - tenantId:', tenantId, 'isSuper:', isSuper)
  
  // For superadmin, ensure global settings exist
  if (isSuper) {
    await ensureGlobalSettings()
  }
  
  let data: Setting[] | null = null
  
  if (isSuper) {
    // Use RPC function for superadmin - NO FALLBACK to avoid UUID parsing errors
    try {
      console.log('getAllSettings (superadmin) - Using RPC function')
      const result = await supabase.rpc('get_global_settings')
      if (result.error) {
        console.error('getAllSettings (superadmin) - RPC failed:', result.error)
        throw result.error
      }
      data = result.data
    } catch (error) {
      console.error('getAllSettings (superadmin) - Error:', error)
      // Return empty array instead of fallback to avoid UUID parsing errors
      data = []
    }
  } else {
    // Regular users see their tenant's settings + default settings (tenant_id NULL)
    // Additional validation: if tenantId is null for non-superadmin, something is wrong
    if (tenantId === null) {
      console.error('getAllSettings - Non-superadmin user has null tenantId, this should not happen')
      // Force logout as this indicates data inconsistency
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return []
    }
    
    try {
      console.log('getAllSettings (tenant) - Direct query for tenant and default settings')
      // Get both tenant-specific settings AND default settings (tenant_id NULL)
      const result = await supabase
        .from('settings')
        .select('*')
        .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
        .order('category', { ascending: true })
        .order('key', { ascending: true })
      
      if (result.error) {
        console.error('getAllSettings (tenant) - Query failed:', result.error)
        throw result.error
      }
      data = result.data
      console.log('getAllSettings (tenant) - Found settings:', data?.length || 0)
    } catch (error) {
      console.error('getAllSettings (tenant) - Error:', error)
      data = []
    }
  }

  console.log('Settings fetched:', data?.length || 0, 'records')
  
  // If still no settings for superadmin, try to create them again
  if (isSuper && (!data || data.length === 0)) {
    console.log('getAllSettings - no settings found for superadmin, trying to create again')
    await ensureGlobalSettings()
    
    // Try RPC query again - NO FALLBACK
    try {
      console.log('getAllSettings (retry) - Using RPC function')
      const result = await supabase.rpc('get_global_settings')
      if (result.error) {
        console.error('getAllSettings (retry) - RPC failed:', result.error)
        data = []
      } else {
        data = result.data
      }
    } catch (error) {
      console.error('getAllSettings (retry) - Error:', error)
      data = []
    }
    
    console.log('Settings fetched on retry:', data?.length || 0, 'records')
  }
  
  return data || []
}

// Get settings by category (filtered by tenant)
export async function getSettingsByCategory(category: string): Promise<Setting[]> {
  // Graceful user validation - no forced logout
  const userExists = await checkUserExists()
  
  if (!userExists) {
    console.warn('getSettingsByCategory - User not found in database, returning empty array')
    // Return empty array instead of forcing logout
    return []
  }
  
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  
  let data: Setting[] | null = null
  
  if (isSuper) {
    // Use RPC function for superadmin - NO FALLBACK to avoid UUID parsing errors
    try {
      console.log(`getSettingsByCategory (superadmin, ${category}) - Using RPC function`)
      const result = await supabase.rpc('get_global_settings_by_category', { category_name: category })
      if (result.error) {
        console.error(`getSettingsByCategory (superadmin, ${category}) - RPC failed:`, result.error)
        throw result.error
      }
      data = result.data
    } catch (error) {
      console.error(`getSettingsByCategory (superadmin, ${category}) - Error:`, error)
      // Return empty array instead of fallback to avoid UUID parsing errors
      data = []
    }
  } else {
    // Regular users see their tenant's settings + default settings (tenant_id NULL)
    // Additional validation: if tenantId is null for non-superadmin, something is wrong
    if (tenantId === null) {
      console.error('getSettingsByCategory - Non-superadmin user has null tenantId, this should not happen')
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return []
    }
    
    try {
      console.log(`getSettingsByCategory (tenant, ${category}) - Direct query for tenant and default settings`)
      // Get both tenant-specific settings AND default settings (tenant_id NULL) for this category
      const result = await supabase
        .from('settings')
        .select('*')
        .eq('category', category)
        .or(`tenant_id.eq.${tenantId},tenant_id.is.null`)
        .order('key', { ascending: true })
      
      if (result.error) {
        console.error(`getSettingsByCategory (tenant, ${category}) - Query failed:`, result.error)
        throw result.error
      }
      data = result.data
      console.log(`getSettingsByCategory (tenant, ${category}) - Found settings:`, data?.length || 0)
    } catch (error) {
      console.error(`getSettingsByCategory (tenant, ${category}) - Error:`, error)
      data = []
    }
  }

  return data || []
}

// Get single setting value with caching (filtered by tenant)
export async function getSetting(key: string, useCache: boolean = true): Promise<any> {
  // Graceful user validation - no forced logout
  const userExists = await checkUserExists()
  
  if (!userExists) {
    console.warn('getSetting - User not found in database, returning null')
    // Return null instead of forcing logout
    return null
  }
  
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  const cacheKey = `${key}_${tenantId || 'global'}`
  
  // Check cache first
  if (useCache && Date.now() < cacheExpiry && settingsCache[cacheKey] !== undefined) {
    return settingsCache[cacheKey]
  }

  let data: any = null
  
  if (isSuper) {
    // Use RPC function for superadmin - NO FALLBACK to avoid UUID parsing errors
    try {
      console.log(`getSetting (superadmin, ${key}) - Using RPC function`)
      const result = await supabase.rpc('get_global_setting', { setting_key: key })
      if (result.error) {
        console.error(`getSetting (superadmin, ${key}) - RPC failed:`, result.error)
        throw result.error
      }
      data = result.data?.[0] || null // RPC returns array
    } catch (error) {
      console.error(`getSetting (superadmin, ${key}) - Error:`, error)
      // Return null instead of fallback to avoid UUID parsing errors
      data = null
    }
  } else {
    // Regular users get their tenant's settings
    // Additional validation: if tenantId is null for non-superadmin, something is wrong
    if (tenantId === null) {
      console.error('getSetting - Non-superadmin user has null tenantId, this should not happen')
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return null
    }
    
    try {
      console.log(`getSetting (tenant, ${key}) - Direct query`)
      const result = await supabase
        .from('settings')
        .select('value, data_type')
        .eq('key', key)
        .eq('tenant_id', tenantId)
        .single()
      
      if (result.error) {
        console.error(`getSetting (tenant, ${key}) - Query failed:`, result.error)
        throw result.error
      }
      data = result.data
    } catch (error) {
      console.error(`getSetting (tenant, ${key}) - Error:`, error)
      data = null
    }
  }

  if (!data) {
    return null
  }

  const parsedValue = parseSettingValue(data.value, data.data_type)
  
  // Update cache
  if (useCache) {
    settingsCache[cacheKey] = parsedValue
    cacheExpiry = Date.now() + CACHE_DURATION
  }

  return parsedValue
}

// Set single setting value (filtered by tenant)
export async function setSetting(key: string, value: any): Promise<void> {
  // Graceful user validation - no forced logout
  const userExists = await checkUserExists()
  
  if (!userExists) {
    console.warn('setSetting - User not found in database, operation cancelled')
    // Return early instead of forcing logout
    return
  }
  
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  const cacheKey = `${key}_${tenantId || 'global'}`
  
  // Get current setting to determine data type
  let currentSetting, fetchError
  
  if (isSuper) {
    // Use RPC function for superadmin to avoid UUID parsing issues
    const result = await supabase.rpc('get_global_setting', { setting_key: key })
    currentSetting = result.data?.[0] // RPC returns array, get first item
    fetchError = result.error
  } else {
    // Regular users get their tenant's settings
    // Additional validation: if tenantId is null for non-superadmin, something is wrong
    if (tenantId === null) {
      console.error('setSetting - Non-superadmin user has null tenantId, this should not happen')
      await supabase.auth.signOut()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return
    }
    
    const result = await supabase
      .from('settings')
      .select('data_type')
      .eq('key', key)
      .eq('tenant_id', tenantId)
      .single()
    currentSetting = result.data
    fetchError = result.error
  }

  if (fetchError) {
    console.error(`Error fetching setting ${key}:`, fetchError)
    throw fetchError
  }

  if (!currentSetting) {
    throw new Error(`Setting ${key} not found`)
  }

  const stringValue = stringifySettingValue(value, currentSetting.data_type)

  // Update setting with tenant filter
  let error
  
  if (isSuper) {
    // Use RPC function for superadmin to avoid UUID parsing issues
    const result = await supabase.rpc('update_global_setting', { 
      setting_key: key, 
      setting_value: stringValue 
    })
    error = result.error
  } else {
    // Regular users update their tenant's settings
    const result = await supabase
      .from('settings')
      .update({ 
        value: stringValue,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .eq('tenant_id', tenantId)
    error = result.error
  }

  if (error) {
    console.error(`Error updating setting ${key}:`, error)
    throw error
  }

  // Update cache
  settingsCache[cacheKey] = value
}

// Set multiple settings at once (filtered by tenant)
export async function setSettings(settings: Record<string, any>): Promise<void> {
  // Graceful user validation - no forced logout
  const userExists = await checkUserExists()
  
  if (!userExists) {
    console.warn('setSettings - User not found in database, operation cancelled')
    // Return early instead of forcing logout
    return
  }
  
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  
  // Additional validation: if tenantId is null for non-superadmin, something is wrong
  if (!isSuper && tenantId === null) {
    console.error('setSettings - Non-superadmin user has null tenantId, this should not happen')
    await supabase.auth.signOut()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return
  }
  
  for (const [key, value] of Object.entries(settings)) {
    // Get current setting to determine data type
    let currentSetting
    
    if (isSuper) {
      // Use RPC function for superadmin to avoid UUID parsing issues
      const result = await supabase.rpc('get_global_setting', { setting_key: key })
      currentSetting = result.data?.[0] // RPC returns array, get first item
    } else {
      // Regular users get their tenant's settings
      const result = await supabase
        .from('settings')
        .select('data_type')
        .eq('key', key)
        .eq('tenant_id', tenantId)
        .single()
      currentSetting = result.data
    }

    if (currentSetting) {
      const stringValue = stringifySettingValue(value, currentSetting.data_type)
      
      // Update setting with tenant filter
      let error
      
      if (isSuper) {
        // Use RPC function for superadmin to avoid UUID parsing issues
        const result = await supabase.rpc('update_global_setting', { 
          setting_key: key, 
          setting_value: stringValue 
        })
        error = result.error
      } else {
        // Regular users update their tenant's settings
        const result = await supabase
          .from('settings')
          .update({ 
            value: stringValue,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .eq('tenant_id', tenantId)
        error = result.error
      }
      
      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        throw error
      }
      
      // Update cache
      const cacheKey = `${key}_${tenantId || 'global'}`
      settingsCache[cacheKey] = value
    }
  }
}

// Clear settings cache
export function clearSettingsCache(): void {
  settingsCache = {}
  cacheExpiry = 0
}

// Get public settings (for non-authenticated users, filtered by tenant)
export async function getPublicSettings(): Promise<Record<string, any>> {
  const tenantId = await getCurrentUserTenantId()
  const isSuper = await isSuperAdmin()
  
  let data, error
  
  if (isSuper) {
    // Use RPC function for superadmin to avoid UUID parsing issues
    const result = await supabase.rpc('get_public_global_settings')
    data = result.data
    error = result.error
  } else {
    // Regular users get their tenant's public settings
    const result = await supabase
      .from('settings')
      .select('key, value, data_type')
      .eq('is_public', true)
      .eq('tenant_id', tenantId)
    data = result.data
    error = result.error
  }

  if (error) {
    console.error('Error fetching public settings:', error)
    return {}
  }

  const settings: Record<string, any> = {}
  data?.forEach(setting => {
    settings[setting.key] = parseSettingValue(setting.value, setting.data_type)
  })

  return settings
}

// Type-safe getters for common settings
export const getAppName = () => getSetting(SETTING_KEYS.APP_NAME)
export const getAppTheme = () => getSetting(SETTING_KEYS.APP_THEME)
export const getMaintenanceMode = () => getSetting(SETTING_KEYS.MAINTENANCE_MODE)
export const getTimezone = () => getSetting(SETTING_KEYS.TIMEZONE)
export const getCurrency = () => getSetting(SETTING_KEYS.CURRENCY)
export const getEmailNotifications = () => getSetting(SETTING_KEYS.EMAIL_NOTIFICATIONS)

// Type-safe setters for common settings
export const setAppName = (value: string) => setSetting(SETTING_KEYS.APP_NAME, value)
export const setAppTheme = (value: string) => setSetting(SETTING_KEYS.APP_THEME, value)
export const setMaintenanceMode = (value: boolean) => setSetting(SETTING_KEYS.MAINTENANCE_MODE, value)
export const setTimezone = (value: string) => setSetting(SETTING_KEYS.TIMEZONE, value)
export const setCurrency = (value: string) => setSetting(SETTING_KEYS.CURRENCY, value)
export const setEmailNotifications = (value: boolean) => setSetting(SETTING_KEYS.EMAIL_NOTIFICATIONS, value)

// Create default settings for a new tenant
export async function createTenantDefaultSettings(tenantId: string): Promise<void> {
  try {
    const { error } = await supabase.rpc('create_tenant_default_settings', {
      new_tenant_id: tenantId
    })
    
    if (error) {
      console.error('Error creating tenant default settings:', error)
      throw error
    }
    
    // Clear cache to ensure fresh data
    clearSettingsCache()
  } catch (error) {
    console.error('Failed to create tenant default settings:', error)
    throw error
  }
}

// Get settings for specific tenant (superadmin only)
export async function getTenantSettings(tenantId: string): Promise<Setting[]> {
  const isSuper = await isSuperAdmin()
  
  if (!isSuper) {
    throw new Error('Access denied: Only superadmin can access tenant settings')
  }
  
  // This function doesn't need RPC since it's querying by specific tenant_id (not NULL)
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('category', { ascending: true })
    .order('key', { ascending: true })

  if (error) {
    console.error('Error fetching tenant settings:', error)
    throw error
  }

  return data || []
}