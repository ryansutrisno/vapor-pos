/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  clearSettingsCache,
  getAllSettings,
  setSettings,
  type Setting
} from '@/lib/settings'
import { formatWhatsAppNumber, testWhatsAppConnection as testWhatsApp, validateWhatsAppNumber, type WhatsAppConfig } from '@/lib/whatsapp'
import { useAuthStore } from '@/stores/authStore'
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Database,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Printer,
  RefreshCw,
  Save,
  Server,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from '@/lib/toast'
import { useTranslation } from '@/contexts/LanguageContext'

interface SettingsFormData {
  [key: string]: any
}

interface SettingsCategory {
  name: string
  label: string
  icon: any
  description: string
}

// Categories for Superadmin (Global Settings)
const getSuperadminCategories = (t: any): SettingsCategory[] => [
  {
    name: 'application',
    label: t('settings.application'),
    icon: SettingsIcon,
    description: t('settings.applicationDescription')
  },
  {
    name: 'email',
    label: t('settings.email'),
    icon: Mail,
    description: t('settings.emailDescription')
  },
  {
    name: 'security',
    label: t('settings.security'),
    icon: Shield,
    description: t('settings.securityDescription')
  },
  {
    name: 'backup',
    label: t('settings.backup'),
    icon: Database,
    description: t('settings.backupDescription')
  },
  {
    name: 'system',
    label: t('settings.system'),
    icon: Server,
    description: t('settings.systemDescription')
  }
]

// Categories for Admin (Tenant-specific Settings)
const getAdminCategories = (t: any): SettingsCategory[] => [
  {
    name: 'store_branding',
    label: t('common.settings') === 'Settings' ? 'Store Branding' : 'Branding Toko',
    icon: SettingsIcon,
    description: t('settings.storeBrandingDescription')
  },
  {
    name: 'whatsapp_integration',
    label: t('common.settings') === 'Settings' ? 'WhatsApp Integration' : 'Integrasi WhatsApp',
    icon: MessageSquare,
    description: 'Kirim struk via WhatsApp menggunakan Fonnte'
  },
  {
    name: 'business_operations',
    label: t('common.settings') === 'Settings' ? 'Business Operations' : 'Operasi Bisnis',
    icon: Server,
    description: t('settings.businessOperationsDescription')
  },
  {
    name: 'receipt_settings',
    label: t('common.settings') === 'Settings' ? 'Receipt Settings' : 'Pengaturan Struk',
    icon: Printer,
    description: t('settings.receiptSettingsDescription')
  },
  {
    name: 'notification_settings',
    label: t('common.settings') === 'Settings' ? 'Notification Settings' : 'Pengaturan Notifikasi',
    icon: Bell,
    description: t('settings.notificationSettingsDescription')
  }
]

export default function Settings() {
  const { user } = useAuthStore()
  const { t } = useTranslation()
  const isSuperAdmin = user?.role === 'superadmin'
  const isAdmin = user?.role === 'admin'
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  // Set default active tab based on role
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'application' : 'store_branding')
  const [settings, setSettingsData] = useState<Setting[]>([])
  const [formData, setFormData] = useState<SettingsFormData>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})

  // Get categories based on user role
  const categories = isSuperAdmin ? getSuperadminCategories(t) : getAdminCategories(t)

  // Debug logging
  console.log('Settings.tsx - User:', user)
  console.log('Settings.tsx - User role:', user?.role)
  console.log('Settings.tsx - User tenant_id:', user?.tenant_id)
  console.log('Settings.tsx - isSuperAdmin:', isSuperAdmin)
  console.log('Settings.tsx - isAdmin:', isAdmin)
  console.log('Settings.tsx - Categories being used:', categories.map(c => c.name))

  const clearSettingsCacheOnly = () => {
    // Only clear settings cache, preserve auth data
    clearSettingsCache()
    console.log('Settings cache cleared (auth data preserved)')
  }

  const validateWhatsAppSettings = (key: string, value: any): string => {
    switch (key) {
      case 'fonnte_api_token':
        if (formData.whatsapp_notifications_enabled && (!value || value.trim() === '')) {
          return t('settings.validation.apiTokenRequired')
        }
        if (value && value.length < 10) {
          return t('settings.validation.apiTokenTooShort')
        }
        break

      case 'whatsapp_admin_number':
        if (formData.whatsapp_notifications_enabled && (!value || value.trim() === '')) {
          return t('settings.validation.whatsappNumberRequired')
        }
        if (value && !validateWhatsAppNumber(value, formData.whatsapp_country_code || '62')) {
          return t('settings.validation.whatsappNumberInvalid')
        }
        break

      default:
        break
    }
    return ''
  }

  const testWhatsAppConnection = async () => {
    try {
      setIsSaving(true)

      // Validate before testing
      const errors: { [key: string]: string } = {}
      const apiTokenError = validateWhatsAppSettings('fonnte_api_token', formData.fonnte_api_token)
      const phoneError = validateWhatsAppSettings('whatsapp_admin_number', formData.whatsapp_admin_number)

      if (apiTokenError) errors.fonnte_api_token = apiTokenError
      if (phoneError) errors.whatsapp_admin_number = phoneError

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        setSuccessMessage(t('settings.whatsapp.fixValidationErrors'))
        setTimeout(() => setSuccessMessage(''), 5000)
        return
      }

      const config: WhatsAppConfig = {
        apiToken: formData.fonnte_api_token || '',
        adminNumber: formatWhatsAppNumber(formData.whatsapp_admin_number || '', formData.whatsapp_country_code || '62'),
        countryCode: formData.whatsapp_country_code || '62',
        testMode: formData.whatsapp_test_mode || false
      }

      const result = await testWhatsApp(config)

      if (result.status) {
        setSuccessMessage(t('settings.whatsapp.testSuccess'))
        setTimeout(() => setSuccessMessage(''), 5000)
      } else {
        setSuccessMessage(`${t('settings.whatsapp.testFailed')}: ${result.error}`)
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    } catch (error) {
      console.error('WhatsApp test error:', error)
      setSuccessMessage(t('settings.whatsapp.testError'))
      setTimeout(() => setSuccessMessage(''), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const loadSettings = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true)

      // Clear cache if force refresh
      if (forceRefresh) {
        clearSettingsCacheOnly()
        // Add cache busting parameter
        console.log('Force refresh requested - clearing settings cache only')
      }

      const allSettings = await getAllSettings()
      console.log('Settings.tsx - allSettings received:', allSettings)
      console.log('Settings.tsx - allSettings length:', allSettings?.length || 0)
      console.log('Settings.tsx - first setting sample:', allSettings?.[0])
      console.log('Settings.tsx - allSettings categories:', allSettings?.map(s => s.category))
      console.log('Settings.tsx - admin categories expected:', categories.map(c => c.name))

      // Debug: Check if we have admin-specific settings
      const adminSettings = allSettings?.filter(s =>
        categories.some(cat => cat.name === s.category)
      )
      console.log('Settings.tsx - admin settings found:', adminSettings?.length || 0)
      console.log('Settings.tsx - admin settings:', adminSettings)

      setSettingsData(allSettings || [])

      // Convert settings array to form data object
      const formDataObj: SettingsFormData = {}
      allSettings.forEach(setting => {
        let value: any = setting.value
        // Parse value based on data type
        switch (setting.data_type) {
          case 'boolean':
            value = setting.value === 'true'
            break
          case 'number':
            value = parseFloat(setting.value)
            break
          case 'json':
            try {
              value = JSON.parse(setting.value)
            } catch {
              value = setting.value
            }
            break
        }
        formDataObj[setting.key] = value
      })
      setFormData(formDataObj)
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async (category: string) => {
    try {
      setSaving(true)

      // Get settings for this category
      const categorySettings = settings.filter(s => s.category === category)
      const updatedSettings: Record<string, any> = {}

      categorySettings.forEach(setting => {
        if (formData[setting.key] !== undefined) {
          updatedSettings[setting.key] = formData[setting.key]
        }
      })

      await setSettings(updatedSettings)
      setSuccessMessage(t('settings.settingsSaved'))

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(t('common.error'), {
        description: t('settings.settingsError')
      })
    } finally {
      setSaving(false)
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))

    // Clear validation error for this field
    if (validationErrors[key]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }

    // Real-time validation for WhatsApp settings
    if (['fonnte_api_token', 'whatsapp_admin_number'].includes(key)) {
      const error = validateWhatsAppSettings(key, value)
      if (error) {
        setValidationErrors(prev => ({ ...prev, [key]: error }))
      }
    }
  }


  // Render fallback form for admin categories when no settings found
  const renderFallbackForm = (categoryName: string) => {
    switch (categoryName) {
      case 'store_branding':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="store_name">{t('settings.storeBranding.storeName')}</Label>
              <Input
                id="store_name"
                value={formData.store_name || t('settings.storeBranding.defaultStoreName')}
                onChange={(e) => updateFormData('store_name', e.target.value)}
                placeholder={t('settings.storeBranding.storeNamePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store_address">{t('settings.storeBranding.storeAddress')}</Label>
              <Textarea
                id="store_address"
                value={formData.store_address || t('settings.storeBranding.defaultStoreAddress')}
                onChange={(e) => updateFormData('store_address', e.target.value)}
                placeholder={t('settings.storeBranding.storeAddressPlaceholder')}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store_phone">{t('settings.storeBranding.storePhone')}</Label>
              <Input
                id="store_phone"
                value={formData.store_phone || t('settings.storeBranding.defaultStorePhone')}
                onChange={(e) => updateFormData('store_phone', e.target.value)}
                placeholder={t('settings.storeBranding.storePhonePlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store_email">{t('settings.storeBranding.storeEmail')}</Label>
              <Input
                id="store_email"
                type="email"
                value={formData.store_email || t('settings.storeBranding.defaultStoreEmail')}
                onChange={(e) => updateFormData('store_email', e.target.value)}
                placeholder={t('settings.storeBranding.storeEmailPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="store_logo_url">{t('settings.storeBranding.storeLogoUrl')}</Label>
              <Input
                id="store_logo_url"
                value={formData.store_logo_url || ''}
                onChange={(e) => updateFormData('store_logo_url', e.target.value)}
                placeholder={t('settings.storeBranding.storeLogoUrlPlaceholder')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt_footer_text">{t('settings.storeBranding.receiptFooterText')}</Label>
              <Textarea
                id="receipt_footer_text"
                value={formData.receipt_footer_text || t('settings.storeBranding.defaultReceiptFooter')}
                onChange={(e) => updateFormData('receipt_footer_text', e.target.value)}
                placeholder={t('settings.storeBranding.receiptFooterPlaceholder')}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt_thank_you_message">{t('settings.storeBranding.receiptThankYouMessage')}</Label>
              <Textarea
                id="receipt_thank_you_message"
                value={formData.receipt_thank_you_message || t('settings.storeBranding.defaultThankYouMessage')}
                onChange={(e) => updateFormData('receipt_thank_you_message', e.target.value)}
                placeholder={t('settings.storeBranding.thankYouMessagePlaceholder')}
                rows={2}
              />
            </div>
          </>
        )

      case 'whatsapp_integration':
        return (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Gunakan Fonnte untuk WhatsApp</Label>
                <p className="text-sm text-muted-foreground">Kirim struk otomatis via API Fonnte</p>
              </div>
              <Switch
                checked={formData.use_fonnte || false}
                onCheckedChange={(checked) => updateFormData('use_fonnte', checked)}
              />
            </div>
            
            {formData.use_fonnte && (
              <div className="grid gap-2 pl-4 border-l-2 border-muted space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fonnte_api_key">Fonnte API Token</Label>
                  <Input
                    id="fonnte_api_key"
                    type="password"
                    value={formData.fonnte_api_key || ''}
                    onChange={(e) => updateFormData('fonnte_api_key', e.target.value)}
                    placeholder="Masukkan API Token dari fonnte.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Dapatkan token di: https://fonnte.com/token-api-key/
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Gunakan wa.me fallback</Label>
                <p className="text-sm text-muted-foreground">Jika Fonnte tidak aktif, gunakan link wa.me</p>
              </div>
              <Switch
                checked={formData.use_wa_link_fallback !== false}
                onCheckedChange={(checked) => updateFormData('use_wa_link_fallback', checked)}
              />
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Tentang Fonnte</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Fonnte adalah layanan WhatsApp API yang memungkinkan pengiriman pesan otomatis ke pelanggan.
                    Setelah mengkonfigurasi token API, struk akan otomatis dikirim ke nomor WhatsApp pelanggan setelah transaksi.
                  </p>
                  <a 
                    href="https://fonnte.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                  >
                    Kunjungi fonnte.com →
                  </a>
                </div>
              </div>
            </div>
          </>
        )

      case 'business_operations':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="default_tax_rate">{t('settings.businessOperations.defaultTaxRate')}</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="default_tax_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.default_tax_rate || 11}
                  onChange={(e) => updateFormData('default_tax_rate', parseFloat(e.target.value) || 0)}
                  placeholder="11"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency_symbol">{t('settings.businessOperations.currencySymbol')}</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol || 'Rp'}
                onChange={(e) => updateFormData('currency_symbol', e.target.value)}
                placeholder="Rp"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt_print_copies">{t('settings.businessOperations.receiptPrintCopies')}</Label>
              <Input
                id="receipt_print_copies"
                type="number"
                min="1"
                max="5"
                value={formData.receipt_print_copies || 1}
                onChange={(e) => updateFormData('receipt_print_copies', parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.businessOperations.autoPrintReceipt')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.businessOperations.autoPrintReceiptDescription')}</p>
              </div>
              <Switch
                checked={formData.auto_print_receipt || false}
                onCheckedChange={(checked) => updateFormData('auto_print_receipt', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.businessOperations.loyaltyProgramEnabled')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.businessOperations.loyaltyProgramDescription')}</p>
              </div>
              <Switch
                checked={formData.loyalty_program_enabled || false}
                onCheckedChange={(checked) => updateFormData('loyalty_program_enabled', checked)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minimum_stock_alert">{t('settings.businessOperations.minimumStockAlert')}</Label>
              <Input
                id="minimum_stock_alert"
                type="number"
                min="0"
                value={formData.minimum_stock_alert || 10}
                onChange={(e) => updateFormData('minimum_stock_alert', parseInt(e.target.value) || 0)}
                placeholder="10"
              />
            </div>
          </>
        )

      case 'receipt_settings':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="receipt_width">{t('settings.receiptSettings.receiptWidth')}</Label>
              <Select value={formData.receipt_width || '80mm'} onValueChange={(val) => updateFormData('receipt_width', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.receiptSettings.selectPaperWidth')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">{t('settings.receiptSettings.thermal58mm')}</SelectItem>
                  <SelectItem value="80mm">{t('settings.receiptSettings.thermal80mm')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.receiptSettings.showBarcodeOnReceipt')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.receiptSettings.showBarcodeDescription')}</p>
              </div>
              <Switch
                checked={formData.show_barcode_on_receipt || false}
                onCheckedChange={(checked) => updateFormData('show_barcode_on_receipt', checked)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt_language">{t('settings.receiptSettings.receiptLanguage')}</Label>
              <Select value={formData.receipt_language || 'ID'} onValueChange={(val) => updateFormData('receipt_language', val)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('settings.receiptSettings.selectReceiptLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ID">{t('settings.receiptSettings.indonesian')}</SelectItem>
                  <SelectItem value="EN">{t('settings.receiptSettings.english')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.receiptSettings.includeCustomerInfo')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.receiptSettings.includeCustomerInfoDescription')}</p>
              </div>
              <Switch
                checked={formData.include_customer_info || false}
                onCheckedChange={(checked) => updateFormData('include_customer_info', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.receiptSettings.receiptQrCodeEnabled')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.receiptSettings.qrCodeDescription')}</p>
              </div>
              <Switch
                checked={formData.receipt_qr_code_enabled || false}
                onCheckedChange={(checked) => updateFormData('receipt_qr_code_enabled', checked)}
              />
            </div>
          </>
        )

      case 'notification_settings':
        return (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notificationSettings.lowStockNotifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.notificationSettings.lowStockDescription')}</p>
              </div>
              <Switch
                checked={formData.low_stock_notifications || false}
                onCheckedChange={(checked) => updateFormData('low_stock_notifications', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('settings.notificationSettings.dailySalesReport')}</Label>
                <p className="text-sm text-muted-foreground">{t('settings.notificationSettings.dailySalesDescription')}</p>
              </div>
              <Switch
                checked={formData.daily_sales_report || false}
                onCheckedChange={(checked) => updateFormData('daily_sales_report', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications Enabled</Label>
                <p className="text-sm text-muted-foreground">Aktifkan semua notifikasi email</p>
              </div>
              <Switch
                checked={formData.email_notifications_enabled || false}
                onCheckedChange={(checked) => updateFormData('email_notifications_enabled', checked)}
              />
            </div>

            {/* WhatsApp Notifications Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center space-x-2 mb-4">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">WhatsApp Notifications</h3>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>WhatsApp Notifications Enabled</Label>
                  <p className="text-sm text-muted-foreground">Aktifkan notifikasi via WhatsApp menggunakan Fonnte API</p>
                </div>
                <Switch
                  checked={formData.whatsapp_notifications_enabled || false}
                  onCheckedChange={(checked) => updateFormData('whatsapp_notifications_enabled', checked)}
                />
              </div>

              {formData.whatsapp_notifications_enabled && (
                <>
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="fonnte_api_token">Fonnte API Token</Label>
                    <div className="relative">
                      <Input
                        id="fonnte_api_token"
                        type={formData.showApiToken ? 'text' : 'password'}
                        value={formData.fonnte_api_token || ''}
                        onChange={(e) => updateFormData('fonnte_api_token', e.target.value)}
                        placeholder="Masukkan API token dari Fonnte"
                        className={`pr-10 ${validationErrors.fonnte_api_token ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => updateFormData('showApiToken', !formData.showApiToken)}
                      >
                        {formData.showApiToken ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {validationErrors.fonnte_api_token && (
                      <p className="text-xs text-red-600">{validationErrors.fonnte_api_token}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Dapatkan API token dari{' '}
                      <a
                        href="https://docs.fonnte.com/token-api-key/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Fonnte Dashboard
                      </a>
                    </p>
                  </div>

                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="whatsapp_admin_number">WhatsApp Admin Number</Label>
                    <Input
                      id="whatsapp_admin_number"
                      value={formData.whatsapp_admin_number || ''}
                      onChange={(e) => updateFormData('whatsapp_admin_number', e.target.value)}
                      placeholder="628123456789"
                      className={validationErrors.whatsapp_admin_number ? 'border-red-500' : ''}
                    />
                    {validationErrors.whatsapp_admin_number && (
                      <p className="text-xs text-red-600">{validationErrors.whatsapp_admin_number}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Format: 628123456789 (tanpa tanda + dan spasi)
                    </p>
                  </div>

                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="whatsapp_country_code">Country Code</Label>
                    <Select
                      value={formData.whatsapp_country_code || '62'}
                      onValueChange={(val) => updateFormData('whatsapp_country_code', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kode negara" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="62">🇮🇩 Indonesia (+62)</SelectItem>
                        <SelectItem value="1">🇺🇸 United States (+1)</SelectItem>
                        <SelectItem value="44">🇬🇧 United Kingdom (+44)</SelectItem>
                        <SelectItem value="65">🇸🇬 Singapore (+65)</SelectItem>
                        <SelectItem value="60">🇲🇾 Malaysia (+60)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <Label>Test Mode</Label>
                      <p className="text-sm text-muted-foreground">Mode testing (pesan tidak akan dikirim)</p>
                    </div>
                    <Switch
                      checked={formData.whatsapp_test_mode || false}
                      onCheckedChange={(checked) => updateFormData('whatsapp_test_mode', checked)}
                    />
                  </div>

                  {formData.fonnte_api_token && formData.whatsapp_admin_number && (
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => testWhatsAppConnection()}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        {isSaving ? 'Testing...' : 'Test WhatsApp'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )

      default:
        return null
    }
  }



  useEffect(() => {
    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderSettingField = (setting: Setting) => {
    const value = formData[setting.key]

    // Special handling for specific settings with dropdowns
    if (setting.key === 'receipt_width') {
      return (
        <div key={setting.key} className="grid gap-2">
          <Label htmlFor={setting.key}>
            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Label>
          <Select value={value || '80mm'} onValueChange={(val) => updateFormData(setting.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih lebar kertas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="58mm">58mm (Thermal kecil)</SelectItem>
              <SelectItem value="80mm">80mm (Thermal standar)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{setting.description}</p>
        </div>
      )
    }

    if (setting.key === 'receipt_language') {
      return (
        <div key={setting.key} className="grid gap-2">
          <Label htmlFor={setting.key}>
            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Label>
          <Select value={value || 'ID'} onValueChange={(val) => updateFormData(setting.key, val)}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih bahasa receipt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ID">Bahasa Indonesia</SelectItem>
              <SelectItem value="EN">English</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">{setting.description}</p>
        </div>
      )
    }

    if (setting.key === 'default_tax_rate') {
      return (
        <div key={setting.key} className="grid gap-2">
          <Label htmlFor={setting.key}>
            {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Label>
          <div className="flex items-center space-x-2">
            <Input
              id={setting.key}
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={value || ''}
              onChange={(e) => updateFormData(setting.key, parseFloat(e.target.value) || 0)}
              placeholder="11"
              className="flex-1"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-sm text-muted-foreground">{setting.description}</p>
        </div>
      )
    }

    switch (setting.data_type) {
      case 'boolean':
        return (
          <div key={setting.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            </div>
            <Switch
              checked={value || false}
              onCheckedChange={(checked) => updateFormData(setting.key, checked)}
            />
          </div>
        )

      case 'number':
        return (
          <div key={setting.key} className="grid gap-2">
            <Label htmlFor={setting.key}>
              {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            <Input
              id={setting.key}
              type="number"
              min="0"
              value={value || ''}
              onChange={(e) => updateFormData(setting.key, parseFloat(e.target.value) || 0)}
              placeholder={setting.description}
            />
          </div>
        )

      default:
        return (
          <div key={setting.key} className="grid gap-2">
            <Label htmlFor={setting.key}>
              {setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Label>
            <Input
              id={setting.key}
              value={value || ''}
              onChange={(e) => updateFormData(setting.key, e.target.value)}
              placeholder={setting.description}
            />
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {isSuperAdmin ? t('settings.globalSettings') : t('settings.tenantSettings')}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              {isSuperAdmin
                ? t('settings.globalDescription')
                : t('settings.tenantDescription')
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadSettings(true)}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {t('settings.forceRefresh')}
            </Button>
          </div>
          {!isSuperAdmin && user?.tenant_id && (
            <div className="text-right">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.tenantId')}</p>
              <p className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {user.tenant_id.slice(0, 8)}...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 lg:grid-cols-4'}`}>
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger key={category.name} value={category.name} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {/* Dynamic Settings Content */}
        {categories.map((category) => {
          const categorySettings = settings.filter(s => s.category === category.name)
          console.log(`Settings.tsx - Category: ${category.name}, categorySettings:`, categorySettings)
          console.log(`Settings.tsx - Category: ${category.name}, categorySettings.length:`, categorySettings.length)
          console.log(`Settings.tsx - All settings categories:`, settings.map(s => s.category))
          console.log(`Settings.tsx - Settings data:`, settings)
          console.log(`Settings.tsx - User role for this render:`, user?.role)
          const Icon = category.icon

          return (
            <TabsContent key={category.name} value={category.name} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{category.label} {t('settings.settingsTitle')}</span>
                  </CardTitle>
                  <CardDescription>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categorySettings.length > 0 ? (
                    <>
                      {categorySettings.map(renderSettingField)}
                      <Button
                        onClick={() => saveSettings(category.name)}
                        disabled={saving}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? t('settings.saving') : `${t('settings.saveSettings')} ${category.label}`}
                      </Button>
                    </>
                  ) : (
                    // Fallback form for admin categories when no settings found
                    !isSuperAdmin && ['store_branding', 'whatsapp_integration', 'business_operations', 'receipt_settings', 'notification_settings'].includes(category.name) ? (
                      <div className="space-y-4">
                        {renderFallbackForm(category.name)}
                        <Button
                          onClick={() => saveSettings(category.name)}
                          disabled={saving}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? t('settings.saving') : `${t('settings.saveSettings')} ${category.label}`}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">
                          {t('settings.noSettings')}
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>{t('settings.debugInfo')}</p>
                          <p>{t('settings.category')} {category.name}</p>
                          <p>{t('settings.totalSettings')} {settings.length}</p>
                          <p>{t('settings.userRole')} {user?.role}</p>
                          <p>{t('settings.tenantId')}: {user?.tenant_id || 'null'}</p>
                          <p>{t('settings.availableCategories')}: {settings.map(s => s.category).join(', ')}</p>
                        </div>
                      </div>
                    )
                  )}
                </CardContent>
              </Card>

              {/* Special maintenance mode warning */}
              {category.name === 'application' && formData.maintenance_mode && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {t('settings.maintenanceWarning')}
                  </p>
                </div>
              )}

              {/* Receipt Preview */}
              {category.name === 'receipt_settings' && !isSuperAdmin && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <Printer className="w-4 h-4" />
                      <span>{t('settings.previewReceipt')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`mx-auto bg-white dark:bg-gray-100 text-black p-4 font-mono text-xs border-2 border-dashed border-gray-300 ${formData.receipt_width === '58mm' ? 'max-w-[200px]' : 'max-w-[280px]'}`}>
                      <div className="text-center mb-2">
                        <div className="font-bold text-sm">{formData.store_name || 'Vapor Store'}</div>
                        <div className="text-xs">{formData.store_address || 'Jl. Contoh No. 123, Jakarta'}</div>
                        <div className="text-xs">{formData.store_phone || '+62 21 1234 5678'}</div>
                        <div className="text-xs">{formData.store_email || 'info@vaporstore.com'}</div>
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>{t('settings.date')}</span>
                          <span>{new Date().toLocaleDateString(formData.receipt_language === 'ID' ? 'id-ID' : 'en-US')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('settings.receiptNumber')}</span>
                          <span>R001</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>Pod Vapor</span>
                          <span>1x {formData.currency_symbol || 'Rp'}150,000</span>
                        </div>
                        {formData.show_barcode_on_receipt && (
                          <div className="text-center my-1">
                            <div className="bg-black text-white px-1">|||| |||| ||||</div>
                          </div>
                        )}
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <div className="text-xs">
                        <div className="flex justify-between">
                          <span>{t('settings.subtotal')}</span>
                          <span>{formData.currency_symbol || 'Rp'}150,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('settings.tax')} ({formData.default_tax_rate || 11}%):</span>
                          <span>{formData.currency_symbol || 'Rp'}{Math.round(150000 * (formData.default_tax_rate || 11) / 100).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold">
                          <span>{t('settings.total')}</span>
                          <span>{formData.currency_symbol || 'Rp'}{Math.round(150000 * (1 + (formData.default_tax_rate || 11) / 100)).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-400 my-2"></div>
                      <div className="text-center text-xs">
                        <div>{formData.receipt_footer_text || 'Terima kasih atas kunjungan Anda!'}</div>
                        <div className="mt-1">{formData.receipt_thank_you_message || 'Selamat menikmati produk vapor Anda!'}</div>
                        {formData.receipt_qr_code_enabled && (
                          <div className="mt-2">
                            <div className="mx-auto w-12 h-12 bg-black flex items-center justify-center text-white text-xs">QR</div>
                            <div className="text-xs mt-1">{t('settings.scanForReview')}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tenant isolation info */}
              {category.name === 'store_branding' && !isSuperAdmin && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('settings.tenantIsolationInfo')}
                  </p>
                </div>
              )}
            </TabsContent>
          )
        })}


      </Tabs>
    </div>
  )
}