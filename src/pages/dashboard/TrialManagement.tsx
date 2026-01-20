import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { TrialUserTable } from '@/components/TrialUserTable';
import { TrialActionsModal } from '@/components/TrialActionsModal';
import { TrialStatsCards } from '@/components/TrialStatsCards';

interface TrialUser {
  id: string;
  email: string;
  name: string;
  store_id: string;
  subscription_plan: string;
  trial_started_at: string;
  trial_expires_at: string;
  is_active: boolean;
  is_trial_user: boolean;
  days_left: number;
  trial_status: 'active' | 'expiring' | 'expired';
  created_at: string;
}

interface TrialStats {
  active_trials: number;
  expiring_soon: number;
  expired: number;
  converted_this_month: number;
}

export function TrialManagementPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [trialUsers, setTrialUsers] = useState<TrialUser[]>([]);
  const [stats, setStats] = useState<TrialStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<TrialUser | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'extend' | 'reduce' | 'cancel'>('extend');
  const [filters, setFilters] = useState({
    status: '' as 'active' | 'expiring' | 'expired' | '',
    search: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchTrialUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/trial-users?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch trial users');
      }

      const data = await response.json();
      setTrialUsers(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [API_URL, navigate, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/trial-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Failed to fetch trial stats:', err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchTrialUsers();
    fetchStats();
  }, [fetchTrialUsers, fetchStats]);

  const handleAction = (user: TrialUser, action: 'extend' | 'reduce' | 'cancel') => {
    setSelectedUser(user);
    setActionType(action);
    setActionModalOpen(true);
  };

  const handleActionSubmit = async (days: number, reason: string) => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('token');
      const endpoint = actionType === 'extend' 
        ? 'extend' 
        : actionType === 'reduce' 
          ? 'reduce' 
          : 'cancel';

      const response = await fetch(`${API_URL}/api/admin/trial-users/${selectedUser.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(actionType !== 'cancel' ? { days, reason } : { reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Action failed');
      }

      setActionModalOpen(false);
      setSelectedUser(null);
      fetchTrialUsers();
      fetchStats();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Action failed');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trial Management</h1>
              <p className="text-sm text-gray-500 mt-1">Kelola pengguna trial dan perpanjangan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats && (
          <TrialStatsCards stats={stats} />
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow mb-4">
          <div className="p-4 flex flex-wrap gap-4 items-center border-b border-gray-200">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Cari berdasarkan nama atau email..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: '' }))}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filters.status === '' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'active' }))}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filters.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Aktif
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'expiring' }))}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filters.status === 'expiring' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Segaran Expired
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, status: 'expired' }))}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  filters.status === 'expired' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expired
              </button>
            </div>
          </div>

          <TrialUserTable
            users={trialUsers}
            loading={loading}
            onExtend={(user) => handleAction(user, 'extend')}
            onReduce={(user) => handleAction(user, 'reduce')}
            onCancel={(user) => handleAction(user, 'cancel')}
          />
        </div>
      </div>

      <TrialActionsModal
        open={actionModalOpen}
        onOpenChange={setActionModalOpen}
        user={selectedUser}
        actionType={actionType}
        onSubmit={handleActionSubmit}
      />
    </div>
  );
}
