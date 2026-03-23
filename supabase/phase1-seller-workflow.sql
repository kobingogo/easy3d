-- Phase 1 seller workflow contract
-- Execute in Supabase SQL Editor after models table is created.

CREATE TABLE IF NOT EXISTS public.unlock_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted',
  contact_name TEXT NOT NULL,
  contact_channel TEXT NOT NULL,
  contact_value TEXT NOT NULL,
  note TEXT,
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unlock_requests_status_check
    CHECK (status IN ('submitted', 'approved', 'rejected')),
  CONSTRAINT unlock_requests_contact_channel_check
    CHECK (contact_channel IN ('wechat', 'phone', 'xiaohongshu')),
  CONSTRAINT unlock_requests_fulfilled_requires_approved
    CHECK (fulfilled_at IS NULL OR status = 'approved')
);

CREATE INDEX IF NOT EXISTS idx_unlock_requests_model_id
ON public.unlock_requests(model_id);

CREATE INDEX IF NOT EXISTS idx_unlock_requests_created_at
ON public.unlock_requests(created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unlock_requests_active_model_id
ON public.unlock_requests(model_id)
WHERE status IN ('submitted', 'approved');

CREATE OR REPLACE FUNCTION set_unlock_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_unlock_requests_updated_at ON public.unlock_requests;
CREATE TRIGGER update_unlock_requests_updated_at
BEFORE UPDATE ON public.unlock_requests
FOR EACH ROW
EXECUTE FUNCTION set_unlock_requests_updated_at();

ALTER TABLE public.unlock_requests ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'unlock_requests'
      AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
    ON public.unlock_requests FOR SELECT
    USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'unlock_requests'
      AND policyname = 'Public write access'
  ) THEN
    CREATE POLICY "Public write access"
    ON public.unlock_requests FOR ALL
    USING (true)
    WITH CHECK (true);
  END IF;
END;
$$;
