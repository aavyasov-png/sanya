-- ================================================
-- UZUM INTEGRATION TABLE
-- ================================================
-- Stores encrypted API tokens and integration settings
-- Uses client-side encryption (WebCrypto API):
-- - Token encrypted with user PIN via AES-GCM-256
-- - Key derived via PBKDF2(SHA-256, 200k iterations)
-- ================================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  token_cipher TEXT NOT NULL,
  token_iv TEXT NOT NULL,
  token_salt TEXT NOT NULL,
  kdf_iterations INTEGER NOT NULL DEFAULT 200000,
  shop_id BIGINT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- One integration per user per provider
  CONSTRAINT integrations_user_provider_unique UNIQUE (user_id, provider)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS integrations_user_id_idx ON public.integrations (user_id);
CREATE INDEX IF NOT EXISTS integrations_provider_idx ON public.integrations (provider);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_integrations_updated_at();

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own integrations
-- NOTE: This assumes user_id = telegram_id from Telegram WebApp
-- If using Supabase Auth, change to: auth.uid()
CREATE POLICY "Users can view own integrations"
  ON public.integrations
  FOR SELECT
  USING (true);  -- TODO: Replace with (user_id = current_setting('app.user_id', true)) or auth.uid()

CREATE POLICY "Users can insert own integrations"
  ON public.integrations
  FOR INSERT
  WITH CHECK (true);  -- TODO: Replace with proper check

CREATE POLICY "Users can update own integrations"
  ON public.integrations
  FOR UPDATE
  USING (true)  -- TODO: Replace with proper check
  WITH CHECK (true);

CREATE POLICY "Users can delete own integrations"
  ON public.integrations
  FOR DELETE
  USING (true);  -- TODO: Replace with proper check

-- ================================================
-- COMMENTS
-- ================================================
COMMENT ON TABLE public.integrations IS 'Stores encrypted external service tokens (Uzum, etc)';
COMMENT ON COLUMN public.integrations.user_id IS 'Telegram user ID or Supabase auth.uid()';
COMMENT ON COLUMN public.integrations.provider IS 'Service name: uzum, kaspi, etc';
COMMENT ON COLUMN public.integrations.token_cipher IS 'AES-GCM encrypted token (base64)';
COMMENT ON COLUMN public.integrations.token_iv IS 'AES-GCM initialization vector (base64)';
COMMENT ON COLUMN public.integrations.token_salt IS 'PBKDF2 salt (base64)';
COMMENT ON COLUMN public.integrations.kdf_iterations IS 'PBKDF2 iteration count';
COMMENT ON COLUMN public.integrations.shop_id IS 'Optional: Uzum shop ID if user has multiple';
COMMENT ON COLUMN public.integrations.metadata IS 'Additional data (shops list, last sync, etc)';
