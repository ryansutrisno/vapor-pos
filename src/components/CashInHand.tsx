/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStore, useStoreId } from '@/contexts/StoreContext';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import { AlertCircle, Calculator, DollarSign } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from '@/lib/toast';

interface CashInHandProps {
  isOpen: boolean;
  onClose: () => void;
  onCashSessionCreated: (sessionId: string) => void;
}

export const CashInHand: React.FC<CashInHandProps> = ({
  isOpen,
  onClose,
  onCashSessionCreated
}) => {
  const [openingCash, setOpeningCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { user } = useAuthStore();
  const { selectedStore } = useStore();
  const storeId = useStoreId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !storeId || !selectedStore) {
      setError('User atau store tidak ditemukan');
      return;
    }

    const cashAmount = parseFloat(openingCash);
    if (isNaN(cashAmount) || cashAmount < 0) {
      setError('Jumlah cash harus berupa angka yang valid dan tidak negatif');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Insert new cash session
      const { data: newSession, error: insertError } = await supabase
        .from('cash_sessions')
        .insert({
          store_id: storeId,
          user_id: user.id,
          tenant_id: user.tenant_id,
          session_date: new Date().toISOString().split('T')[0],
          opening_cash: cashAmount,
          notes: notes || null,
          status: 'open'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating cash session:', insertError);
        throw insertError;
      }

      toast.success(`Sesi kas berhasil dibuka dengan cash awal Rp ${cashAmount.toLocaleString('id-ID')}`);
      onCashSessionCreated(newSession.id);

      // Reset form
      setOpeningCash('');
      setNotes('');
      onClose();

    } catch (err: any) {
      console.error('Error creating cash session:', err);
      setError(err.message || 'Gagal membuat sesi kas');
      toast.error('Gagal membuka sesi kas');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue === '') return '';
    return parseInt(numericValue).toLocaleString('id-ID');
  };

  const handleCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setOpeningCash(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Buka Sesi Kas
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="opening-cash">Jumlah Cash Awal *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                Rp
              </span>
              <Input
                id="opening-cash"
                type="text"
                value={formatCurrency(openingCash)}
                onChange={handleCashChange}
                placeholder="0"
                className="pl-10"
                required
                disabled={isLoading}
              />
            </div>
            {openingCash && (
              <p className="text-sm text-muted-foreground">
                Rp {parseFloat(openingCash).toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tambahkan catatan untuk sesi kas ini..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !openingCash}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Calculator className="w-4 h-4 mr-2 animate-spin" />
                  Membuka...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Buka Sesi Kas
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashInHand;