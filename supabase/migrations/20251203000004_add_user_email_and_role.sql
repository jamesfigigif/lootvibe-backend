-- Add email column to users table to store Clerk email

-- Add email column (nullable, since existing users won't have it)
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add comment for documentation
COMMENT ON COLUMN public.users.email IS 'User email from Clerk authentication';
