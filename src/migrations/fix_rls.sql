-- FIX FOR SUPABASE 500 ERRORS (RECURSIVE RLS)

-- 1. Create a secure function to check admin status
-- This function uses SECURITY DEFINER to bypass RLS policies regarding the profiles table itself,
-- preventing the "infinite recursion" error when a policy queries the table it protects.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
-- Also drop any other likely policies that might exist
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Re-create Clean Policies

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Policy: Admins can do EVERYTHING (Select, Insert, Update, Delete)
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
USING (is_admin());

-- 5. Grant necessary permissions (if not already granted)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT SELECT, UPDATE, INSERT ON TABLE public.profiles TO authenticated;
