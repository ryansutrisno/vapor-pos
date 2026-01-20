/**
 * Admin API routes for user management operations
 * Requires superadmin authentication
 */
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Create admin Supabase client with service role key
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables for admin operations');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Regular Supabase client for user verification
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Middleware to verify user authentication and superadmin role
 */
const verifySuperAdmin = async (req: Request, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userData) {
      return res.status(401).json({
        success: false,
        error: 'User not found in database'
      });
    }

    if (userData.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Insufficient privileges. Superadmin role required.'
      });
    }

    // Add user info to request for use in route handlers
    req.user = { id: user.id, role: userData.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication verification failed'
    });
  }
};

/**
 * Create new user (admin operation)
 * POST /api/admin/users
 */
router.post('/users', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, is_active } = req.body;

    // Validate required fields
    if (!email || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, name, role'
      });
    }

    // Validate role
    const validRoles = ['superadmin', 'admin', 'warehouse', 'kasir'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    // Create auth user using admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({
        success: false,
        error: 'Failed to create auth user: ' + authError.message
      });
    }

    // Generate tenant_id for admin users, use existing for others
    let tenantId: string;
    if (role === 'admin') {
      tenantId = crypto.randomUUID();
    } else {
      // For non-admin users, we'll need to get the current user's tenant
      // For now, generate a new one - this should be improved based on business logic
      tenantId = crypto.randomUUID();
    }

    // Create user record in database
    const { error: userError } = await supabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        email,
        name,
        role,
        is_active: is_active !== undefined ? is_active : true,
        tenant_id: tenantId
      });

    if (userError) {
      console.error('User creation error:', userError);
      
      // If user creation fails, clean up the auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      return res.status(400).json({
        success: false,
        error: 'Failed to create user record: ' + userError.message
      });
    }

    // Create default settings for admin users
    if (role === 'admin') {
      try {
        // Import and call the settings creation function
        // This would need to be implemented based on your settings structure
        console.log(`Default settings should be created for tenant: ${tenantId}`);
      } catch (settingsError) {
        console.error('Error creating default settings:', settingsError);
        // Don't fail the user creation if settings creation fails
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: authData.user.id,
        email,
        name,
        role,
        tenant_id: tenantId
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Get all users (admin operation)
 * GET /api/admin/users
 */
router.get('/users', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch users: ' + error.message
      });
    }

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Update user (admin operation)
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const { error } = await supabase
      .from('users')
      .update({ name, email, role, is_active })
      .eq('id', id);

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to update user: ' + error.message
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * Delete user (admin operation)
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get user's auth_id before deletion
    const { data: userData, error: getUserError } = await supabase
      .from('users')
      .select('auth_id')
      .eq('id', id)
      .single();

    if (getUserError || !userData) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Delete user from database
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to delete user: ' + deleteError.message
      });
    }

    // Delete auth user
    try {
      await supabaseAdmin.auth.admin.deleteUser(userData.auth_id);
    } catch (authDeleteError) {
      console.error('Failed to delete auth user:', authDeleteError);
      // Continue even if auth deletion fails
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
/**
 * TRIAL MANAGEMENT ENDPOINTS
 */

// Get all trial users
router.get('/trial-users', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('users')
      .select(`
        *,
        trial_history (
          id,
          action,
          old_expiry,
          new_expiry,
          days_change,
          reason,
          created_at
        )
      `)
      .eq('is_trial_user', true)
      .order('trial_expires_at', { ascending: true });

    if (status === 'active') {
      query = query.gt('trial_expires_at', new Date().toISOString());
    } else if (status === 'expiring') {
      const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
      query = query
        .gt('trial_expires_at', new Date().toISOString())
        .lte('trial_expires_at', threeDaysFromNow);
    } else if (status === 'expired') {
      query = query.lt('trial_expires_at', new Date().toISOString());
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Failed to fetch trial users: ' + error.message
      });
    }

    const enrichedUsers = users?.map(user => {
      const now = new Date();
      const expiresAt = new Date(user.trial_expires_at);
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let trialStatus = 'active';
      if (expiresAt < now) {
        trialStatus = 'expired';
      } else if (daysLeft <= 3) {
        trialStatus = 'expiring';
      }

      return {
        ...user,
        days_left: daysLeft,
        trial_status: trialStatus
      };
    });

    res.json({
      success: true,
      data: enrichedUsers
    });
  } catch (error) {
    console.error('Get trial users error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get trial user detail with history
router.get('/trial-users/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        trial_history (*)
      `)
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'Trial user not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get trial user detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Extend trial period
router.post('/trial-users/:id/extend', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Days must be a positive number'
      });
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_trial_user) {
      return res.status(400).json({
        success: false,
        error: 'User is not a trial user'
      });
    }

    // Validate extension using RPC
    const { data: isValid, error: validateError } = await supabase
      .rpc('validate_trial_extension', {
        p_user_id: id,
        p_days: days
      });

    if (validateError || !isValid) {
      return res.status(400).json({
        success: false,
        error: 'Cannot extend trial. Maximum trial period is 30 days.'
      });
    }

    // Get admin email for notification
    const { data: adminUser } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', adminId)
      .single();

    // Extend trial using RPC
    const { error: extendError } = await supabase
      .rpc('extend_trial', {
        p_user_id: id,
        p_days: days,
        p_changed_by: adminId,
        p_reason: reason
      });

    if (extendError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to extend trial: ' + extendError.message
      });
    }

    // Get updated user for email
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    // Send notification email
    try {
      const { sendTrialExtendedEmail } = await import('../lib/email.js');
      await sendTrialExtendedEmail(
        updatedUser.email,
        updatedUser.name,
        updatedUser.trial_expires_at,
        adminUser?.name || 'Admin',
        reason
      );
    } catch (emailError) {
      console.error('Failed to send trial extension email:', emailError);
    }

    res.json({
      success: true,
      message: `Trial extended by ${days} days`,
      data: {
        user_id: id,
        days_added: days,
        new_expiry: updatedUser.trial_expires_at
      }
    });
  } catch (error) {
    console.error('Extend trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Reduce trial period
router.post('/trial-users/:id/reduce', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days, reason } = req.body;
    const adminId = (req as any).user?.id;

    if (!days || days <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Days must be a positive number'
      });
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_trial_user) {
      return res.status(400).json({
        success: false,
        error: 'User is not a trial user'
      });
    }

    // Reduce trial using RPC
    const { error: reduceError } = await supabase
      .rpc('reduce_trial', {
        p_user_id: id,
        p_days: days,
        p_changed_by: adminId,
        p_reason: reason
      });

    if (reduceError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to reduce trial: ' + reduceError.message
      });
    }

    // Get updated user
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    res.json({
      success: true,
      message: `Trial reduced by ${days} days`,
      data: {
        user_id: id,
        days_removed: days,
        new_expiry: updatedUser.trial_expires_at
      }
    });
  } catch (error) {
    console.error('Reduce trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Cancel trial
router.post('/trial-users/:id/cancel', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!user.is_trial_user) {
      return res.status(400).json({
        success: false,
        error: 'User is not a trial user'
      });
    }

    // Get admin email for notification
    const { data: adminUser } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', adminId)
      .single();

    // Cancel trial using RPC
    const { error: cancelError } = await supabase
      .rpc('cancel_trial', {
        p_user_id: id,
        p_changed_by: adminId,
        p_reason: reason
      });

    if (cancelError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to cancel trial: ' + cancelError.message
      });
    }

    // Send notification email
    try {
      const { sendTrialCancelledEmail } = await import('../lib/email.js');
      await sendTrialCancelledEmail(
        user.email,
        user.name,
        adminUser?.name || 'Admin',
        reason
      );
    } catch (emailError) {
      console.error('Failed to send trial cancellation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Trial cancelled successfully',
      data: {
        user_id: id,
        is_active: false
      }
    });
  } catch (error) {
    console.error('Cancel trial error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * MANUAL ACTIVATION ENDPOINTS
 */

// Create paid user directly
router.post('/users/create-paid', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      name,
      store_name,
      role,
      subscription_plan,
      billing_cycle,
      payment_method,
      payment_reference,
      notes
    } = req.body;

    const adminId = (req as any).user?.id;

    // Validate required fields
    if (!email || !password || !name || !store_name || !role || !subscription_plan || !billing_cycle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate role
    const validRoles = ['admin', 'warehouse', 'kasir'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    // Validate plan
    const validPlans = ['single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited'];
    if (!validPlans.includes(subscription_plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription plan'
      });
    }

    // Validate billing cycle
    if (!['monthly', 'yearly'].includes(billing_cycle)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid billing cycle'
      });
    }

    // Create paid user using RPC
    const { data: userId, error: createError } = await supabase
      .rpc('create_paid_user', {
        p_email: email,
        p_password: password,
        p_name: name,
        p_store_name: store_name,
        p_role: role,
        p_plan: subscription_plan,
        p_billing_cycle: billing_cycle,
        p_payment_method: payment_method || 'manual',
        p_payment_reference: payment_reference || null,
        p_notes: notes || null,
        p_changed_by: adminId
      });

    if (createError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to create paid user: ' + createError.message
      });
    }

    // Get created user
    const { data: newUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // Get admin for notification
    const { data: adminUser } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', adminId)
      .single();

    // Send welcome email
    try {
      const { sendTrialActivatedEmail } = await import('../lib/email.js');
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendTrialActivatedEmail(
        newUser.email,
        newUser.name,
        subscription_plan,
        billing_cycle,
        loginUrl
      );
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Paid user created successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Create paid user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Convert trial user to paid
router.post('/users/:id/activate', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { subscription_plan, billing_cycle, payment_method, payment_reference, notes } = req.body;
    const adminId = (req as any).user?.id;

    // Validate plan
    const validPlans = ['single_store', 'multi_store_5', 'multi_store_20', 'multi_store_unlimited'];
    if (!validPlans.includes(subscription_plan)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid subscription plan'
      });
    }

    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Convert trial to paid using RPC
    const { error: convertError } = await supabase
      .rpc('convert_trial_to_paid', {
        p_user_id: id,
        p_plan: subscription_plan,
        p_changed_by: adminId,
        p_reason: 'Manually activated by superadmin'
      });

    if (convertError) {
      return res.status(400).json({
        success: false,
        error: 'Failed to convert trial user: ' + convertError.message
      });
    }

    // Get updated user
    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    // Get admin for notification
    const { data: adminUser } = await supabase
      .from('users')
      .select('email, name')
      .eq('id', adminId)
      .single();

    // Send activation email
    try {
      const { sendTrialActivatedEmail } = await import('../lib/email.js');
      const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
      await sendTrialActivatedEmail(
        updatedUser.email,
        updatedUser.name,
        subscription_plan,
        billing_cycle,
        loginUrl
      );
    } catch (emailError) {
      console.error('Failed to send activation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Trial user converted to paid successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Activate trial user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get trial statistics
router.get('/trial-stats', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date().toISOString();
    const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    // Total active trials
    const { count: activeTrials } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_trial_user', true)
      .gt('trial_expires_at', now);

    // Expiring in 3 days
    const { count: expiringSoon } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_trial_user', true)
      .gt('trial_expires_at', now)
      .lte('trial_expires_at', threeDaysFromNow);

    // Expired
    const { count: expired } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_trial_user', true)
      .lt('trial_expires_at', now);

    // Converted to paid this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const { count: convertedThisMonth } = await supabase
      .from('trial_history')
      .select('*', { count: 'exact', head: true })
      .eq('action', 'converted')
      .gte('created_at', startOfMonth);

    res.json({
      success: true,
      data: {
        active_trials: activeTrials || 0,
        expiring_soon: expiringSoon || 0,
        expired: expired || 0,
        converted_this_month: convertedThisMonth || 0
      }
    });
  } catch (error) {
    console.error('Get trial stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// ========================
// INVOICE MANAGEMENT ROUTES
// ========================

router.get('/invoices', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, date_from, date_to } = req.query;

    let query = supabase
      .from('invoices')
      .select(`
        *,
        user:users(name, email),
        tenant:tenants(company_name)
      `, { count: 'exact' });

    if (status && status !== '') {
      query = query.eq('status', status);
    }
    if (search && search !== '') {
      query = query.or(`invoice_number.ilike.%${search}%,user.email.ilike.%${search}%,user.name.ilike.%${search}%`);
    }
    if (date_from && date_from !== '') {
      query = query.gte('created_at', date_from);
    }
    if (date_to && date_to !== '') {
      query = query.lte('created_at', date_to);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((Number(page) - 1) * Number(limit), Number(page) * Number(limit) - 1);

    if (error) {
      console.error('Error fetching invoices:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
    }

    res.json({
      success: true,
      data: data || [],
      total: count || 0,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/invoices/stats', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { count: totalCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true });
    const { count: paidCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'paid');
    const { count: pendingCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'sent');
    const { count: overdueCount } = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('status', 'overdue');

    const { data: revenueData } = await supabase
      .from('invoices')
      .select('amount_idr')
      .eq('status', 'paid');

    const totalRevenue = revenueData?.reduce((sum, inv) => sum + (inv.amount_idr || 0), 0) || 0;

    res.json({
      success: true,
      data: {
        total_invoices: totalCount || 0,
        paid_invoices: paidCount || 0,
        pending_invoices: pendingCount || 0,
        overdue_invoices: overdueCount || 0,
        total_revenue: totalRevenue
      }
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/invoices', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { user_id, plan_name, plan_type, billing_cycle, amount, currency, due_date, period_start, period_end, admin_notes } = req.body;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user_id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { data: lastInvoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.invoice_number.split('-')[2] || '0');
      sequence = lastSeq + 1;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = `INV-${dateStr}-${String(sequence).padStart(4, '0')}`;

    let exchangeRate = 1;
    let amountIdr = amount;
    if (currency && currency !== 'IDR') {
      switch (currency) {
        case 'USD': exchangeRate = 15500; break;
        case 'EUR': exchangeRate = 16800; break;
        case 'SGD': exchangeRate = 11600; break;
        case 'MYR': exchangeRate = 3300; break;
      }
      amountIdr = amount * exchangeRate;
    }

    const { data: invoice, error: insertError } = await supabase
      .from('invoices')
      .insert({
        invoice_number: invoiceNumber,
        user_id,
        amount,
        currency: currency || 'IDR',
        exchange_rate: exchangeRate,
        amount_idr: amountIdr,
        plan_name,
        plan_type,
        billing_cycle,
        period_start,
        period_end,
        next_billing_date: period_end,
        due_date,
        status: 'sent',
        sent_at: new Date().toISOString(),
        admin_notes,
        created_by: (req.user as any).id
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating invoice:', insertError);
      return res.status(500).json({ success: false, error: 'Failed to create invoice' });
    }

    const { generateInvoicePDF } = await import('../lib/pdf-invoice.js');
    const { sendPaymentSuccessEmail } = await import('../lib/email.js');

    try {
      const pdfBuffer = await generateInvoicePDF(invoice.id);
      await sendPaymentSuccessEmail(
        userData.email,
        userData.name,
        {
          invoiceNumber,
          amount,
          currency: currency || 'IDR',
          paymentMethod: 'Pending',
          planName: plan_name,
          billingCycle: billing_cycle,
          transactionDate: new Date().toISOString(),
          nextBillingDate: period_end,
          invoicePdfBuffer: pdfBuffer
        }
      );
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError);
    }

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/invoices/:id/mark-paid', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_reference } = req.body;

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    const { error: updateError } = await supabase
      .from('invoices')
      .update({
        status: 'paid',
        payment_method,
        payment_reference,
        paid_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating invoice:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update invoice' });
    }

    if (!invoice.user.is_active && invoice.user.suspension_reason === 'overdue_invoice') {
      await supabase
        .from('users')
        .update({
          is_active: true,
          suspended_at: null,
          suspension_reason: null
        })
        .eq('id', invoice.user.id);
    }

    const { sendPaymentSuccessEmail } = await import('../lib/email.js');
    try {
      await sendPaymentSuccessEmail(
        invoice.user.email,
        invoice.user.name,
        {
          invoiceNumber: invoice.invoice_number,
          amount: invoice.amount,
          currency: invoice.currency,
          paymentMethod: payment_method || 'Manual',
          planName: invoice.plan_name,
          billingCycle: invoice.billing_cycle,
          transactionDate: new Date().toISOString(),
          nextBillingDate: invoice.next_billing_date
        }
      );
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
    }

    res.json({ success: true, message: 'Invoice marked as paid' });
  } catch (error) {
    console.error('Mark invoice paid error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/invoices/:id/send-reminder', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: invoice, error: fetchError } = await supabase
      .from('invoices')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();

    if (fetchError || !invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }

    if (invoice.status !== 'sent') {
      return res.status(400).json({ success: false, error: 'Can only send reminders for sent invoices' });
    }

    const dueDate = new Date(invoice.due_date);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

    const { generateInvoicePDF } = await import('../lib/pdf-invoice.js');
    const { sendBillReminderEmail } = await import('../lib/email.js');

    const pdfBuffer = await generateInvoicePDF(invoice.id);

    await sendBillReminderEmail(
      invoice.user.email,
      invoice.user.name,
      {
        invoiceNumber: invoice.invoice_number,
        amountDue: invoice.amount,
        currency: invoice.currency,
        dueDate: invoice.due_date,
        daysUntilDue,
        planName: invoice.plan_name,
        billingCycle: invoice.billing_cycle,
        invoicePdfBuffer: pdfBuffer
      }
    );

    res.json({ success: true, message: 'Reminder sent successfully' });
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/invoices/:id/pdf', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { generateInvoicePDF } = await import('../lib/pdf-invoice.js');
    const pdfBuffer = await generateInvoicePDF(id);

    const { data: invoice } = await supabase
      .from('invoices')
      .select('invoice_number')
      .eq('id', id)
      .single();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice?.invoice_number || id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/invoices/:id', verifySuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error: deleteError } = await supabase
      .from('invoices')
      .update({ status: 'cancelled' })
      .eq('id', id);

    if (deleteError) {
      console.error('Error cancelling invoice:', deleteError);
      return res.status(500).json({ success: false, error: 'Failed to cancel invoice' });
    }

    res.json({ success: true, message: 'Invoice cancelled' });
  } catch (error) {
    console.error('Cancel invoice error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
