import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AuditLogEntry, getActionLabel, getActionColorClass, getEntityTypeLabel, formatDate, computeDiff } from '../lib/audit';

interface AuditLogDetailModalProps {
  log: AuditLogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuditLogDetailModal({ log, open, onOpenChange }: AuditLogDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'changes' | 'raw'>('changes');

  useEffect(() => {
    if (open && log) {
      setActiveTab('changes');
    }
  }, [open, log]);

  if (!log) return null;

  const renderValue = (value: unknown): string => {
    if (value === undefined) return '<tidak ada>';
    if (value === null) return '<null>';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Detail Audit Log</h2>
                <p className="text-sm text-gray-500">ID: {log.id}</p>
              </div>
              <Dialog.Close className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>

            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Aksi</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getActionColorClass(log.action)}`}>
                    {getActionLabel(log.action)}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Entitas</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{getEntityTypeLabel(log.entity_type)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">User</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{log.user_email || 'System'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Waktu</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(log.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('changes')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'changes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Perubahan
              </button>
              <button
                onClick={() => setActiveTab('raw')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'raw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Data Mentah
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {activeTab === 'changes' ? (
                log.action === 'UPDATE' && log.old_values && log.new_values ? (
                  <div className="space-y-3">
                    {computeDiff(log.old_values, log.new_values).map((change, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className={`px-4 py-2 text-sm font-medium ${
                          change.type === 'added' ? 'bg-green-50 text-green-800' :
                          change.type === 'removed' ? 'bg-red-50 text-red-800' :
                          'bg-blue-50 text-blue-800'
                        }`}>
                          {change.type === 'added' && '+ '}
                          {change.type === 'removed' && '- '}
                          {change.type === 'changed' && '~ '}
                          {change.field}
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                          <div className="p-4 bg-red-50/30">
                            <p className="text-xs font-medium text-red-600 mb-1">Sebelum</p>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                              {renderValue(change.oldValue)}
                            </pre>
                          </div>
                          <div className="p-4 bg-green-50/30">
                            <p className="text-xs font-medium text-green-600 mb-1">Sesudah</p>
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                              {renderValue(change.newValue)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                    {computeDiff(log.old_values, log.new_values).length === 0 && (
                      <p className="text-center text-gray-500 py-8">Tidak ada perubahan terdeteksi</p>
                    )}
                  </div>
                ) : log.action === 'CREATE' && log.new_values ? (
                  <div className="space-y-3">
                    <div className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-green-50 text-green-800 text-sm font-medium">
                        Data Baru
                      </div>
                      <div className="p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : log.action === 'DELETE' && log.old_values ? (
                  <div className="space-y-3">
                    <div className="border border-red-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-red-50 text-red-800 text-sm font-medium">
                        Data yang Dihapus
                      </div>
                      <div className="p-4">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Tidak ada data perubahan</p>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {log.old_values && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium">
                        old_values
                      </div>
                      <div className="p-4 overflow-auto max-h-[400px]">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.old_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {log.new_values && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium">
                        new_values
                      </div>
                      <div className="p-4 overflow-auto max-h-[400px]">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.new_values, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                  {log.metadata && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden md:col-span-2">
                      <div className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium">
                        metadata
                      </div>
                      <div className="p-4 overflow-auto max-h-[300px]">
                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
