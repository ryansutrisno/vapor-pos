import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { toast } from '@/lib/toast'

interface Store {
  id: string
  name: string
  address: string
  tenant_id: string
  is_active: boolean
}

interface StoreContextType {
  selectedStore: Store | null
  availableStores: Store[]
  loading: boolean
  selectStore: (store: Store) => Promise<void>
  refreshStores: () => Promise<void>
  clearStore: () => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

interface StoreProviderProps {
  children: ReactNode
}

export function StoreProvider({ children }: StoreProviderProps) {
  const { user } = useAuthStore()
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [availableStores, setAvailableStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)

  // Load user's assigned store on mount
  useEffect(() => {
    if (user) {
      if (user.role === 'kasir' && user.store_id) {
        // Auto-load assigned store for kasir
        loadUserStore()
      }
      // Load available stores for all users
      loadAvailableStores()
    }
  }, [user])

  const loadUserStore = async () => {
    if (!user || !user.store_id) return

    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', user.store_id)
        .single()

      if (error) throw error
      setSelectedStore(data)
    } catch (error) {
      console.error('Error loading user store:', error)
    }
  }

  const loadAvailableStores = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      // Only filter by tenant_id if user is not superadmin
      if (user.tenant_id !== null) {
        query = query.eq('tenant_id', user.tenant_id)
      }
      // Superadmin (tenant_id = null) will see all active stores

      const { data, error } = await query

      if (error) throw error
      setAvailableStores(data || [])
    } catch (error) {
      console.error('Error loading available stores:', error)
      toast.error('Gagal memuat daftar cabang')
    } finally {
      setLoading(false)
    }
  }

  const selectStore = async (store: Store) => {
    if (!user) return

    try {
      // Update user's store_id in database
      const { error } = await supabase
        .from('users')
        .update({ store_id: store.id })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setSelectedStore(store)
      
      // Update auth store
      const updatedUser = { ...user, store_id: store.id }
      useAuthStore.getState().setUser(updatedUser)

      toast.success(`Berhasil memilih cabang: ${store.name}`)
    } catch (error) {
      console.error('Error selecting store:', error)
      toast.error('Gagal memilih cabang')
      throw error
    }
  }

  const refreshStores = async () => {
    await loadAvailableStores()
    if (user?.store_id) {
      await loadUserStore()
    }
  }

  const clearStore = () => {
    setSelectedStore(null)
  }

  const value: StoreContextType = {
    selectedStore,
    availableStores,
    loading,
    selectStore,
    refreshStores,
    clearStore
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

// Hook to get current store ID for queries
export function useStoreId(): string | null {
  const { selectedStore } = useStore()
  const { user } = useAuthStore()
  
  // For kasir role, always use their assigned store_id
  if (user?.role === 'kasir') {
    return user?.store_id || null
  }
  
  // For other roles, use selected store or null
  return selectedStore?.id || null
}

// Hook to check if user needs to select a store
export function useRequiresStoreSelection(): boolean {
  const { user } = useAuthStore()
  
  // Kasir with assigned store_id should not need store selection
  if (user?.role === 'kasir') {
    return false // Kasir always uses assigned store or gets error message
  }
  
  // For other roles that might need store selection in the future
  return false
}