-- ========================================================
-- FIX ADMIN PERMISSIONS (RLS POLICIES)
-- ========================================================

-- This script ensures that anyone in the 'admin_users' table
-- has full permission to manage everyone's profile.

-- 1. Drop existing restricted policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- 2. Create new robust policies
-- Rule: You can see/edit a profile if:
-- a) It's your own profile
-- b) You are listed in the 'admin_users' table (case-insensitive check)

-- SELECT: View profiles
CREATE POLICY "Profiles are viewable by owner and admins"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
    )
  );

-- UPDATE: Edit roles or details
CREATE POLICY "Profiles are updatable by owner and admins"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR 
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
    )
  );

-- DELETE: Remove users
CREATE POLICY "Profiles are deletable by admins"
  ON public.profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE LOWER(email) = LOWER(auth.jwt()->>'email')
    )
  );

-- 3. Verification
-- No RAISE needed here as statements above will succeed or error out.
