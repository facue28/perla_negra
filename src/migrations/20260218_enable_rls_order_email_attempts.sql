-- Migration: Enable RLS on order_email_attempts
-- Date: 2026-02-18
-- Reason: Security alert from Supabase - table was publicly accessible via PostgREST
-- This table is internal-only (used by triggers/service_role), so no public policies are needed.
-- The service_role bypasses RLS by default, so triggers will continue to work normally.

ALTER TABLE public.order_email_attempts ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated are intentionally created.
-- Only service_role (internal) has access to this table.
