-- =========================================================================================
-- Supabase Trigger: Auto-create Profile on Auth Signup (OAuth & Email)
-- =========================================================================================

-- 1. Create the function that will be executed by the trigger.
-- We use 'security definer' to elevate privileges so this function can write to public.profiles
-- even if the user doing the signup doesn't have RLS insert permissions yet.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_first_name text := 'User';
  v_last_name text := '';
  v_username text := '';
  v_avatar_url text := '1.png';
  v_full_name text;
BEGIN
  -- Extract metadata provided by OAuth providers (Google/Facebook)
  v_full_name := NEW.raw_user_meta_data->>'full_name';
  IF v_full_name IS NULL THEN
    v_full_name := NEW.raw_user_meta_data->>'name';
  END IF;

  IF v_full_name IS NOT NULL THEN
    -- Split name naively for first and last name
    v_first_name := split_part(v_full_name, ' ', 1);
    v_last_name := trim(substring(v_full_name FROM length(v_first_name) + 2));
  END IF;

  -- Generate a basic username from email if available
  IF NEW.email IS NOT NULL THEN
    v_username := split_part(NEW.email, '@', 1);
  END IF;

  -- Attempt to get profile picture from OAuth
  IF NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL THEN
    v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
  ELSIF NEW.raw_user_meta_data->>'picture' IS NOT NULL THEN
    v_avatar_url := NEW.raw_user_meta_data->>'picture';
  END IF;

  -- Insert the new profile
  INSERT INTO public.profiles (
    id, 
    first_name, 
    last_name, 
    username, 
    profile_avatar_url, 
    role, 
    preferred_language_code
  )
  VALUES (
    NEW.id, 
    v_first_name, 
    v_last_name, 
    v_username, 
    v_avatar_url, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'), -- default to user
    'en'
  );

  RETURN NEW;
END;
$$;

-- 2. Create the trigger on the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
