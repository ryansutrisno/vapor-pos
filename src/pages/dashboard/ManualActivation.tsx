import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import * as Tabs from '@radix-ui/react-tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/lib/toast';

interface PaidUserRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  store_name: string;
  subscription_plan: string;
  subscription_months: number;
}

interface ManualPaymentRequest {
  user_id: string;
  amount: number;
  payment_method: string;
  notes?: string;
}

export function ManualActivationPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<PaidUserRequest>({
    name: '',
    email: '',
    password: '',
    store_name: '',
    subscription_plan: 'single_store',
    subscription_months: 1
  });

  const [paymentForm, setPaymentForm] = useState<ManualPaymentRequest>({
    user_id: '',
    amount: 0,
    payment_method: 'cash',
    notes: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  if (!user || user.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">Hanya superadmin yang dapat mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  const handleCreatePaidUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/create-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal membuat pengguna berbayar');
      }

      toast.success('Pengguna berbayar berhasil dibuat');
      setCreateForm({
        name: '',
        email: '',
        password: '',
        store_name: '',
        subscription_plan: 'single_store',
        subscription_months: 1
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.user_id) {
      setError('Pilih pengguna yang akan diaktifkan');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/users/${paymentForm.user_id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_method: paymentForm.payment_method,
          amount: paymentForm.amount,
          notes: paymentForm.notes
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal mengaktifkan pengguna');
      }

      toast.success('Pengguna trial berhasil diaktifkan menjadi berbayar');
      setPaymentForm({
        user_id: '',
        amount: 0,
        payment_method: 'cash',
        notes: ''
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900"> Aktivasi Manual</h1>
              <p className="text-sm text-gray-500 mt-1">Buat pengguna berbayar atau aktifkan trial pengguna</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <Tabs.Root defaultValue="create" className="space-y-4">
          <Tabs.List className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <Tabs.Trigger
              value="create"
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
            >
              Buat Pengguna Baru
            </Tabs.Trigger>
            <Tabs.Trigger
              value="activate"
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm transition-all"
            >
              Aktifkan Trial
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="create">
            <Card>
              <CardHeader>
                <CardTitle>Buat Pengguna Berbayar Langsung</CardTitle>
                <CardDescription>
                  Buat pengguna baru dengan status berbayar langsung tanpa melalui trial
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreatePaidUser} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={createForm.email}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={createForm.password}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="********"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
                      <Input
                        id="phone"
                        value={createForm.phone || ''}
                        onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+62812345678"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="store_name">Nama Toko</Label>
                    <Input
                      id="store_name"
                      value={createForm.store_name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, store_name: e.target.value }))}
                      placeholder="Toko Vapor Saya"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subscription_plan">Paket Langganan</Label>
                      <Select
                        value={createForm.subscription_plan}
                        onValueChange={(value) => setCreateForm(prev => ({ ...prev, subscription_plan: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih paket" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_store">Single Store</SelectItem>
                          <SelectItem value="multi_store_5">Multi Store (5)</SelectItem>
                          <SelectItem value="multi_store_20">Multi Store (20)</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subscription_months">Durasi Langganan (Bulan)</Label>
                      <Select
                        value={createForm.subscription_months.toString()}
                        onValueChange={(value) => setCreateForm(prev => ({ ...prev, subscription_months: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih durasi" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Bulan</SelectItem>
                          <SelectItem value="3">3 Bulan</SelectItem>
                          <SelectItem value="6">6 Bulan</SelectItem>
                          <SelectItem value="12">12 Bulan</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Catatan:</strong> Pengguna akan langsung memiliki akses penuh tanpa trial. Email dengan kredensial akan dikirimkan ke alamat email yang diberikan.
                    </p>
                  </div>

                  <Button type="submit" disabled={loading}>
                    {loading ? 'Memproses...' : 'Buat Pengguna'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Tabs.Content>

          <Tabs.Content value="activate">
            <Card>
              <CardHeader>
                <CardTitle>Aktifkan Pengguna Trial</CardTitle>
                <CardDescription>
                  Konversi pengguna trial menjadi pengguna berbayar secara manual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleActivateTrial} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_id">Pilih Pengguna Trial</Label>
                    <Select
                      value={paymentForm.user_id}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, user_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pengguna" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial-1">trial-1@example.com - 5 hari tersisa</SelectItem>
                        <SelectItem value="trial-2">trial-2@example.com - 12 hari tersisa</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Atau gunakan fitur di halaman Trial Management untuk mengaktifkan pengguna trial
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Jumlah Pembayaran</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="150000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Metode Pembayaran</Label>
                      <Select
                        value={paymentForm.payment_method}
                        onValueChange={(value) => setPaymentForm(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Tunai</SelectItem>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="credit_card">Kartu Kredit</SelectItem>
                          <SelectItem value="other">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <textarea
                      id="notes"
                      value={paymentForm.notes}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Catatan pembayaran..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Perhatian:</strong> Pengguna trial akan langsung dikonversi menjadi pengguna berbayar. Langganan akan dimulai dari tanggal aktivasi.
                    </p>
                  </div>

                  <Button type="submit" disabled={loading || !paymentForm.user_id}>
                    {loading ? 'Memproses...' : 'Aktifkan Pengguna'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}
