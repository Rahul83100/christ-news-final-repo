-- ========================================================
-- SUPER ADMIN FORCE FIX
-- ========================================================

-- 1. Fix the table constraint so 'id' is generated automatically
ALTER TABLE public.admin_users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Ensure the email is in your admin_users table
INSERT INTO public.admin_users (email)
VALUES ('rahul636071@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Force the profile role to 'admin' for this specific email
-- (This will fix it even if you signed up before the trigger was ready)
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) = LOWER('rahul636071@gmail.com');

-- 3. Verify it worked (Run this to check)
SELECT id, email, role FROM public.profiles WHERE LOWER(email) = LOWER('rahul636071@gmail.com');

-- NOTE ON PASSWORD:
-- Supabase handles passwords securely in the 'auth.users' table.
-- Since you already signed up, just use your existing password.
-- If you forgot it, use the 'Forgot Password' link on the sign-in page.
