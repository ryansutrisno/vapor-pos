import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Shield, Calendar, Save, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/hooks/useTheme'
import { toast } from '@/lib/toast'

const roleLabels = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  warehouse: 'Warehouse',
  kasir: 'Kasir'
}

const roleColors = {
  superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  warehouse: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  kasir: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
}

export default function Profile() {
  const { user, setUser } = useAuthStore()
  const { theme, toggleTheme } = useTheme()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUser(data)
      setIsEditing(false)
      toast.success('Profil berhasil diperbarui!', {
        description: 'Informasi profil Anda telah berhasil diperbarui'
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Terjadi kesalahan saat memperbarui profil', {
        description: 'Silakan coba lagi atau hubungi administrator'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru dan konfirmasi password tidak cocok', {
        description: 'Pastikan kedua password yang dimasukkan sama'
      })
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter', {
        description: 'Gunakan password yang lebih kuat untuk keamanan akun'
      })
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      })

      if (error) throw error

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setIsChangingPassword(false)
      toast.success('Password berhasil diubah!', {
        description: 'Password akun Anda telah berhasil diperbarui'
      })
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Terjadi kesalahan saat mengubah password', {
        description: 'Silakan coba lagi atau hubungi administrator'
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) return null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profil Pengguna</h1>
        <p className="text-slate-600 dark:text-slate-300">Kelola informasi akun dan preferensi Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Informasi dasar akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xl">
                      {(user?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{user?.name || user?.email?.split('@')[0] || 'User'}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={roleColors[user?.role || 'kasir']}>
                         {(user?.role || 'kasir').toUpperCase()}
                       </Badge>
                       <Badge variant={(user?.is_active !== false) ? 'default' : 'secondary'}>
                         {(user?.is_active !== false) ? 'Aktif' : 'Nonaktif'}
                       </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white">{user.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Role</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white">{roleLabels[user.role]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Bergabung</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white">{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-500 dark:text-slate-400">Terakhir Diperbarui</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-900 dark:text-white">{formatDate(user.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button onClick={() => setIsEditing(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Edit Profil
                  </Button>
                  <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                    Ubah Password
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({ name: user?.name || user?.email?.split('@')[0] || '', email: user?.email || '' })
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan</CardTitle>
            <CardDescription>
              Preferensi aplikasi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Mode Gelap</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ubah tampilan aplikasi
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? '🌞' : '🌙'}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Paket Berlangganan</Label>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  {(user?.subscription_plan || 'single_store')?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      {isChangingPassword && (
        <Card className="fixed inset-0 z-50 m-4 md:m-8 lg:max-w-md lg:mx-auto lg:my-16">
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>
              Masukkan password baru untuk akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="newPassword">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Mengubah...' : 'Ubah Password'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      {isChangingPassword && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40" 
          onClick={() => setIsChangingPassword(false)}
        />
      )}
    </div>
  )
}