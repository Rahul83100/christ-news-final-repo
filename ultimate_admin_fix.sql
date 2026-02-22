-- ========================================================
-- ULTIMATE ADMIN ACCESS FIX (FIXED FOR CONSTRAINTS)
-- ========================================================

-- 1. Remove the annoying constraint that is blocking us
-- This constraint was preventing admins from being 'subscribed'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS admin_not_subscribed;

-- 2. First, make sure we have the correct ID for your account
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    SELECT id INTO target_user_id FROM auth.users WHERE email = 'rahul636071@gmail.com';

    IF target_user_id IS NULL THEN
        RAISE NOTICE 'USER NOT FOUND in auth.users. Please make sure you signed up with rahul636071@gmail.com';
    ELSE
        -- 3. Force create or update the profile row
        -- Now it will work because we dropped the constraint!
        INSERT INTO public.profiles (id, email, full_name, role, is_subscribed)
        VALUES (
            target_user_id, 
            'rahul636071@gmail.com', 
            'Rahul Admin', 
            'admin', 
            true
        )
        ON CONFLICT (id) DO UPDATE SET 
            role = 'admin',
            email = 'rahul636071@gmail.com',
            is_subscribed = true;
            
        -- 4. Ensure it's in the admin_users list too
        INSERT INTO public.admin_users (email)
        VALUES ('rahul636071@gmail.com')
        ON CONFLICT (email) DO NOTHING;

        RAISE NOTICE 'SUCCESS: Profile created/updated for ID %', target_user_id;
    END IF;
END $$;

-- 5. VERIFY: Run this after the script to be sure
SELECT id, email, role, is_subscribed FROM public.profiles WHERE email = 'rahul636071@gmail.com';
