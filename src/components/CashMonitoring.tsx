/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  RefreshCw,
  Search,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from '@/lib/toast';

interface CashSession {
  id: string;
  store_id: string;
  user_id: string;
  session_date: string;
  opening_cash: number;
  closing_cash?: number;
  expected_cash?: number;
  cash_difference?: number;
  total_sales: number;
  total_expenses: number;
  cash_adjustments: number;
  notes?: string;
  status: 'open' | 'closed';
  opened_at: string;
  closed_at?: string;
  store?: {
    id: string;
    name: string;
    address: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CashMonitoringProps {
  className?: string;
}

export const CashMonitoring: React.FC<CashMonitoringProps> = ({ className }) => {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');
  const [error, setError] = useState<string>('');

  const { user } = useAuthStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDateRange = (filter: string) => {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    switch (filter) {
      case 'today':
        return {
          start: startOfDay.toISOString(),
          end: new Date(today.setHours(23, 59, 59, 999)).toISOString()
        };
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfYesterday = new Date(yesterday);
        startOfYesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(yesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        return {
          start: startOfYesterday.toISOString(),
          end: endOfYesterday.toISOString()
        };
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return {
          start: weekAgo.toISOString(),
          end: new Date().toISOString()
        };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        return {
          start: monthAgo.toISOString(),
          end: new Date().toISOString()
        };
      }
      default:
        return {
          start: startOfDay.toISOString(),
          end: new Date(today.setHours(23, 59, 59, 999)).toISOString()
        };
    }
  };

  const fetchCashSessions = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const dateRange = getDateRange(dateFilter);

      let query = supabase
        .from('cash_sessions')
        .select(`
          *,
          store:stores(id, name, address),
          user:users(id, name, email)
        `)
        .eq('tenant_id', user.tenant_id)
        .gte('session_date', dateRange.start.split('T')[0])
        .lte('session_date', dateRange.end.split('T')[0])
        .order('session_date', { ascending: false })
        .order('opened_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching cash sessions:', err);
      setError(err.message || 'Gagal memuat data sesi kas');
      toast.error('Gagal memuat data sesi kas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashSessions();
  }, [user, dateFilter, statusFilter]);

  useEffect(() => {
    const filtered = sessions.filter(session => {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.store?.name.toLowerCase().includes(searchLower) ||
        session.user?.name.toLowerCase().includes(searchLower) ||
        session.user?.email.toLowerCase().includes(searchLower)
      );
    });
    setFilteredSessions(filtered);
  }, [sessions, searchTerm]);

  const getStatusBadge = (session: CashSession) => {
    if (session.status === 'open') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Aktif
        </Badge>
      );
    }

    if (session.status === 'closed') {
      const hasDifference = session.cash_difference && Math.abs(session.cash_difference) > 0.01;
      return (
        <Badge className={`border ${hasDifference ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          <XCircle className="h-3 w-3 mr-1" />
          Tutup
        </Badge>
      );
    }

    return null;
  };

  const getCashDifferenceDisplay = (session: CashSession) => {
    if (session.status === 'open' || !session.cash_difference) {
      return '-';
    }

    const isBalanced = Math.abs(session.cash_difference) < 0.01;
    if (isBalanced) {
      return (
        <span className="text-green-600 font-medium">Seimbang</span>
      );
    }

    const color = session.cash_difference > 0 ? 'text-blue-600' : 'text-red-600';
    const sign = session.cash_difference > 0 ? '+' : '';

    return (
      <span className={`font-medium ${color}`}>
        {sign}{formatCurrency(session.cash_difference)}
      </span>
    );
  };

  const getExpectedCash = (session: CashSession) => {
    return session.opening_cash + session.total_sales - session.total_expenses + session.cash_adjustments;
  };

  const totalStats = filteredSessions.reduce((acc, session) => {
    acc.totalSales += session.total_sales;
    acc.totalExpenses += session.total_expenses;
    acc.totalAdjustments += session.cash_adjustments;
    if (session.status === 'open') {
      acc.activeSessions += 1;
    }
    return acc;
  }, {
    totalSales: 0,
    totalExpenses: 0,
    totalAdjustments: 0,
    activeSessions: 0
  });

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Memuat data kas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Monitoring Kas Toko
            </CardTitle>
            <CardDescription>
              Pantau status kas dari semua toko dalam tenant
            </CardDescription>
          </div>
          <Button
            onClick={fetchCashSessions}
            size="sm"
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Sesi Aktif</p>
            <p className="text-2xl font-bold text-green-700">{totalStats.activeSessions}</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Penjualan</p>
            <p className="text-lg font-bold text-blue-700">{formatCurrency(totalStats.totalSales)}</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Total Pengeluaran</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(totalStats.totalExpenses)}</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Penyesuaian</p>
            <p className={`text-lg font-bold ${totalStats.totalAdjustments >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
              {totalStats.totalAdjustments >= 0 ? '+' : ''}{formatCurrency(totalStats.totalAdjustments)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari toko atau kasir..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="open">Aktif</SelectItem>
              <SelectItem value="closed">Tutup</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hari Ini</SelectItem>
              <SelectItem value="yesterday">Kemarin</SelectItem>
              <SelectItem value="week">7 Hari</SelectItem>
              <SelectItem value="month">30 Hari</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Sessions Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Toko</TableHead>
                <TableHead>Kasir</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Cash Awal</TableHead>
                <TableHead className="text-right">Penjualan</TableHead>
                <TableHead className="text-right">Pengeluaran</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    Tidak ada data sesi kas
                  </TableCell>
                </TableRow>
              ) : (
                filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.store?.name}</p>
                        <p className="text-sm text-gray-500">{session.store?.address}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{session.user?.name}</p>
                        <p className="text-sm text-gray-500">{session.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{formatDate(session.session_date)}</p>
                        <p className="text-sm text-gray-500">
                          {formatTime(session.opened_at)}
                          {session.closed_at && ` - ${formatTime(session.closed_at)}`}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(session)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(session.opening_cash)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {formatCurrency(session.total_sales)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      {formatCurrency(session.total_expenses)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-blue-600">
                      {formatCurrency(getExpectedCash(session))}
                    </TableCell>
                    <TableCell className="text-right">
                      {getCashDifferenceDisplay(session)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default CashMonitoring;