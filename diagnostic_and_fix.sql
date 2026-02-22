-- ========================================================
-- COMPREHENSIVE REPAIR SCRIPT (Run this if users are missing)
-- ========================================================

-- 1. DROP BLOCKING CONSTRAINTS
-- This was the main reason admin profiles weren't creating.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS admin_not_subscribed;

-- 2. FIX TABLE ID DEFAULTS
ALTER TABLE public.admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. IMPROVED TRIGGER FUNCTION
-- This version handles conflicts and is more robust.
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
    -- ON CONFLICT ensures that if the row exists, we just update it.
    INSERT INTO public.profiles (id, email, full_name, role, is_subscribed)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        CASE WHEN is_admin THEN 'admin' ELSE 'user' END,
        COALESCE((NEW.raw_user_meta_data->>'is_subscribed')::boolean, true)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 5. THE WEBHOOK TRIGGER (SAFETIED)
-- We only run this if the 'net' extension is actually installed.
-- This prevents the whole INSERT from crashing if pg_net is disabled.
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Only attempt to call net.http_post if the extension exists
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
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
  END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never crash the profile creation because of a webhook failure
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RECOVERY: BACKFILL MISSING PROFILES
-- This loop finds users in auth.users who don't have a profile and creates them.
DO $$
DECLARE
    r RECORD;
    is_admin BOOLEAN;
BEGIN
    FOR r IN SELECT id, email, raw_user_meta_data FROM auth.users LOOP
        -- Check if profile exists
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = r.id) THEN
            
            -- Check if admin
            SELECT EXISTS (
                SELECT 1 FROM public.admin_users 
                WHERE LOWER(email) = LOWER(r.email)
            ) INTO is_admin;
            
            INSERT INTO public.profiles (id, email, full_name, role, is_subscribed)
            VALUES (
                r.id, 
                r.email, 
                COALESCE(r.raw_user_meta_data->>'full_name', 'User'),
                CASE WHEN is_admin THEN 'admin' ELSE 'user' END,
                true
            );
        END IF;
    END LOOP;
END $$;

-- 7. CLEANUP RLS (Run the final permission fix logic)
DROP POLICY IF EXISTS "Profiles are viewable by owner and admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are updatable by owner and admins" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are deletable by admins" ON public.profiles;

CREATE POLICY "Profiles are viewable by owner and admins" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt()->>'email')));
CREATE POLICY "Profiles are updatable by owner and admins" ON public.profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt()->>'email')));
CREATE POLICY "Profiles are deletable by admins" ON public.profiles FOR DELETE USING (EXISTS (SELECT 1 FROM public.admin_users WHERE LOWER(email) = LOWER(auth.jwt()->>'email')));

-- 8. VERIFY
SELECT id, email, role FROM public.profiles;
