import { test, expect } from '@playwright/test'

test.describe('Subscription Flow', () => {
  test('should display pricing plans', async ({ page }) => {
    await page.goto('/order')
    
    await expect(page.locator('text=Pricing Plans')).toBeVisible()
    await expect(page.locator('text=Single Store')).toBeVisible()
    await expect(page.locator('text=Multi Store 5')).toBeVisible()
    await expect(page.locator('text=Multi Store Unlimited')).toBeVisible()
  })

  test('should select plan and show checkout form', async ({ page }) => {
    await page.goto('/order')
    await page.click('[data-testid="select-plan-single_store"]')
    
    await expect(page.locator('text=Billing Information')).toBeVisible()
    await expect(page.locator('input[name="customer_name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="customer_phone"]')).toBeVisible()
    await expect(page.locator('input[name="customer_company"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/order')
    await page.click('[data-testid="select-plan-single_store"]')
    await page.click('[data-testid="place-order-button"]')
    
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
  })

  test('should switch billing cycle', async ({ page }) => {
    await page.goto('/order')
    
    await expect(page.locator('text=Monthly')).toBeVisible()
    await expect(page.locator('text=Yearly')).toBeVisible()
    
    await page.click('[data-testid="billing-cycle-yearly"]')
    await expect(page.locator('text=Save 20%')).toBeVisible()
  })
})

test.describe('Order Success Page', () => {
  test('should display payment instructions', async ({ page }) => {
    await page.goto('/order/success?order_id=ord-001')
    
    await expect(page.locator('text=Payment Successful')).toBeVisible()
    await expect(page.locator('text=Your order has been received')).toBeVisible()
  })
})

test.describe('Order Error Page', () => {
  test('should display error message', async ({ page }) => {
    await page.goto('/order/error?order_id=ord-001')
    
    await expect(page.locator('text=Payment Failed')).toBeVisible()
    await expect(page.locator('text=Try Again')).toBeVisible()
  })
})

test.describe('Trial Expiration', () => {
  test('should show trial banner when close to expiration', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'trial@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Trial expires in 2 days')).toBeVisible()
    await expect(page.locator('text=Upgrade Now')).toBeVisible()
  })

  test('should redirect to order page when trial expired', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'expired-trial@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/order.*/)
    await expect(page.locator('text=Trial Expired')).toBeVisible()
  })
})

test.describe('Order History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display order history for admin', async ({ page }) => {
    await page.click('[data-testid="orders-link"]')
    
    await expect(page.locator('text=Order History')).toBeVisible()
    await expect(page.locator('text=Date')).toBeVisible()
    await expect(page.locator('text=Plan')).toBeVisible()
    await expect(page.locator('text=Amount')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()
  })

  test('should view order details', async ({ page }) => {
    await page.click('[data-testid="orders-link"]')
    await page.click('[data-testid="order-item"]:first-child')
    
    await expect(page.locator('text=Order Details')).toBeVisible()
    await expect(page.locator('text=Customer Information')).toBeVisible()
  })
})

test.describe('Subscription Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display current subscription', async ({ page }) => {
    await page.click('[data-testid="subscription-link"]')
    
    await expect(page.locator('text=Current Plan')).toBeVisible()
    await expect(page.locator('text=Single Store')).toBeVisible()
    await expect(page.locator('text=Monthly')).toBeVisible()
  })

  test('should show renewal date', async ({ page }) => {
    await page.click('[data-testid="subscription-link"]')
    
    await expect(page.locator('text=Next Billing Date')).toBeVisible()
    await expect(page.locator('text=Renew')).toBeVisible()
  })

  test('should allow plan upgrade', async ({ page }) => {
    await page.click('[data-testid="subscription-link"]')
    await page.click('[data-testid="upgrade-plan-button"]')
    
    await expect(page.locator('text=Available Plans')).toBeVisible()
    await expect(page.locator('text=Multi Store 5')).toBeVisible()
  })
})
