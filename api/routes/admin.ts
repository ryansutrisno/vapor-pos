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