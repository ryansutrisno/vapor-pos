import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore, type Product } from '@/stores/cartStore'
import { createProduct } from '@/test/factories/testData'

const createTestProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p001-1111-1111-1111-111111111111',
  name: 'SMOK Nord 4',
  category: 'device',
  price: 450000,
  stock: 25,
  store_id: 'aaaa1111-1111-1111-1111-111111111111',
  tenant_id: '33333333-3333-3333-3333-333333333333',
  image_url: null,
  description: 'Pod system',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ...overrides
})

describe('CartStore', () => {
  beforeEach(() => {
    useCartStore.setState({
      items: [],
      customerName: ''
    })
  })

  describe('Initial State', () => {
    it('should have empty cart initially', () => {
      const state = useCartStore.getState()
      expect(state.items).toEqual([])
      expect(state.customerName).toBe('')
    })
  })

  describe('addItem', () => {
    it('should add new item to empty cart', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].product.id).toBe(product.id)
      expect(state.items[0].quantity).toBe(1)
    })

    it('should increment quantity for existing item', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].quantity).toBe(2)
    })

    it('should not exceed product stock', () => {
      const product = createTestProduct({ stock: 2 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })

    it('should add different products as separate items', () => {
      const product1 = createTestProduct({ id: 'p001', name: 'Product 1' })
      const product2 = createTestProduct({ id: 'p002', name: 'Product 2' })

      useCartStore.getState().addItem(product1)
      useCartStore.getState().addItem(product2)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(2)
      expect(state.items[0].product.name).toBe('Product 1')
      expect(state.items[1].product.name).toBe('Product 2')
    })
  })

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().removeItem(product.id)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('should handle removing non-existent item', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().removeItem('non-existent-id')

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const product = createTestProduct({ stock: 10 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().updateQuantity(product.id, 5)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(5)
    })

    it('should remove item when quantity is 0', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().updateQuantity(product.id, 0)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })

    it('should not exceed stock limit', () => {
      const product = createTestProduct({ stock: 5 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().updateQuantity(product.id, 10)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(1)
    })
  })

  describe('incrementQuantity', () => {
    it('should increment item quantity', () => {
      const product = createTestProduct({ stock: 10 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().incrementQuantity(product.id)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })

    it('should not exceed stock', () => {
      const product = createTestProduct({ stock: 2 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().incrementQuantity(product.id)
      useCartStore.getState().incrementQuantity(product.id)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(2)
    })
  })

  describe('decrementQuantity', () => {
    it('should decrement item quantity', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)
      useCartStore.getState().decrementQuantity(product.id)

      const state = useCartStore.getState()
      expect(state.items[0].quantity).toBe(1)
    })

    it('should remove item when quantity becomes 0', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)
      useCartStore.getState().decrementQuantity(product.id)

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('should clear all items', () => {
      const product1 = createTestProduct({ id: 'p001' })
      const product2 = createTestProduct({ id: 'p002' })

      useCartStore.getState().addItem(product1)
      useCartStore.getState().addItem(product2)
      useCartStore.getState().setCustomerName('John Doe')
      useCartStore.getState().clearCart()

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.customerName).toBe('')
    })
  })

  describe('getTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getTotal()).toBe(0)
    })

    it('should calculate total correctly for single item', () => {
      const product = createTestProduct({ price: 450000 })
      useCartStore.getState().addItem(product)

      expect(useCartStore.getState().getTotal()).toBe(450000)
    })

    it('should calculate total correctly for multiple items', () => {
      const product1 = createTestProduct({ id: 'p001', price: 450000 })
      const product2 = createTestProduct({ id: 'p002', price: 85000 })

      useCartStore.getState().addItem(product1)
      useCartStore.getState().addItem(product2)
      useCartStore.getState().addItem(product2)

      expect(useCartStore.getState().getTotal()).toBe(620000)
    })

    it('should include quantity in calculation', () => {
      const product = createTestProduct({ price: 100000 })
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)
      useCartStore.getState().addItem(product)

      expect(useCartStore.getState().getTotal()).toBe(300000)
    })
  })

  describe('getItemCount', () => {
    it('should return 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0)
    })

    it('should return total quantity of all items', () => {
      const product1 = createTestProduct({ id: 'p001' })
      const product2 = createTestProduct({ id: 'p002' })

      useCartStore.getState().addItem(product1)
      useCartStore.getState().addItem(product1)
      useCartStore.getState().addItem(product2)

      expect(useCartStore.getState().getItemCount()).toBe(3)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty cart', () => {
      expect(useCartStore.getState().isEmpty()).toBe(true)
    })

    it('should return false for non-empty cart', () => {
      const product = createTestProduct()
      useCartStore.getState().addItem(product)

      expect(useCartStore.getState().isEmpty()).toBe(false)
    })
  })

  describe('setCustomerName', () => {
    it('should set customer name', () => {
      useCartStore.getState().setCustomerName('John Doe')

      expect(useCartStore.getState().customerName).toBe('John Doe')
    })

    it('should update customer name', () => {
      useCartStore.getState().setCustomerName('John')
      useCartStore.getState().setCustomerName('Jane')

      expect(useCartStore.getState().customerName).toBe('Jane')
    })

    it('should clear customer name when set to empty', () => {
      useCartStore.getState().setCustomerName('John Doe')
      useCartStore.getState().setCustomerName('')

      expect(useCartStore.getState().customerName).toBe('')
    })
  })

  describe('Complete Cart Flow', () => {
    it('should handle complete purchase flow', () => {
      const device = createTestProduct({ id: 'p001', name: 'SMOK Nord 4', price: 450000, stock: 10 })
      const liquid = createTestProduct({ id: 'p002', name: 'Mango Ice', price: 85000, stock: 20 })

      expect(useCartStore.getState().isEmpty()).toBe(true)

      useCartStore.getState().addItem(device)
      useCartStore.getState().addItem(liquid)
      useCartStore.getState().addItem(liquid)
      useCartStore.getState().setCustomerName('John Doe')

      expect(useCartStore.getState().isEmpty()).toBe(false)
      expect(useCartStore.getState().getItemCount()).toBe(3)
      expect(useCartStore.getState().getTotal()).toBe(620000)
      expect(useCartStore.getState().customerName).toBe('John Doe')

      useCartStore.getState().clearCart()

      expect(useCartStore.getState().isEmpty()).toBe(true)
      expect(useCartStore.getState().customerName).toBe('')
    })
  })
})
