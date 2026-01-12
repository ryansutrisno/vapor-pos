import { test, expect } from '@playwright/test'

test.describe('Complete POS Sale Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    await expect(page.locator('text=Session opened successfully')).toBeVisible()
  })

  test('should complete full sale flow: browse → add to cart → checkout → receipt', async ({ page }) => {
    await expect(page.locator('text=Products')).toBeVisible()
    
    await page.click('[data-testid="product-card"]:first-child')
    await page.click('button:has-text("Add"):first-of-type')
    
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible()
    
    await page.fill('input[name="customerName"]', 'Ahmad Wijaya')
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Transaction successful')).toBeVisible()
    await expect(page.locator('text=Receipt')).toBeVisible()
  })

  test('should handle multiple item sale', async ({ page }) => {
    await page.click('[data-testid="product-card"]:has-text("SMOK") >> text=Add')
    await page.click('[data-testid="product-card"]:has-text("Liquid") >> text=Add')
    await page.click('[data-testid="product-card"]:has-text("Coil") >> text=Add')
    
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(3)
    
    await page.fill('input[name="customerName"]', 'Budi Santoso')
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Transaction successful')).toBeVisible()
    await expect(page.locator('text=Total:')).toBeVisible()
  })

  test('should generate receipt after checkout', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'Test Customer')
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Receipt Preview')).toBeVisible()
    await expect(page.locator('text=Date:')).toBeVisible()
    await expect(page.locator('text=Invoice #:')).toBeVisible()
    await expect(page.locator('button:has-text("Download PDF")')).toBeVisible()
  })
})

test.describe('New Store Setup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should create new store', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    await page.click('[data-testid="add-store-button"]')
    
    await expect(page.locator('text=Add New Store')).toBeVisible()
    
    await page.fill('input[name="name"]', 'Vapor Store Bandung')
    await page.fill('input[name="address"]', 'Jl. Braga No. 45, Bandung')
    await page.fill('input[name="phone"]', '081234567890')
    await page.click('[data-testid="save-store-button"]')
    
    await expect(page.locator('text=Store created successfully')).toBeVisible()
  })

  test('should add products to new store', async ({ page }) => {
    await page.click('[data-testid="products-link"]')
    await page.click('[data-testid="add-product-button"]')
    
    await expect(page.locator('text=Add New Product')).toBeVisible()
    
    await page.fill('input[name="name"]', 'Voopoo Drag 5')
    await page.selectOption('select[name="category"]', 'device')
    await page.fill('input[name="price"]', '650000')
    await page.fill('input[name="stock"]', '10')
    await page.click('[data-testid="save-product-button"]')
    
    await expect(page.locator('text=Product added successfully')).toBeVisible()
  })

  test('should create new kasir user for store', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="add-user-button"]')
    
    await expect(page.locator('text=Add New User')).toBeVisible()
    
    await page.fill('input[name="name"]', 'Kasir Baru')
    await page.fill('input[name="email"]', 'kasir.baru@test.com')
    await page.fill('input[name="password"]', 'password123')
    await page.selectOption('select[name="role"]', 'kasir')
    await page.click('[data-testid="save-user-button"]')
    
    await expect(page.locator('text=User created successfully')).toBeVisible()
  })

  test('should assign user to store', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="user-menu"]:first-child')
    await page.click('[data-testid="assign-store-button"]')
    
    await expect(page.locator('text=Assign to Store')).toBeVisible()
    await page.selectOption('select[name="store"]', 'Vapor Store Bandung')
    await page.click('[data-testid="confirm-assign-store"]')
    
    await expect(page.locator('text=Store assigned successfully')).toBeVisible()
  })
})

test.describe('Trial to Paid Conversion Flow', () => {
  test('should show upgrade prompt during trial', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'trial@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Upgrade to Premium')).toBeVisible()
    await expect(page.locator('text=Trial expires in')).toBeVisible()
  })

  test('should navigate to order page from upgrade prompt', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'trial@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('button:has-text("Upgrade Now")')
    
    await expect(page).toHaveURL(/\/order.*/)
    await expect(page.locator('text=Pricing Plans')).toBeVisible()
  })

  test('should complete subscription purchase', async ({ page }) => {
    await page.goto('/order')
    
    await expect(page.locator('text=Single Store')).toBeVisible()
    await expect(page.locator('text=Multi Store')).toBeVisible()
    
    await page.click('[data-testid="select-plan-single_store"]')
    
    await page.fill('input[name="customer_name"]', 'PT Vapor Indonesia')
    await page.fill('input[name="email"]', 'admin@vapor.com')
    await page.fill('input[name="customer_phone"]', '081234567890')
    await page.fill('input[name="customer_company"]', 'PT Vapor Indonesia')
    await page.click('[data-testid="place-order-button"]')
    
    await expect(page).toHaveURL(/\/order\/success.*/)
    await expect(page.locator('text=Order Received')).toBeVisible()
  })

  test('should show paid subscription status', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'paid@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="subscription-link"]')
    
    await expect(page.locator('text=Current Plan')).toBeVisible()
    await expect(page.locator('text=Single Store')).toBeVisible()
    await expect(page.locator('text=Active')).toBeVisible()
  })
})

test.describe('Daily Operations Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should open cash session at start of day', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '1000000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await expect(page.locator('text=Session opened successfully')).toBeVisible()
    await expect(page.locator('text=Rp 1.000.000')).toBeVisible()
  })

  test('should record sales throughout the day', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'Customer 1')
    await page.click('[data-testid="checkout-button"]')
    
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'Customer 2')
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Total Sales')).toBeVisible()
  })

  test('should record expenses during operations', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await page.click('[data-testid="add-expense-button"]')
    await page.fill('input[name="expenseAmount"]', '50000')
    await page.fill('input[name="expenseDescription"]', 'Packaging materials')
    await page.click('[data-testid="confirm-expense"]')
    
    await expect(page.locator('text=Expense recorded')).toBeVisible()
  })

  test('should close cash session and reconcile', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'Test Customer')
    await page.click('[data-testid="checkout-button"]')
    
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '600000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Session closed successfully')).toBeVisible()
    await expect(page.locator('text=Surplus')).toBeVisible()
  })

  test('should view daily summary report', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'Test Customer')
    await page.click('[data-testid="checkout-button"]')
    
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '600000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Daily Summary')).toBeVisible()
    await expect(page.locator('text=Opening:')).toBeVisible()
    await expect(page.locator('text=Closing:')).toBeVisible()
    await expect(page.locator('text=Total Sales:')).toBeVisible()
  })
})

test.describe('End-to-End Customer Journey', () => {
  test('complete customer journey from registration to first sale', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="name"]', 'John Doe')
    await page.fill('input[name="email"]', 'john@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.fill('input[name="company"]', 'John Vapor Shop')
    await page.fill('input[name="phone"]', '081234567890')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/verify-email.*/)
    
    await page.fill('input[name="token"]', '123456')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/.*dashboard.*/)
    await expect(page.locator('text=Welcome')).toBeVisible()
    await expect(page.locator('text=Trial expires in 14 days')).toBeVisible()
    
    await page.click('[data-testid="stores-link"]')
    await page.click('[data-testid="add-store-button"]')
    await page.fill('input[name="name"]', 'John Vapor Store')
    await page.fill('input[name="address"]', 'Jl. Veteran No. 1')
    await page.click('[data-testid="save-store-button"]')
    
    await expect(page.locator('text=Store created successfully')).toBeVisible()
    
    await page.click('[data-testid="products-link"]')
    await page.click('[data-testid="add-product-button"]')
    await page.fill('input[name="name"]', 'SMOK Nord 4')
    await page.selectOption('select[name="category"]', 'device')
    await page.fill('input[name="price"]', '450000')
    await page.fill('input[name="stock"]', '20')
    await page.click('[data-testid="save-product-button"]')
    
    await expect(page.locator('text=Product added successfully')).toBeVisible()
    
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="add-user-button"]')
    await page.fill('input[name="name"]', 'Kasir Satu')
    await page.fill('input[name="email"]', 'kasir1@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.selectOption('select[name="role"]', 'kasir')
    await page.click('[data-testid="save-user-button"]')
    
    await expect(page.locator('text=User created successfully')).toBeVisible()
  })
})
