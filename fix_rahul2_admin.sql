-- ========================================================
-- FORCE ADMIN FOR r99002895@gmail.com
-- ========================================================

-- It looks like there was a typo with an "08" at the end of the email.
-- This script will make sure the account you are CURRENTLY using gets admin access.

-- 1. Add to the admin list (without the 08)
INSERT INTO public.admin_users (email)
VALUES ('r99002895@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- 2. Force the profile to 'admin'
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'r99002895@gmail.com';

-- 3. VERIFY
SELECT email, role FROM public.profiles WHERE email LIKE 'r99002895%';
