/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCash } from '@/contexts/CashContext';
import { AlertCircle, Calculator, CheckCircle, DollarSign, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import React, { useState } from 'react';

interface CashClosingProps {
  isOpen: boolean;
  onClose: () => void;
  onCashSessionClosed: () => void;
  currentSession: any;
  expectedCash: number;
}

export const CashClosing: React.FC<CashClosingProps> = ({
  isOpen,
  onClose,
  onCashSessionClosed,
  currentSession,
  expectedCash
}) => {
  const [actualCash, setActualCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { closeSession, getCashDifference } = useCash();

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

  const actualCashAmount = parseFloat(actualCash) || 0;
  const cashDifference = getCashDifference(actualCashAmount);
  const isBalanced = Math.abs(cashDifference) < 0.01; // Allow for small rounding differences

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSession) {
      setError('Tidak ada sesi kas yang aktif');
      return;
    }

    const cashAmount = parseFloat(actualCash);
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Jumlah cash harus berupa angka yang valid dan tidak negatif');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await closeSession(cashAmount, notes);

      if (success) {
        onCashSessionClosed();
        setActualCash('');
        setNotes('');
        onClose();
      }

    } catch (err: any) {
      console.error('Error closing cash session:', err);
      setError(err.message || 'Gagal menutup sesi kas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setActualCash('');
      setNotes('');
      setError('');
      onClose();
    }
  };

  if (!currentSession) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            Tutup Sesi Kas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Ringkasan Sesi Kas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Waktu Buka</p>
                  <p className="font-medium">{formatTime(currentSession.opened_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Durasi</p>
                  <p className="font-medium">
                    {Math.floor((Date.now() - new Date(currentSession.opened_at).getTime()) / (1000 * 60 * 60))} jam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Aliran Kas Hari Ini</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Cash Awal</span>
                  <span className="font-medium">{formatCurrency(currentSession.opening_cash)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Total Penjualan</span>
                  </div>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(currentSession.total_sales)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-gray-600">Total Pengeluaran</span>
                  </div>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(currentSession.total_expenses)}
                  </span>
                </div>

                {currentSession.cash_adjustments !== 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Penyesuaian</span>
                    <span className={`font-medium ${currentSession.cash_adjustments >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {currentSession.cash_adjustments >= 0 ? '+' : ''}
                      {formatCurrency(currentSession.cash_adjustments)}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-900">Expected Cash</span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(expectedCash)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actual Cash Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actual-cash" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Jumlah Cash Aktual (Rp)
              </Label>
              <Input
                id="actual-cash"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={actualCash}
                onChange={(e) => setActualCash(e.target.value)}
                required
                disabled={isLoading}
                className="text-right text-lg"
              />
              {actualCash && !isNaN(parseFloat(actualCash)) && (
                <p className="text-sm text-gray-600">
                  {formatCurrency(parseFloat(actualCash))}
                </p>
              )}
            </div>

            {/* Cash Difference Display */}
            {actualCash && !isNaN(parseFloat(actualCash)) && (
              <Card className={`border-2 ${isBalanced
                  ? 'border-green-200 bg-green-50'
                  : cashDifference > 0
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-red-200 bg-red-50'
                }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isBalanced ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span className="font-medium">
                        {isBalanced ? 'Kas Seimbang' : 'Selisih Kas'}
                      </span>
                    </div>
                    <span className={`font-bold text-lg ${isBalanced
                        ? 'text-green-600'
                        : cashDifference > 0
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}>
                      {isBalanced ? '✓' : (
                        (cashDifference > 0 ? '+' : '') + formatCurrency(Math.abs(cashDifference))
                      )}
                    </span>
                  </div>
                  {!isBalanced && (
                    <p className="text-sm text-gray-600 mt-2">
                      {cashDifference > 0
                        ? 'Cash lebih dari yang diharapkan'
                        : 'Cash kurang dari yang diharapkan'
                      }
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              <Label htmlFor="closing-notes">Catatan Penutupan (Opsional)</Label>
              <Textarea
                id="closing-notes"
                placeholder="Catatan untuk penutupan sesi kas ini..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !actualCash}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? 'Menutup...' : 'Tutup Sesi Kas'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CashClosing;