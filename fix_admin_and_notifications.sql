-- ========================================================
-- 0. FIX ADMIN_USERS TABLE CONSTRAINT
-- ========================================================
ALTER TABLE public.admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- ========================================================
-- 1. FIX ADMIN PROMOTION (CASE-INSENSITIVE)
-- ========================================================

-- Update the handle_new_user function to be robust and case-insensitive
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Check if the new user's email is in the admin_users table (CASE-INSENSITIVE)
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE LOWER(email) = LOWER(NEW.email)
    ) INTO is_admin;

    -- Insert profile with the correct role
    INSERT INTO public.profiles (id, email, full_name, role, is_subscribed)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        CASE WHEN is_admin THEN 'admin' ELSE 'user' END,
        COALESCE((NEW.raw_user_meta_data->>'is_subscribed')::boolean, true)
    )
    ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-sync existing users: Promote anyone whose email matches (CASE-INSENSITIVE)
UPDATE public.profiles
SET role = 'admin'
WHERE LOWER(email) IN (SELECT LOWER(email) FROM public.admin_users)
AND role != 'admin';


-- ========================================================
-- 2. ENABLE WELCOME NOTIFICATIONS (DATABASE WEBHOOK)
-- ========================================================

-- 1. Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Create the webhook trigger function
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://yinrybsrgnryidkcizuz.supabase.co/functions/v1/welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', (SELECT 'Bearer ' || decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' LIMIT 1)
      ),
      body := jsonb_build_object(
        'type', 'INSERT',
        'table', 'profiles',
        'record', row_to_json(NEW)
      )
    );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach trigger to profiles
DROP TRIGGER IF EXISTS on_profile_created_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_welcome_email();
