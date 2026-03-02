-- Enable Row Level Security on the site_config table to secure sensitive data
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- By not adding any policies, we restrict access so that only users bypassing RLS 
-- (like 'postgres', 'service_role') and SECURITY DEFINER functions can read/write to it.
-- This ensures the 'anon' and 'authenticated' web users cannot access 'service_role_key'.
