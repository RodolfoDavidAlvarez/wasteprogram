-- Update wd_users table to add authUserId field for Supabase Auth integration
-- This links our user records to Supabase Auth users

-- Add authUserId column (nullable initially for migration)
ALTER TABLE "wd_users" 
ADD COLUMN IF NOT EXISTS "authUserId" TEXT;

-- Add unique constraint on authUserId
CREATE UNIQUE INDEX IF NOT EXISTS "wd_users_authUserId_key" 
ON "wd_users" ("authUserId") 
WHERE "authUserId" IS NOT NULL;

-- Add phone column (optional)
ALTER TABLE "wd_users" 
ADD COLUMN IF NOT EXISTS "phone" TEXT;


