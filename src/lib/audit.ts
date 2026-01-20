export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'OTHER';

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  is_deleted: boolean;
}

export interface AuditLogFilters {
  page?: number;
  limit?: number;
  entity_type?: string;
  action?: AuditAction;
  user_id?: string;
  entity_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export interface PaginatedAuditLogs {
  data: AuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  recentActivity: {
    last24Hours: number;
    last7Days: number;
    last30Days: number;
  };
}

const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'api_key',
  'api_key_secret',
  'secret',
  'token',
  'access_key',
  'access_secret',
  'private_key',
  'private_key_passphrase',
  'card_number',
  'cvv',
  'cvc',
  'account_number',
  'routing_number',
  'credit_card',
  'debit_card',
  'auth_token',
  'refresh_token',
  'session_token',
  'encryption_key',
  'hmac_key',
  'salt',
  'hash'
];

const ENTITY_TYPE_LABELS: Record<string, string> = {
  users: 'Users',
  stores: 'Stores',
  products: 'Products',
  categories: 'Categories',
  customers: 'Customers',
  settings: 'Settings',
  cash_sessions: 'Cash Sessions',
  orders: 'Orders',
  order_status_history: 'Order Status History',
  stock_movements: 'Stock Movements'
};

const ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Create',
  UPDATE: 'Update',
  DELETE: 'Delete',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  EXPORT: 'Export',
  OTHER: 'Other'
};

const ACTION_COLORS: Record<AuditAction, string> = {
  CREATE: 'bg-green-100 text-green-800',
  UPDATE: 'bg-blue-100 text-blue-800',
  DELETE: 'bg-red-100 text-red-800',
  LOGIN: 'bg-purple-100 text-purple-800',
  LOGOUT: 'bg-gray-100 text-gray-800',
  EXPORT: 'bg-yellow-100 text-yellow-800',
  OTHER: 'bg-gray-100 text-gray-800'
};

export function isSensitiveField(key: string): boolean {
  const lowerKey = key.toLowerCase();
  return SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()));
}

export function maskSensitiveData(obj: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!obj) return null;

  const masked: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      masked[key] = '***MASKED***';
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      masked[key] = maskSensitiveData(value as Record<string, unknown>);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

export function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] || entityType;
}

export function getActionLabel(action: AuditAction): string {
  return ACTION_LABELS[action] || action;
}

export function getActionColorClass(action: AuditAction): string {
  return ACTION_COLORS[action] || 'bg-gray-100 text-gray-800';
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Baru saja';
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return formatDate(dateString);
}

export function computeDiff(
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null
): Array<{ field: string; oldValue: unknown; newValue: unknown; type: 'added' | 'removed' | 'changed' }> {
  const diff: Array<{ field: string; oldValue: unknown; newValue: unknown; type: 'added' | 'removed' | 'changed' }> = [];

  const allKeys = new Set([
    ...(oldValues ? Object.keys(oldValues) : []),
    ...(newValues ? Object.keys(newValues) : [])
  ]);

  for (const key of allKeys) {
    const oldVal = oldValues?.[key];
    const newVal = newValues?.[key];

    if (oldVal === undefined && newVal !== undefined) {
      diff.push({ field: key, oldValue: undefined, newValue: newVal, type: 'added' });
    } else if (oldVal !== undefined && newVal === undefined) {
      diff.push({ field: key, oldValue: oldVal, newValue: undefined, type: 'removed' });
    } else if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'changed' });
    }
  }

  return diff.sort((a, b) => a.field.localeCompare(b.field));
}

export function getAuditActionTypes(): AuditAction[] {
  return ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'OTHER'];
}

export function getAuditableEntityTypes(): string[] {
  return Object.keys(ENTITY_TYPE_LABELS);
}
