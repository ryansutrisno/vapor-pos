import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display user management page', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    
    await expect(page.locator('text=User Management')).toBeVisible()
    await expect(page.locator('text=Add User')).toBeVisible()
    await expect(page.locator('text=Name')).toBeVisible()
    await expect(page.locator('text=Email')).toBeVisible()
    await expect(page.locator('text=Role')).toBeVisible()
  })

  test('should list all users', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    
    await expect(page.locator('[data-testid="user-list"]')).toBeVisible()
  })

  test('should filter users by role', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.selectOption('[data-testid="role-filter"]', 'kasir')
    
    await expect(page.locator('text=Filter applied')).toBeVisible()
  })

  test('should search users', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.fill('input[name="search"]', 'john')
    
    await expect(page.locator('text=Search results for "john"')).toBeVisible()
  })

  test('should open add user modal', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="add-user-button"]')
    
    await expect(page.locator('text=Add New User')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('select[name="role"]')).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="add-user-button"]')
    await page.click('[data-testid="save-user-button"]')
    
    await expect(page.locator('text=Name is required')).toBeVisible()
    await expect(page.locator('text=Email is required')).toBeVisible()
  })

  test('should edit user', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="user-menu"]:first-child')
    await page.click('[data-testid="edit-user-button"]')
    
    await expect(page.locator('text=Edit User')).toBeVisible()
  })

  test('should deactivate user', async ({ page }) => {
    await page.click('[data-testid="users-link"]')
    await page.click('[data-testid="user-menu"]:first-child')
    await page.click('[data-testid="deactivate-user-button"]')
    
    await expect(page.locator('text=User deactivated')).toBeVisible()
  })
})

test.describe('Store Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display store management page', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    
    await expect(page.locator('text=Store Management')).toBeVisible()
    await expect(page.locator('text=Add Store')).toBeVisible()
  })

  test('should list all stores', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    
    await expect(page.locator('[data-testid="store-list"]')).toBeVisible()
  })

  test('should open add store modal', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    await page.click('[data-testid="add-store-button"]')
    
    await expect(page.locator('text=Add New Store')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="address"]')).toBeVisible()
  })

  test('should view store details', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    await page.click('[data-testid="store-card"]:first-child')
    
    await expect(page.locator('text=Store Details')).toBeVisible()
    await expect(page.locator('text=Staff')).toBeVisible()
    await expect(page.locator('text=Products')).toBeVisible()
  })

  test('should edit store', async ({ page }) => {
    await page.click('[data-testid="stores-link"]')
    await page.click('[data-testid="store-card"]:first-child')
    await page.click('[data-testid="edit-store-button"]')
    
    await expect(page.locator('text=Edit Store')).toBeVisible()
  })
})

test.describe('Role Permissions', () => {
  test('superadmin should access all features', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'superadmin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Users')).toBeVisible()
    await expect(page.locator('text=Stores')).toBeVisible()
    await expect(page.locator('text=Settings')).toBeVisible()
  })

  test('admin should access store management', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Stores')).toBeVisible()
    await expect(page.locator('text=Products')).toBeVisible()
  })

  test('warehouse should access inventory only', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'warehouse@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Products')).toBeVisible()
    await expect(page.locator('text=Inventory')).toBeVisible()
  })

  test('kasir should access POS only', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await expect(page.locator('text=Products')).toBeVisible()
    await expect(page.locator('text=Cart')).toBeVisible()
  })
})

test.describe('Superadmin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'superadmin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display dashboard overview', async ({ page }) => {
    await expect(page.locator('text=Total Users')).toBeVisible()
    await expect(page.locator('text=Total Stores')).toBeVisible()
    await expect(page.locator('text=Total Revenue')).toBeVisible()
    await expect(page.locator('text=Active Subscriptions')).toBeVisible()
  })

  test('should show recent activity', async ({ page }) => {
    await expect(page.locator('text=Recent Activity')).toBeVisible()
    await expect(page.locator('text=New Registrations')).toBeVisible()
    await expect(page.locator('text=Recent Orders')).toBeVisible()
  })

  test('should display platform statistics', async ({ page }) => {
    await expect(page.locator('text=Platform Stats')).toBeVisible()
    await expect(page.locator('text=Trial Users')).toBeVisible()
    await expect(page.locator('text=Paid Users')).toBeVisible()
  })

  test('should access global settings', async ({ page }) => {
    await page.click('[data-testid="settings-link"]')
    
    await expect(page.locator('text=Global Settings')).toBeVisible()
    await expect(page.locator('text=Payment Settings')).toBeVisible()
  })
})
