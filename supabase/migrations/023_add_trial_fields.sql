-- Migration: Add trial fields to users table
-- Created: 2024-01-25
-- Purpose: Add fields for 14-day trial system with email verification

-- Add trial-related fields to users table
ALTER TABLE users 
ADD COLUMN trial_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN email_verified BOOLEAN DEFAULT false,
ADD COLUMN email_verification_token VARCHAR(255),
ADD COLUMN is_trial_user BOOLEAN DEFAULT false,
ADD COLUMN trial_started_at TIMESTAMP WITH TIME ZONE;

-- Create index for email verification token lookup
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);

-- Create index for trial expiration queries
CREATE INDEX idx_users_trial_expires_at ON users(trial_expires_at);

-- Update existing users to have email_verified = true (they are already active)
UPDATE users SET email_verified = true WHERE email_verified IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN users.trial_expires_at IS 'When the trial period expires for trial users';
COMMENT ON COLUMN users.email_verified IS 'Whether the user has verified their email address';
COMMENT ON COLUMN users.email_verification_token IS 'Token used for email verification';
COMMENT ON COLUMN users.is_trial_user IS 'Whether this user is on a trial account';
COMMENT ON COLUMN users.trial_started_at IS 'When the trial period started';