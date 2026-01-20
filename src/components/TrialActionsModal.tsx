import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { TrialUser } from './TrialUserTable';

interface TrialActionsModalProps {
  user: TrialUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: 'extend' | 'reduce' | 'cancel';
  onSubmit: (days: number, reason: string) => Promise<void>;
}

export function TrialActionsModal({ user, open, onOpenChange, actionType, onSubmit }: TrialActionsModalProps) {
  const [days, setDays] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setDays(1);
      setReason('');
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (actionType !== 'cancel' && (days < 1 || days > 30)) {
      setError('Jumlah hari harus antara 1 dan 30');
      return;
    }

    if (!reason.trim()) {
      setError('Alasan harus diisi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(actionType === 'cancel' ? 0 : days, reason);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'extend':
        return 'Perpanjang Trial';
      case 'reduce':
        return 'Kurangi Trial';
      case 'cancel':
        return 'Batalkan Trial';
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case 'extend':
        return `Perpanjang trial untuk ${user.name || user.email}. Maksimal 30 hari total.`;
      case 'reduce':
        return `Kurangi trial untuk ${user.name || user.email}.`;
      case 'cancel':
        return `Batalkan trial untuk ${user.name || user.email}. Pengguna tidak akan bisa mengakses sistem.`;
    }
  };

  const getSubmitText = () => {
    switch (actionType) {
      case 'extend':
        return 'Perpanjang';
      case 'reduce':
        return 'Kurangi';
      case 'cancel':
        return 'Batalkan';
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
                <p className="text-sm text-gray-500 mt-1">{user.email}</p>
              </div>
              <Dialog.Close className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">{getDescription()}</p>

              {actionType !== 'cancel' && (
                <div className="mb-4">
                  <label htmlFor="days" className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Hari
                  </label>
                  <input
                    type="number"
                    id="days"
                    min={1}
                    max={30}
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maksimal 30 hari total. Trial saat ini: {user.days_left > 0 ? `${user.days_left} hari tersisa` : 'Sudah expired'}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan {actionType === 'extend' ? 'Perpanjangan' : actionType === 'reduce' ? 'Pengurangan' : 'Pembatalan'}
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Masukkan alasan..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">
                  <strong>Catatan:</strong> Tindakan ini akan dicatat dalam riwayat trial dan email notifikasi akan dikirim ke pengguna.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-4 py-2 rounded-md transition-colors ${
                  actionType === 'cancel'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                disabled={loading}
              >
                {loading ? 'Memproses...' : getSubmitText()}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
