import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building2, MapPin, Users, CheckCircle } from 'lucide-react'
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

interface StoreSelectionProps {
  onStoreSelected: (store: Store) => void
}

export default function StoreSelection({ onStoreSelected }: StoreSelectionProps) {
  const { user } = useAuthStore()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableStores()
  }, [user])

  const fetchAvailableStores = async () => {
    if (!user) return

    try {
      // For kasir role, get stores from their tenant
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      setStores(data || [])
    } catch (error) {
      console.error('Error fetching stores:', error)
      toast.error('Gagal memuat daftar cabang')
    } finally {
      setLoading(false)
    }
  }

  const handleStoreSelection = async (store: Store) => {
    if (!user) return

    try {
      setSelectedStore(store.id)
      
      // Update user's store_id in database
      const { error } = await supabase
        .from('users')
        .update({ store_id: store.id })
        .eq('id', user.id)

      if (error) throw error

      // Update local user state
      const updatedUser = { ...user, store_id: store.id }
      useAuthStore.getState().setUser(updatedUser)

      toast.success(`Berhasil memilih cabang: ${store.name}`)
      onStoreSelected(store)
    } catch (error) {
      console.error('Error selecting store:', error)
      toast.error('Gagal memilih cabang')
      setSelectedStore(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-pulse space-y-6 w-full max-w-4xl mx-auto p-6">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-64 mx-auto" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Pilih Cabang Toko
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Selamat datang, {user?.name}! Pilih cabang toko tempat Anda bertugas hari ini.
          </p>
        </div>

        {/* Store Grid */}
        {stores.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Tidak Ada Cabang Tersedia
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Belum ada cabang toko yang tersedia untuk akun Anda. Silakan hubungi administrator.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Card 
                key={store.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                  selectedStore === store.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                    : 'hover:border-blue-300'
                }`}
                onClick={() => handleStoreSelection(store)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                        {store.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4 mr-1" />
                          {store.address}
                        </div>
                      </CardDescription>
                    </div>
                    {selectedStore === store.id && (
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Cabang Aktif
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ID: {store.id.slice(0, 8)}
                      </Badge>
                    </div>
                    
                    <Button 
                      className={`w-full ${
                        selectedStore === store.id 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                      disabled={selectedStore === store.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStoreSelection(store)
                      }}
                    >
                      {selectedStore === store.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Terpilih
                        </>
                      ) : (
                        'Pilih Cabang'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pastikan Anda memilih cabang yang sesuai dengan lokasi kerja Anda hari ini.
          </p>
        </div>
      </div>
    </div>
  )
}