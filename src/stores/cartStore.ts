import { create } from 'zustand'

export interface CartItem {
  product: Product
  quantity: number
  subtotal?: number
}

export interface Product {
  id: string
  name: string
  category: 'device' | 'liquid' | 'peripheral' | 'service'
  price: number
  stock: number
  store_id: string
  tenant_id: string
  image_url?: string | null
  description?: string | null
  created_at: string
  updated_at: string
}

interface CartState {
  items: CartItem[]
  customerName: string
  setCustomerName: (name: string) => void
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  incrementQuantity: (productId: string) => void
  decrementQuantity: (productId: string) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
  isEmpty: () => boolean
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  customerName: '',

  setCustomerName: (name: string) => {
    set({ customerName: name })
  },

  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find(item => item.product.id === product.id)
      
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
          return {
            items: state.items.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          }
        }
        return state
      }
      
      return {
        items: [...state.items, { product, quantity: 1 }]
      }
    })
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter(item => item.product.id !== productId)
    }))
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId)
      return
    }

    set((state) => {
      const item = state.items.find(item => item.product.id === productId)
      if (!item) return state

      if (quantity > item.product.stock) {
        return state
      }

      return {
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      }
    })
  },

  incrementQuantity: (productId: string) => {
    set((state) => {
      const item = state.items.find(item => item.product.id === productId)
      if (!item) return state

      if (item.quantity >= item.product.stock) {
        return state
      }

      return {
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
    })
  },

  decrementQuantity: (productId: string) => {
    set((state) => {
      const item = state.items.find(item => item.product.id === productId)
      if (!item) return state

      if (item.quantity <= 1) {
        return {
          items: state.items.filter(i => i.product.id !== productId)
        }
      }

      return {
        items: state.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
    })
  },

  clearCart: () => {
    set({ items: [], customerName: '' })
  },

  getTotal: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  },

  getItemCount: () => {
    const { items } = get()
    return items.reduce((sum, item) => sum + item.quantity, 0)
  },

  isEmpty: () => {
    const { items } = get()
    return items.length === 0
  }
}))

export type { CartState }
