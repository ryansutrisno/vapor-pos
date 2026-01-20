import express from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { maskSensitiveData } from '../lib/audit.js';
import logger from '../lib/logger.js';

const router = express.Router();

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50)
});

const filtersSchema = z.object({
  entity_type: z.string().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'OTHER']).optional(),
  user_id: z.string().uuid().optional(),
  entity_id: z.string().uuid().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  search: z.string().optional()
});

async function getUserTenantId(userId: string): Promise<string | null> {
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('id', userId)
    .single();

  return user?.tenant_id || null;
}

async function checkIsSuperadmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  return user?.role === 'superadmin';
}

router.get('/', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    const { page, limit } = paginationSchema.parse(req.query);
    const filters = filtersSchema.parse(req.query);

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.search) {
      query = query.or(`user_email.ilike.%${filters.search}%,entity_type.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    const maskedData = data?.map(log => ({
      ...log,
      old_values: maskSensitiveData(log.old_values),
      new_values: maskSensitiveData(log.new_values)
    }));

    res.json({
      data: maskedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.format() });
    }
    logger.error('Error in GET /api/audit-logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    let query = supabase
      .from('audit_logs')
      .select('action, entity_type, created_at', { count: 'exact' })
      .eq('is_deleted', false);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching audit stats:', error);
      return res.status(500).json({ error: 'Failed to fetch audit stats' });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = {
      totalLogs: data?.length || 0,
      todayLogs: data?.filter(log => new Date(log.created_at) >= today).length || 0,
      byAction: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
      recentActivity: {
        last24Hours: 0,
        last7Days: 0,
        last30Days: 0
      }
    };

    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    data?.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      stats.byEntity[log.entity_type] = (stats.byEntity[log.entity_type] || 0) + 1;

      const logDate = new Date(log.created_at);
      if (logDate >= last24h) stats.recentActivity.last24Hours++;
      if (logDate >= last7d) stats.recentActivity.last7Days++;
      if (logDate >= last30d) stats.recentActivity.last30Days++;
    });

    res.json(stats);
  } catch (error) {
    logger.error('Error in GET /api/audit-logs/stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_deleted', false);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return res.status(404).json({ error: 'Audit log not found' });
    }

    res.json({
      ...data,
      old_values: maskSensitiveData(data.old_values),
      new_values: maskSensitiveData(data.new_values)
    });
  } catch (error) {
    logger.error('Error in GET /api/audit-logs/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    const { page, limit } = paginationSchema.parse(req.query);

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('entity_type', req.params.entityType)
      .eq('entity_id', req.params.entityId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching entity audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch entity audit logs' });
    }

    const maskedData = data?.map(log => ({
      ...log,
      old_values: maskSensitiveData(log.old_values),
      new_values: maskSensitiveData(log.new_values)
    }));

    res.json({
      data: maskedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    logger.error('Error in GET /api/audit-logs/entity/:type/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    const { page, limit } = paginationSchema.parse(req.query);

    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', req.params.userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error('Error fetching user audit logs:', error);
      return res.status(500).json({ error: 'Failed to fetch user audit logs' });
    }

    const maskedData = data?.map(log => ({
      ...log,
      old_values: maskSensitiveData(log.old_values),
      new_values: maskSensitiveData(log.new_values)
    }));

    res.json({
      data: maskedData,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    logger.error('Error in GET /api/audit-logs/user/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/export', async (req, res) => {
  try {
    const userId = (req as any).user?.id || (req as any).auth?.uid;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const isSuperadmin = await checkIsSuperadmin(userId);
    const userTenantId = await getUserTenantId(userId);

    const filters = filtersSchema.parse(req.body);

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10000);

    if (!isSuperadmin && userTenantId) {
      query = query.eq('tenant_id', userTenantId);
    }

    if (filters.entity_type) {
      query = query.eq('entity_type', filters.entity_type);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error exporting audit logs:', error);
      return res.status(500).json({ error: 'Failed to export audit logs' });
    }

    const csvHeader = 'ID,Tenant ID,User Email,User Role,Action,Entity Type,Entity ID,Old Values,New Values,Created At\n';
    const csvRows = data?.map(log => {
      const oldVal = log.old_values ? JSON.stringify(log.old_values).replace(/"/g, '""') : '';
      const newVal = log.new_values ? JSON.stringify(log.new_values).replace(/"/g, '""') : '';
      return `${log.id},${log.tenant_id},${log.user_email || ''},${log.user_role || ''},${log.action},${log.entity_type},${log.entity_id || ''},"${oldVal}","${newVal}",${log.created_at}`;
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid parameters', details: error.format() });
    }
    logger.error('Error in POST /api/audit-logs/export:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
