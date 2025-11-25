-- Create temporary OAuth sessions table for storing tokens during property selection
CREATE TABLE IF NOT EXISTS oauth_temp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_oauth_temp_sessions_user_id ON oauth_temp_sessions(user_id);
CREATE INDEX idx_oauth_temp_sessions_expires_at ON oauth_temp_sessions(expires_at);

-- RLS policies
ALTER TABLE oauth_temp_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
  ON oauth_temp_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Function to auto-delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_oauth_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM oauth_temp_sessions
  WHERE expires_at < NOW();
END;
$$;

-- You can set up a cron job in Supabase to run this function periodically
COMMENT ON FUNCTION delete_expired_oauth_sessions() IS 'Deletes OAuth sessions that have expired';
