import { test, expect } from '@playwright/test'

test.describe('Authentication E2E Tests', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.goto('/login')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })

  test('should show error for invalid email format', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid email format')).toBeVisible()
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')
    
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="company"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
  })

  test('should show validation errors for invalid registration data', async ({ page }) => {
    await page.goto('/register')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', '123')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid email format')).toBeVisible()
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible()
  })

  test('should display verification form', async ({ page }) => {
    await page.goto('/verify-email')
    
    await expect(page.locator('input[name="token"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})

test.describe('Role-Based Redirect Tests', () => {
  test('superadmin should access admin routes', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'superadmin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/.*dashboard.*/)
  })

  test('admin should be redirected to admin dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/.*dashboard.*/)
  })

  test('kasir should be redirected to cashier dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/.*dashboard.*/)
  })
})

test.describe('Logout Flow', () => {
  test('should logout successfully', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="logout-button"]')
    
    await expect(page).toHaveURL('/login')
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
