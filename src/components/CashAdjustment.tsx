/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCash } from '@/contexts/CashContext';
import { AlertCircle, Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from '@/lib/toast';

interface CashAdjustmentProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjustmentRecorded: () => void;
}

const adjustmentTypes = [
  { value: 'add', label: 'Penambahan Kas', icon: TrendingUp, color: 'text-green-600' },
  { value: 'subtract', label: 'Pengurangan Kas', icon: TrendingDown, color: 'text-red-600' }
];

const adjustmentReasons = [
  { value: 'cash_deposit', label: 'Setoran Kas Tambahan' },
  { value: 'cash_withdrawal', label: 'Penarikan Kas' },
  { value: 'correction', label: 'Koreksi Perhitungan' },
  { value: 'refund', label: 'Refund Pelanggan' },
  { value: 'change_shortage', label: 'Kekurangan Uang Kembalian' },
  { value: 'damaged_money', label: 'Uang Rusak/Tidak Layak' },
  { value: 'other', label: 'Lainnya' }
];

export const CashAdjustment: React.FC<CashAdjustmentProps> = ({
  isOpen,
  onClose,
  onAdjustmentRecorded
}) => {
  const [amount, setAmount] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const { recordAdjustment, currentSession } = useCash();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentSession) {
      setError('Tidak ada sesi kas yang aktif');
      return;
    }

    const adjustmentAmount = parseFloat(amount);
    if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
      setError('Jumlah penyesuaian harus berupa angka yang valid dan lebih dari 0');
      return;
    }

    if (!type) {
      setError('Silakan pilih jenis penyesuaian');
      return;
    }

    if (!reason) {
      setError('Silakan pilih alasan penyesuaian');
      return;
    }

    if (!description.trim()) {
      setError('Deskripsi penyesuaian harus diisi');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const typeLabel = adjustmentTypes.find(t => t.value === type)?.label || type;
      const reasonLabel = adjustmentReasons.find(r => r.value === reason)?.label || reason;
      const fullDescription = `${typeLabel} - ${reasonLabel}: ${description.trim()}`;

      // Calculate final amount (negative for subtraction)
      const finalAmount = type === 'subtract' ? -adjustmentAmount : adjustmentAmount;

      const success = await recordAdjustment(finalAmount, fullDescription);

      if (success) {
        const actionText = type === 'add' ? 'ditambahkan' : 'dikurangi';
        toast.success(`Kas berhasil ${actionText} sebesar Rp ${adjustmentAmount.toLocaleString('id-ID')}`);
        onAdjustmentRecorded();

        // Reset form
        setAmount('');
        setType('');
        setReason('');
        setDescription('');
        onClose();
      } else {
        setError('Gagal mencatat penyesuaian kas');
      }

    } catch (err: any) {
      console.error('Error recording adjustment:', err);
      setError(err.message || 'Gagal mencatat penyesuaian kas');
      toast.error('Gagal mencatat penyesuaian kas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAmount('');
      setType('');
      setReason('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return num.toLocaleString('id-ID');
  };

  const selectedType = adjustmentTypes.find(t => t.value === type);
  const IconComponent = selectedType?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            Penyesuaian Kas
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjustment-type">Jenis Penyesuaian</Label>
            <Select value={type} onValueChange={setType} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis penyesuaian" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentTypes.map((adjType) => {
                  const Icon = adjType.icon;
                  return (
                    <SelectItem key={adjType.value} value={adjType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${adjType.color}`} />
                        <span>{adjType.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-amount" className="flex items-center gap-2">
              {IconComponent && <IconComponent className={`h-4 w-4 ${selectedType?.color}`} />}
              Jumlah (Rp)
            </Label>
            <Input
              id="adjustment-amount"
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
              <p className={`text-sm ${type === 'add' ? 'text-green-600' : type === 'subtract' ? 'text-red-600' : 'text-gray-600'
                }`}>
                {type === 'add' ? '+' : type === 'subtract' ? '-' : ''}Rp {formatCurrency(amount)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-reason">Alasan Penyesuaian</Label>
            <Select value={reason} onValueChange={setReason} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih alasan penyesuaian" />
              </SelectTrigger>
              <SelectContent>
                {adjustmentReasons.map((reasonItem) => (
                  <SelectItem key={reasonItem.value} value={reasonItem.value}>
                    {reasonItem.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment-description">Deskripsi Detail</Label>
            <Textarea
              id="adjustment-description"
              placeholder="Jelaskan detail penyesuaian kas ini..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
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
              disabled={isLoading || !amount || !type || !reason || !description.trim()}
              className={`flex-1 ${type === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : type === 'subtract'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isLoading ? 'Mencatat...' : 'Catat Penyesuaian'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashAdjustment;