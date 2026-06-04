import { useState } from 'react';
import { getAuditActionTypes, getAuditableEntityTypes } from '../lib/audit';
import type { AuditLogFilters as AuditLogFiltersType } from '../lib/audit';

interface AuditLogFiltersProps {
  filters: AuditLogFiltersType;
  onFiltersChange: (filters: AuditLogFiltersType) => void;
  onExport: () => void;
}

export function AuditLogFilters({ filters, onFiltersChange, onExport }: AuditLogFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const actionTypes = getAuditActionTypes();
  const entityTypes = getAuditableEntityTypes();

  const handleChange = (key: keyof AuditLogFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1
    });
  };

  const handleDateChange = (key: 'start_date' | 'end_date', value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
      page: 1
    });
  };

  const handleReset = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit
    });
  };

  const hasActiveFilters = filters.entity_type || filters.action || filters.search || filters.start_date || filters.end_date;

  return (
    <div className="bg-white rounded-lg shadow mb-4">
      <div className="p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Cari</label>
          <input
            type="text"
            placeholder="Cari berdasarkan email atau entitas..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Aksi</label>
            <select
              value={filters.action || ''}
              onChange={(e) => handleChange('action', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entitas</label>
            <select
              value={filters.entity_type || ''}
              onChange={(e) => handleChange('entity_type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua</option>
              {entityTypes.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md"
          >
            {isExpanded ? 'Sembunyikan' : 'Filter Lainnya'}
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-900 border border-red-300 rounded-md"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
            <input
              type="datetime-local"
              value={filters.start_date || ''}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
            <input
              type="datetime-local"
              value={filters.end_date || ''}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Per Page</label>
            <select
              value={filters.limit || 50}
              onChange={(e) => handleChange('limit', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      <div className="px-4 pb-4 flex justify-end">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>
    </div>
  );
}
