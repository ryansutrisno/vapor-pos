import { faker } from '@faker-js/faker'

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  const r = Math.random() * 16 | 0
  const v = c === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})

export const userRoles = ['superadmin', 'admin', 'warehouse', 'kasir'] as const
export const productCategories = ['device', 'liquid', 'peripheral', 'service'] as const
export const subscriptionPlans = ['trial', 'single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited'] as const
export const billingCycles = ['monthly', 'yearly'] as const
export const paymentStatuses = ['pending', 'processing', 'paid', 'failed', 'expired', 'cancelled', 'refunded'] as const
export const paymentMethods = ['cash', 'card', 'transfer', 'midtrans'] as const

export const createUser = (overrides: Partial<{
  id: string
  email: string
  name: string
  role: typeof userRoles[number]
  tenant_id: string | null
  store_id: string | undefined
  subscription_plan: typeof subscriptionPlans[number]
  is_active: boolean
  email_verified: boolean
  is_trial_user: boolean
  trial_started_at: string | null
  trial_expires_at: string | null
}> = {}) => {
  const role = overrides.role || userRoles[Math.floor(Math.random() * userRoles.length)]
  const tenantId = role === 'superadmin' ? null : overrides.tenant_id || generateUUID()
  
  return {
    id: overrides.id || generateUUID(),
    email: overrides.email || faker.internet.email(),
    name: overrides.name || faker.person.fullName(),
    role,
    tenant_id: tenantId,
    store_id: overrides.store_id || (role === 'kasir' || role === 'warehouse' ? generateUUID() : undefined),
    subscription_plan: overrides.subscription_plan || subscriptionPlans[0],
    is_active: overrides.is_active ?? true,
    email_verified: overrides.email_verified ?? true,
    is_trial_user: overrides.is_trial_user ?? false,
    trial_started_at: overrides.trial_started_at || null,
    trial_expires_at: overrides.trial_expires_at || null,
    created_at: faker.date.recent().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export const createStore = (overrides: Partial<{
  id: string
  name: string
  address: string
  admin_id: string
  tenant_id: string
  is_active: boolean
}> = {}) => ({
  id: overrides.id || generateUUID(),
  name: overrides.name || `${faker.company.name()} Store`,
  address: overrides.address || faker.location.streetAddress(),
  admin_id: overrides.admin_id || generateUUID(),
  tenant_id: overrides.tenant_id || generateUUID(),
  is_active: overrides.is_active ?? true,
  created_at: faker.date.recent().toISOString(),
})

export const createProduct = (overrides: Partial<{
  id: string
  name: string
  category: typeof productCategories[number]
  price: number
  stock: number
  store_id: string
  tenant_id: string
  image_url: string | null
  description: string | null
  min_stock: number | undefined
}> = {}) => {
  const category = overrides.category || productCategories[Math.floor(Math.random() * productCategories.length)]
  const basePrice = category === 'device' ? 350000 : category === 'liquid' ? 120000 : category === 'peripheral' ? 50000 : 25000
  
  return {
    id: overrides.id || generateUUID(),
    name: overrides.name || `${faker.commerce.productName()} ${category}`,
    category,
    price: overrides.price || faker.number.float({ min: basePrice, max: basePrice * 3, multipleOf: 1000 }),
    stock: overrides.stock ?? faker.number.int({ min: 0, max: 100 }),
    store_id: overrides.store_id || generateUUID(),
    tenant_id: overrides.tenant_id || generateUUID(),
    image_url: overrides.image_url ?? (faker.datatype.boolean() ? faker.image.url() : null),
    description: overrides.description || faker.commerce.productDescription(),
    min_stock: overrides.min_stock ?? 10,
    created_at: faker.date.recent().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

export const createTransaction = (overrides: Partial<{
  id: string
  store_id: string
  cashier_id: string
  customer_name: string | null
  total_amount: number
  payment_method: typeof paymentMethods[number]
  tenant_id: string
}> = {}) => ({
  id: overrides.id || generateUUID(),
  store_id: overrides.store_id || generateUUID(),
  cashier_id: overrides.cashier_id || generateUUID(),
  customer_name: overrides.customer_name || faker.person.fullName(),
  total_amount: overrides.total_amount || faker.number.float({ min: 50000, max: 5000000, multipleOf: 1000 }),
  payment_method: overrides.payment_method || paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
  tenant_id: overrides.tenant_id || generateUUID(),
  created_at: faker.date.recent().toISOString(),
})

export const createTransactionItem = (overrides: Partial<{
  id: string
  transaction_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
}> = {}) => {
  const quantity = overrides.quantity || faker.number.int({ min: 1, max: 5 })
  const unitPrice = overrides.unit_price || faker.number.float({ min: 25000, max: 500000, multipleOf: 1000 })
  
  return {
    id: overrides.id || generateUUID(),
    transaction_id: overrides.transaction_id || generateUUID(),
    product_id: overrides.product_id || generateUUID(),
    quantity,
    unit_price: unitPrice,
    subtotal: overrides.subtotal || quantity * unitPrice,
  }
}

export const createCartItem = (overrides: Partial<{
  product: ReturnType<typeof createProduct>
  quantity: number
}> = {}) => {
  const product = overrides.product || createProduct()
  const quantity = overrides.quantity || faker.number.int({ min: 1, max: 5 })
  
  return {
    id: generateUUID(),
    product,
    quantity,
    subtotal: product.price * quantity,
  }
}

export const createCashSession = (overrides: Partial<{
  id: string
  store_id: string
  user_id: string
  opening_balance: number
  closing_balance: number | null
  status: 'open' | 'closed'
}> = {}) => ({
  id: overrides.id || generateUUID(),
  store_id: overrides.store_id || generateUUID(),
  user_id: overrides.user_id || generateUUID(),
  opening_balance: overrides.opening_balance || faker.number.float({ min: 100000, max: 500000, multipleOf: 10000 }),
  closing_balance: overrides.closing_balance ?? null,
  status: overrides.status || 'open',
  opened_at: faker.date.recent().toISOString(),
  closed_at: null,
  created_at: faker.date.recent().toISOString(),
})

export const createOrder = (overrides: Partial<{
  id: string
  email: string
  customer_name: string
  customer_phone: string
  customer_company: string
  customer_address: string
  plan_type: typeof subscriptionPlans[number]
  billing_cycle: typeof billingCycles[number]
  amount: number
  payment_status: typeof paymentStatuses[number]
}> = {}) => ({
  id: overrides.id || generateUUID(),
  email: overrides.email || faker.internet.email(),
  customer_name: overrides.customer_name || faker.person.fullName(),
  customer_phone: overrides.customer_phone || faker.phone.number(),
  customer_company: overrides.customer_company || faker.company.name(),
  customer_address: overrides.customer_address || faker.location.streetAddress(),
  customer_notes: null,
  plan_type: overrides.plan_type || 'single_store',
  billing_cycle: overrides.billing_cycle || 'monthly',
  amount: overrides.amount || 250000,
  payment_status: overrides.payment_status || 'pending',
  payment_gateway: 'midtrans',
  payment_token: null,
  payment_url: null,
  payment_gateway_transaction_id: null,
  expires_at: faker.date.future().toISOString(),
  created_at: faker.date.recent().toISOString(),
})

export const generateTestUsers = () => ({
  superadmin: createUser({ role: 'superadmin', email: 'superadmin@test.com', name: 'Test Superadmin' }),
  admin: createUser({ role: 'admin', email: 'admin@test.com', name: 'Test Admin' }),
  warehouse: createUser({ role: 'warehouse', email: 'warehouse@test.com', name: 'Test Warehouse' }),
  kasir: createUser({ role: 'kasir', email: 'kasir@test.com', name: 'Test Kasir' }),
})

export const generateTestStores = () => ({
  store1: createStore({ name: 'Vapor Store Central', address: 'Jl. Sudirman No. 123' }),
  store2: createStore({ name: 'Vapor Store Kemang', address: 'Jl. Kemang Raya No. 45' }),
})

export const generateTestProducts = () => ({
  device: createProduct({ category: 'device', name: 'SMOK Nord 4', price: 450000, stock: 25 }),
  liquid: createProduct({ category: 'liquid', name: 'Salt Nic Mango Ice 30ml', price: 85000, stock: 50 }),
  peripheral: createProduct({ category: 'peripheral', name: 'Coil SMOK LP2 0.23ohm', price: 45000, stock: 100 }),
  service: createProduct({ category: 'service', name: 'Jasa Recoil RDA', price: 25000, stock: 999 }),
})
