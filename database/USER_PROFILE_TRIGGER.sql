-- =====================================================
-- USER MANAGEMENT: Auto-Create Profiles with Correct Role
-- =====================================================
-- This trigger automatically creates a profile when admin creates a user
-- It reads the role from the signup metadata

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert profile with role from metadata
  BEGIN
    INSERT INTO public.profiles (
      id,
      email,
      full_name,
      role,
      status,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      -- Read role from signup metadata, default to 'customer' if not specified
      COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
      'active',
      NOW(),
      NOW()
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- Profile already exists, update it instead
      UPDATE public.profiles
      SET
        email = NEW.email,
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', full_name),
        role = COALESCE(NEW.raw_user_meta_data->>'role', role),
        updated_at = NOW()
      WHERE id = NEW.id;
    WHEN OTHERS THEN
      -- Log error but don't fail the signup
      RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger was created
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile with correct role when user signs up';
