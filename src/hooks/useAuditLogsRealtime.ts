import { useEffect, useCallback, useState, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  id: string;
  tenant_id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'OTHER';
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  is_deleted: boolean;
}

interface UseAuditLogsRealtimeOptions {
  tenantId: string | null;
  enabled?: boolean;
  onNewLog?: (log: AuditLogEntry) => void;
  onLogsChange?: (logs: AuditLogEntry[]) => void;
}

export function useAuditLogsRealtime({
  tenantId,
  enabled = true,
  onNewLog,
  onLogsChange
}: UseAuditLogsRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const logsRef = useRef<AuditLogEntry[]>([]);
  const supabaseRef = useRef<SupabaseClient | null>(null);

  const handleInsert = useCallback(
    (payload: { new: AuditLogEntry }) => {
      const newLog = payload.new;

      if (tenantId && newLog.tenant_id !== tenantId) {
        return;
      }

      setIsConnected(true);

      if (onNewLog) {
        onNewLog(newLog);
      }

      logsRef.current = [newLog, ...logsRef.current];
      if (onLogsChange) {
        onLogsChange(logsRef.current);
      }
    },
    [tenantId, onNewLog, onLogsChange]
  );

  useEffect(() => {
    if (!enabled || !tenantId) {
      return;
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    supabaseRef.current = supabase;

    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
          filter: `tenant_id=eq.${tenantId}`
        },
        handleInsert
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [enabled, tenantId, handleInsert]);

  return { isConnected, logs: logsRef.current };
}

export function useUnreadAuditLogsCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastReadTime, setLastReadTime] = useState<Date | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('audit_logs_last_read');
    if (stored) {
      setLastReadTime(new Date(stored));
    }
  }, []);

  const markAsRead = useCallback(() => {
    const now = new Date();
    setLastReadTime(now);
    localStorage.setItem('audit_logs_last_read', now.toISOString());
    setUnreadCount(0);
  }, []);

  return { unreadCount, lastReadTime, markAsRead };
}
