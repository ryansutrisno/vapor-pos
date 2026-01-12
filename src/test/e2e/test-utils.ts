import { faker } from '@faker-js/faker'
import type { Page } from '@playwright/test'

export const generateTestEmail = () => faker.internet.email()
export const generateTestPhone = () => faker.phone.number()
export const generateTestCompany = () => `${faker.company.name()}`
export const generateTestAddress = () => `${faker.location.streetAddress()}, ${faker.location.city()}`

export const waitForLoad = async (page: Page) => {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

export const fillLoginForm = async (page: Page, email: string = 'admin@test.com', password: string = 'test123') => {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/.*dashboard.*/)
}

export const openCashSession = async (page: Page, amount: number = 500000) => {
  await page.click('[data-testid="open-session-button"]')
  await page.fill('input[name="openingCash"]', String(amount))
  await page.click('[data-testid="confirm-open-session"]')
  await page.locator('text=Session opened successfully').first().isVisible({ timeout: 5000 })
}

export const closeCashSession = async (page: Page, closingAmount: number) => {
  await page.click('[data-testid="close-session-button"]')
  await page.fill('input[name="closingCash"]', String(closingAmount))
  await page.click('[data-testid="confirm-close-session"]')
  await page.locator('text=Session closed successfully').first().isVisible({ timeout: 5000 })
}

export const addProductToCart = async (page: Page, productName?: string) => {
  if (productName) {
    await page.click(`[data-testid="product-card"]:has-text("${productName}") >> text=Add`)
  } else {
    await page.click('[data-testid="product-card"]:first-child >> text=Add')
  }
}

export const checkoutWithCustomer = async (page: Page, customerName: string) => {
  await page.fill('input[name="customerName"]', customerName)
  await page.click('[data-testid="checkout-button"]')
  await page.locator('text=Transaction successful').first().isVisible({ timeout: 5000 })
}

export const createStore = async (page: Page, name: string, address: string) => {
  await page.click('[data-testid="stores-link"]')
  await page.click('[data-testid="add-store-button"]')
  await page.fill('input[name="name"]', name)
  await page.fill('input[name="address"]', address)
  await page.click('[data-testid="save-store-button"]')
  await page.locator('text=Store created successfully').first().isVisible({ timeout: 5000 })
}

export const createProduct = async (page: Page, name: string, category: string, price: number, stock: number) => {
  await page.click('[data-testid="products-link"]')
  await page.click('[data-testid="add-product-button"]')
  await page.fill('input[name="name"]', name)
  await page.selectOption('select[name="category"]', category)
  await page.fill('input[name="price"]', String(price))
  await page.fill('input[name="stock"]', String(stock))
  await page.click('[data-testid="save-product-button"]')
  await page.locator('text=Product added successfully').first().isVisible({ timeout: 5000 })
}

export const createUser = async (page: Page, name: string, email: string, role: string) => {
  await page.click('[data-testid="users-link"]')
  await page.click('[data-testid="add-user-button"]')
  await page.fill('input[name="name"]', name)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', 'password123')
  await page.selectOption('select[name="role"]', role)
  await page.click('[data-testid="save-user-button"]')
  await page.locator('text=User created successfully').first().isVisible({ timeout: 5000 })
}

export const recordExpense = async (page: Page, amount: number, description: string) => {
  await page.click('[data-testid="add-expense-button"]')
  await page.fill('input[name="expenseAmount"]', String(amount))
  await page.fill('input[name="expenseDescription"]', description)
  await page.click('[data-testid="confirm-expense"]')
  await page.locator('text=Expense recorded').first().isVisible({ timeout: 5000 })
}

export const navigateToPOS = async (page: Page) => {
  await page.click('[data-testid="pos-link"]')
  await page.locator('text=Products').first().isVisible()
}

export const navigateToCashManagement = async (page: Page) => {
  await page.click('[data-testid="cash-management-link"]')
  await page.locator('text=Cash Sessions').first().isVisible()
}

export const navigateToReports = async (page: Page) => {
  await page.click('[data-testid="reports-link"]')
  await page.locator('text=Reports').first().isVisible()
}

export const navigateToSubscription = async (page: Page) => {
  await page.click('[data-testid="subscription-link"]')
  await page.locator('text=Subscription').first().isVisible()
}

export const selectPlan = async (page: Page, planId: string) => {
  await page.click(`[data-testid="select-plan-${planId}"]`)
}

export const completeSubscriptionOrder = async (page: Page, customerData: {
  name: string
  email: string
  phone: string
  company: string
}) => {
  await page.fill('input[name="customer_name"]', customerData.name)
  await page.fill('input[name="email"]', customerData.email)
  await page.fill('input[name="customer_phone"]', customerData.phone)
  await page.fill('input[name="customer_company"]', customerData.company)
  await page.click('[data-testid="place-order-button"]')
}
