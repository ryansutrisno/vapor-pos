import { test, expect } from '@playwright/test'

test.describe('Cash Session Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
  })

  test('should display cash session status', async ({ page }) => {
    await expect(page.locator('text=Cash Session')).toBeVisible()
    await expect(page.locator('text=Open Session')).toBeVisible()
    await expect(page.locator('text=Close Session')).toBeVisible()
  })

  test('should open cash session', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await expect(page.locator('text=Session opened successfully')).toBeVisible()
    await expect(page.locator('text=Rp 500.000')).toBeVisible()
  })

  test('should show error for already open session', async ({ page }) => {
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
    
    await page.click('[data-testid="open-session-button"]')
    
    await expect(page.locator('text=Sesi kas sudah terbuka')).toBeVisible()
  })
})

test.describe('Cash Operations', () => {
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

  test('should display current cash amount', async ({ page }) => {
    await expect(page.locator('[data-testid="current-cash"]')).toBeVisible()
    await expect(page.locator('text=Rp')).toBeVisible()
  })

  test('should display session details', async ({ page }) => {
    await expect(page.locator('text=Opening Cash')).toBeVisible()
    await expect(page.locator('text=Total Sales')).toBeVisible()
    await expect(page.locator('text=Total Expenses')).toBeVisible()
    await expect(page.locator('text=Adjustments')).toBeVisible()
  })
})

test.describe('Expense Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
  })

  test('should show expense form', async ({ page }) => {
    await page.click('[data-testid="add-expense-button"]')
    
    await expect(page.locator('input[name="expenseAmount"]')).toBeVisible()
    await expect(page.locator('input[name="expenseDescription"]')).toBeVisible()
  })

  test('should record expense', async ({ page }) => {
    await page.click('[data-testid="add-expense-button"]')
    await page.fill('input[name="expenseAmount"]', '50000')
    await page.fill('input[name="expenseDescription"]', 'Office supplies')
    await page.click('[data-testid="confirm-expense"]')
    
    await expect(page.locator('text=Expense recorded')).toBeVisible()
  })

  test('should show validation error for negative amount', async ({ page }) => {
    await page.click('[data-testid="add-expense-button"]')
    await page.fill('input[name="expenseAmount"]', '-1000')
    await page.click('[data-testid="confirm-expense"]')
    
    await expect(page.locator('text=Jumlah tidak valid')).toBeVisible()
  })
})

test.describe('Cash Reconciliation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'kasir@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="open-session-button"]')
    await page.fill('input[name="openingCash"]', '500000')
    await page.click('[data-testid="confirm-open-session"]')
  })

  test('should close cash session', async ({ page }) => {
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '600000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Session closed successfully')).toBeVisible()
  })

  test('should show reconciliation details', async ({ page }) => {
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '600000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Expected:')).toBeVisible()
    await expect(page.locator('text=Actual:')).toBeVisible()
    await expect(page.locator('text=Difference:')).toBeVisible()
  })

  test('should show shortage warning', async ({ page }) => {
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '550000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Shortage')).toBeVisible()
  })

  test('should show surplus indicator', async ({ page }) => {
    await page.click('[data-testid="close-session-button"]')
    await page.fill('input[name="closingCash"]', '700000')
    await page.click('[data-testid="confirm-close-session"]')
    
    await expect(page.locator('text=Surplus')).toBeVisible()
  })
})

test.describe('Session History', () => {
  test('should display session history', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="cash-management-link"]')
    
    await expect(page.locator('text=Session History')).toBeVisible()
    await expect(page.locator('text=Date')).toBeVisible()
    await expect(page.locator('text=Cashier')).toBeVisible()
    await expect(page.locator('text=Opening')).toBeVisible()
    await expect(page.locator('text=Closing')).toBeVisible()
  })

  test('should filter sessions by date', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@test.com')
    await page.fill('input[name="password"]', 'test123')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/.*dashboard.*/)
    
    await page.click('[data-testid="cash-management-link"]')
    await page.fill('input[name="startDate"]', '2026-01-01')
    await page.fill('input[name="endDate"]', '2026-01-31')
    await page.click('[data-testid="filter-sessions"]')
    
    await expect(page.locator('text=Filter applied')).toBeVisible()
  })
})
