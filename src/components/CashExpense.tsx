/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCash } from '@/contexts/CashContext';
import { AlertCircle, Receipt, TrendingDown } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from '@/lib/toast';

interface CashExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseRecorded: () => void;
}

const expenseCategories = [
  { value: 'supplies', label: 'Perlengkapan Toko' },
  { value: 'maintenance', label: 'Perawatan & Perbaikan' },
  { value: 'utilities', label: 'Listrik & Air' },
  { value: 'transport', label: 'Transport & Pengiriman' },
  { value: 'food', label: 'Konsumsi' },
  { value: 'emergency', label: 'Darurat' },
  { value: 'other', label: 'Lainnya' }
];

export const CashExpense: React.FC<CashExpenseProps> = ({
  isOpen,
  onClose,
  onExpenseRecorded
}) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { recordExpense, currentSession } = useCash();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSession) {
      setError('Tidak ada sesi kas yang aktif');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      setError('Jumlah pengeluaran harus berupa angka yang valid dan lebih dari 0');
      return;
    }

    if (!category) {
      setError('Silakan pilih kategori pengeluaran');
      return;
    }

    if (!description.trim()) {
      setError('Deskripsi pengeluaran harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const categoryLabel = expenseCategories.find(cat => cat.value === category)?.label || category;
      const fullDescription = `${categoryLabel}: ${description.trim()}`;
      const finalDescription = notes.trim() ? `${fullDescription} (${notes.trim()})` : fullDescription;

      const success = await recordExpense(expenseAmount, finalDescription);

      if (success) {
        toast.success(`Pengeluaran Rp ${expenseAmount.toLocaleString('id-ID')} berhasil dicatat`);
        onExpenseRecorded();

        // Reset form
        setAmount('');
        setCategory('');
        setDescription('');
        setNotes('');
        onClose();
      } else {
        setError('Gagal mencatat pengeluaran');
      }

    } catch (err: any) {
      console.error('Error recording expense:', err);
      setError(err.message || 'Gagal mencatat pengeluaran');
      toast.error('Gagal mencatat pengeluaran');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAmount('');
      setCategory('');
      setDescription('');
      setNotes('');
      setError('');
      onClose();
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('id-ID');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            Catat Pengeluaran Kas
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="expense-amount" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Jumlah Pengeluaran (Rp)
            </Label>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isLoading}
              className="text-right"
            />
            {amount && !isNaN(parseFloat(amount)) && (
              <p className="text-sm text-gray-600">
                Rp {formatCurrency(amount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-category">Kategori Pengeluaran</Label>
            <Select value={category} onValueChange={setCategory} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori pengeluaran" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-description">Deskripsi Pengeluaran</Label>
            <Input
              id="expense-description"
              placeholder="Contoh: Beli tisu, sabun, dll"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-notes">Catatan Tambahan (Opsional)</Label>
            <Textarea
              id="expense-notes"
              placeholder="Catatan tambahan untuk pengeluaran ini..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              rows={2}
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
              disabled={isLoading || !amount || !category || !description.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Mencatat...' : 'Catat Pengeluaran'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashExpense;