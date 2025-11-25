-- Web Analytics Verifier Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Google Analytics Accounts table
CREATE TABLE IF NOT EXISTS public.google_analytics_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL,
  property_id TEXT NOT NULL,
  property_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ga_account_id UUID REFERENCES public.google_analytics_accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT NOT NULL,
  utm_campaign TEXT NOT NULL,
  utm_term TEXT,
  utm_content TEXT,
  goal_visitors INTEGER,
  goal_duration INTEGER, -- in seconds
  goal_bounce_rate DECIMAL(5,2), -- percentage
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  shareable_link TEXT UNIQUE NOT NULL,
  shareable_token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  is_public BOOLEAN DEFAULT true,
  quality_score DECIMAL(5,2), -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign Metrics table (cached/aggregated data from GA)
CREATE TABLE IF NOT EXISTS public.campaign_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  visitors INTEGER DEFAULT 0,
  sessions INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER, -- in seconds
  new_users INTEGER DEFAULT 0,
  returning_users INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  top_sources JSONB, -- [{source: 'facebook', visitors: 100}, ...]
  top_countries JSONB, -- [{country: 'US', visitors: 150}, ...]
  top_devices JSONB, -- [{device: 'mobile', visitors: 200}, ...]
  hourly_data JSONB, -- [{hour: 0, visitors: 10}, ...]
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, date)
);

-- Freelancer Access table (optional - for future features)
CREATE TABLE IF NOT EXISTS public.freelancer_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  freelancer_email TEXT NOT NULL,
  access_token TEXT UNIQUE NOT NULL,
  can_view_details BOOLEAN DEFAULT true,
  can_export_data BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(campaign_id, freelancer_email)
);

-- Activity Log table (audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_shareable_token ON public.campaigns(shareable_token);
CREATE INDEX IF NOT EXISTS idx_ga_accounts_user_id ON public.google_analytics_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_campaign_id ON public.campaign_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON public.campaign_metrics(date);
CREATE INDEX IF NOT EXISTS idx_freelancer_access_campaign_id ON public.freelancer_access(campaign_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_campaign_id ON public.activity_logs(campaign_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ga_accounts_updated_at BEFORE UPDATE ON public.google_analytics_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_analytics_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Google Analytics Accounts policies
CREATE POLICY "Users can view own GA accounts" ON public.google_analytics_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GA accounts" ON public.google_analytics_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GA accounts" ON public.google_analytics_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own GA accounts" ON public.google_analytics_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Campaigns policies
CREATE POLICY "Users can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public campaigns are viewable by shareable_token" ON public.campaigns
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = user_id);

-- Campaign Metrics policies
CREATE POLICY "Users can view metrics for own campaigns" ON public.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Public campaign metrics viewable by anyone" ON public.campaign_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_metrics.campaign_id
      AND campaigns.is_public = true
    )
  );

-- Freelancer Access policies
CREATE POLICY "Users can manage freelancer access for own campaigns" ON public.freelancer_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = freelancer_access.campaign_id
      AND campaigns.user_id = auth.uid()
    )
  );

-- Activity Logs policies
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Function to generate shareable link token
CREATE OR REPLACE FUNCTION generate_shareable_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_campaign_id UUID,
  p_action TEXT,
  p_details JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.activity_logs (user_id, campaign_id, action, details)
  VALUES (p_user_id, p_campaign_id, p_action, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;
