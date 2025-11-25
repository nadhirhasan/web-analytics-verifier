-- Add new integrations table for multi-platform support
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  platform_type TEXT NOT NULL CHECK (platform_type IN ('google_analytics', 'shopify', 'woocommerce', 'javascript_pixel', 'plausible', 'fathom', 'custom_api')),
  platform_name TEXT NOT NULL, -- User-friendly name
  credentials JSONB, -- Encrypted platform-specific credentials
  config JSONB, -- Platform-specific configuration
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at TIMESTAMPTZ,
  sync_error TEXT,
  is_primary BOOLEAN DEFAULT false, -- Primary integration for campaigns
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform_type, platform_name)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_integrations_platform_type ON public.integrations(platform_type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON public.integrations(status);

-- Update campaigns table to reference integrations instead of just GA
ALTER TABLE public.campaigns 
  DROP COLUMN IF EXISTS ga_account_id,
  ADD COLUMN IF NOT EXISTS integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_integration_id ON public.campaigns(integration_id);

-- Update trigger
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Integrations policies
CREATE POLICY "Users can view own integrations" ON public.integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integrations" ON public.integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Migrate existing GA accounts to integrations table
INSERT INTO public.integrations (user_id, platform_type, platform_name, credentials, status, created_at)
SELECT 
  user_id,
  'google_analytics' as platform_type,
  COALESCE(property_name, 'Google Analytics') as platform_name,
  jsonb_build_object(
    'account_id', account_id,
    'property_id', property_id,
    'access_token', access_token,
    'refresh_token', refresh_token,
    'token_expires_at', token_expires_at
  ) as credentials,
  CASE WHEN is_active THEN 'active' ELSE 'inactive' END as status,
  created_at
FROM public.google_analytics_accounts
ON CONFLICT DO NOTHING;
