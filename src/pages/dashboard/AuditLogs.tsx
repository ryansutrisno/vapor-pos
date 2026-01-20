import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditLogEntry, AuditLogFilters, PaginatedAuditLogs, AuditStats } from '../../lib/audit';
import { useAuthStore } from '@/stores/authStore';
import { useAuditLogsRealtime } from '../../hooks/useAuditLogsRealtime';
import { AuditLogTable } from '../../components/AuditLogTable';
import { AuditLogFilters as AuditLogFiltersComponent } from '../../components/AuditLogFilters';
import { AuditLogDetailModal } from '../../components/AuditLogDetailModal';

export function AuditLogsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 50
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(filters.page || 1));
      params.set('limit', String(filters.limit || 50));

      if (filters.entity_type) params.set('entity_type', filters.entity_type);
      if (filters.action) params.set('action', filters.action);
      if (filters.user_id) params.set('user_id', filters.user_id);
      if (filters.entity_id) params.set('entity_id', filters.entity_id);
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);
      if (filters.search) params.set('search', filters.search);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/audit-logs?${params.toString()}`, {
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
        throw new Error('Failed to fetch audit logs');
      }

      const data: PaginatedAuditLogs = await response.json();
      setLogs(data.data);
      setPagination({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [filters, API_URL, navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/audit-logs/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch stats');
      const data: AuditStats = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [API_URL]);

  const handleNewLog = useCallback((newLog: AuditLogEntry) => {
    setLogs(prevLogs => [newLog, ...prevLogs]);
    setStats(prevStats => prevStats ? {
      ...prevStats,
      totalLogs: prevStats.totalLogs + 1,
      todayLogs: prevStats.todayLogs + 1,
      recentActivity: {
        ...prevStats.recentActivity,
        last24Hours: prevStats.recentActivity.last24Hours + 1,
        last7Days: prevStats.recentActivity.last7Days + 1,
        last30Days: prevStats.recentActivity.last30Days + 1
      }
    } : null);
  }, []);

  const { isConnected } = useAuditLogsRealtime({
    tenantId: user?.tenant_id || null,
    enabled: true,
    onNewLog: handleNewLog
  });

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetail = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();

      if (filters.entity_type) params.set('entity_type', filters.entity_type);
      if (filters.action) params.set('action', filters.action);
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);

      const response = await fetch(`${API_URL}/api/audit-logs/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(Object.fromEntries(params))
      });

      if (!response.ok) throw new Error('Failed to export');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-sm text-gray-500 mt-1">Riwayat aktivitas sistem dan pengguna</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                {isConnected ? 'Realtime Aktif' : 'Offline'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Total Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalLogs.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">Hari Ini</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayLogs.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">24 Jam Terakhir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.last24Hours.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm font-medium text-gray-500">7 Hari Terakhir</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentActivity.last7Days.toLocaleString()}</p>
            </div>
          </div>
        )}

        <AuditLogFiltersComponent
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onExport={handleExport}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <AuditLogTable
          logs={logs}
          loading={loading}
          onViewDetail={handleViewDetail}
        />

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3 mt-4">
            <p className="text-sm text-gray-700">
              Menampilkan <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> -{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari{' '}
              <span className="font-medium">{pagination.total}</span> hasil
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AuditLogDetailModal
        log={selectedLog}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
      />
    </div>
  );
}
