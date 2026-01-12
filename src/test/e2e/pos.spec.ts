import { test, expect } from '@playwright/test'

test.describe('POS Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display POS interface', async ({ page }) => {
    await expect(page.locator('text=Products')).toBeVisible()
    await expect(page.locator('text=Cart')).toBeVisible()
    await expect(page.locator('text=Total')).toBeVisible()
  })

  test('should add product to cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    
    await expect(page.locator('text=Cart')).toBeVisible()
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible()
  })

  test('should increase quantity in cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.click('[data-testid="increment-quantity"]')
    
    await expect(page.locator('[data-testid="quantity"]')).toHaveText('2')
  })

  test('should decrease quantity in cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.click('[data-testid="increment-quantity"]')
    await page.click('[data-testid="decrement-quantity"]')
    
    await expect(page.locator('[data-testid="quantity"]')).toHaveText('1')
  })

  test('should remove item from cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.click('[data-testid="remove-item"]')
    
    await expect(page.locator('[data-testid="cart-item"]')).not.toBeVisible()
  })

  test('should show cart total', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    
    await expect(page.locator('[data-testid="cart-total"]')).toBeVisible()
  })

  test('should clear cart', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.click('[data-testid="clear-cart"]')
    
    await expect(page.locator('[data-testid="cart-item"]')).not.toBeVisible()
    await expect(page.locator('[data-testid="cart-total"]')).toHaveText('Rp 0')
  })

  test('should process checkout', async ({ page }) => {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
    await page.fill('input[name="customerName"]', 'John Doe')
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Transaction successful')).toBeVisible()
  })

  test('should show error for empty cart checkout', async ({ page }) => {
    await page.click('[data-testid="checkout-button"]')
    
    await expect(page.locator('text=Cart is empty')).toBeVisible()
  })

  test('should filter products by category', async ({ page }) => {
    await page.click('[data-testid="category-device"]')
    
    await expect(page.locator('[data-testid="category-device"]')).toHaveClass(/active/)
  })

  test('should search products', async ({ page }) => {
    await page.fill('input[name="search"]', 'SMOK')
    
    await expect(page.locator('text=SMOK')).toBeVisible()
  })
})

test.describe('Transaction History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display recent transactions', async ({ page }) => {
    await expect(page.locator('text=Recent Transactions')).toBeVisible()
  })

  test('should show transaction details', async ({ page }) => {
    await page.click('[data-testid="transaction-item"]:first-child')
    
    await expect(page.locator('text=Transaction Details')).toBeVisible()
  })
})

test.describe('Store Selection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should show store selector', async ({ page }) => {
    await expect(page.locator('[data-testid="store-selector"]')).toBeVisible()
  })

  test('should change store', async ({ page }) => {
    await page.click('[data-testid="store-selector"]')
    await page.click('[data-testid="store-option"]:first-child')
    
    await expect(page.locator('text=Products')).toBeVisible()
  })
})
