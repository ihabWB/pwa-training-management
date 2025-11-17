-- Add 'completed' and 'cancelled' to task_status enum
-- This migration adds missing status values that are used in the application

-- Add 'completed' to task_status enum
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'completed';

-- Add 'cancelled' to task_status enum  
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Note: Values are added to the end of the enum
-- Existing values: 'pending', 'in_progress', 'submitted', 'approved', 'rejected'
-- New values: 'completed', 'cancelled'
