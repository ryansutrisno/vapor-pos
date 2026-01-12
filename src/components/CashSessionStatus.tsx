/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCash } from '@/contexts/CashContext';
import { AlertCircle, Calculator, Clock, DollarSign, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import CashAdjustment from './CashAdjustment';
import CashClosing from './CashClosing';
import CashExpense from './CashExpense';
import CashInHand from './CashInHand';

interface CashSessionStatusProps {
  className?: string;
}

export const CashSessionStatus: React.FC<CashSessionStatusProps> = ({ className }) => {
  const [showCashInHand, setShowCashInHand] = useState(false);
  const [showCashClosing, setShowCashClosing] = useState(false);
  const [showCashExpense, setShowCashExpense] = useState(false);
  const [showCashAdjustment, setShowCashAdjustment] = useState(false);

  const {
    currentSession,
    isSessionActive,
    isLoading,
    error,
    getExpectedCash,
    refreshSession
  } = useCash();

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

  const handleCashSessionCreated = (sessionId: string) => {
    refreshSession();
  };

  const handleCashSessionClosed = () => {
    refreshSession();
  };

  const handleExpenseRecorded = () => {
    refreshSession();
  };

  const handleAdjustmentRecorded = () => {
    refreshSession();
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Memuat status kas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isSessionActive) {
    return (
      <>
        <Card className={className}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sesi Kas</h3>
                  <p className="text-sm text-gray-600">Belum ada sesi kas aktif hari ini</p>
                </div>
              </div>
              <Button
                onClick={() => setShowCashInHand(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                Buka Kas
              </Button>
            </div>
          </CardContent>
        </Card>

        <CashInHand
          isOpen={showCashInHand}
          onClose={() => setShowCashInHand(false)}
          onCashSessionCreated={handleCashSessionCreated}
        />
      </>
    );
  }

  const expectedCash = getExpectedCash();
  const netCashFlow = currentSession.total_sales - currentSession.total_expenses + currentSession.cash_adjustments;

  return (
    <>
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">Sesi Kas Aktif</h3>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Buka
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Dibuka: {formatTime(currentSession.opened_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCashExpense(true)}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Minus className="h-3 w-3 mr-1" />
                  Pengeluaran
                </Button>
                <Button
                  onClick={() => setShowCashAdjustment(true)}
                  size="sm"
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <Calculator className="h-3 w-3 mr-1" />
                  Penyesuaian
                </Button>
                <Button
                  onClick={() => setShowCashClosing(true)}
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  Tutup Kas
                </Button>
              </div>
            </div>

            {/* Cash Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Cash Awal</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(currentSession.opening_cash)}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Penjualan</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <p className="text-sm font-semibold text-green-600">
                    {formatCurrency(currentSession.total_sales)}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pengeluaran</p>
                <div className="flex items-center justify-center gap-1">
                  <TrendingDown className="h-3 w-3 text-red-600" />
                  <p className="text-sm font-semibold text-red-600">
                    {formatCurrency(currentSession.total_expenses)}
                  </p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Expected Cash</p>
                <div className="flex items-center justify-center gap-1">
                  <Calculator className="h-3 w-3 text-blue-600" />
                  <p className="text-sm font-semibold text-blue-600">
                    {formatCurrency(expectedCash)}
                  </p>
                </div>
              </div>
            </div>

            {/* Net Cash Flow */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Net Cash Flow:</span>
                <span className={`text-sm font-semibold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                </span>
              </div>
            </div>

            {/* Adjustments (if any) */}
            {currentSession.cash_adjustments !== 0 && (
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Penyesuaian</p>
                <p className={`text-sm font-semibold ${currentSession.cash_adjustments >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {currentSession.cash_adjustments >= 0 ? '+' : ''}
                  {formatCurrency(currentSession.cash_adjustments)}
                </p>
              </div>
            )}

            {/* Notes (if any) */}
            {currentSession.notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Catatan</p>
                <p className="text-sm text-gray-700">{currentSession.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <CashClosing
        isOpen={showCashClosing}
        onClose={() => setShowCashClosing(false)}
        onCashSessionClosed={handleCashSessionClosed}
        currentSession={currentSession}
        expectedCash={expectedCash}
      />

      <CashExpense
        isOpen={showCashExpense}
        onClose={() => setShowCashExpense(false)}
        onExpenseRecorded={handleExpenseRecorded}
      />

      <CashAdjustment
        isOpen={showCashAdjustment}
        onClose={() => setShowCashAdjustment(false)}
        onAdjustmentRecorded={handleAdjustmentRecorded}
      />
    </>
  );
};

export default CashSessionStatus;