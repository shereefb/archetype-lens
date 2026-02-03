-- Create analysis_prompts table to store versioned prompts
-- This allows the edge function and CLI script to use the same prompt

CREATE TABLE IF NOT EXISTS analysis_prompts (
  version TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE
);

-- Create index for quick lookup of active prompt
CREATE INDEX IF NOT EXISTS idx_analysis_prompts_active ON analysis_prompts(is_active) WHERE is_active = TRUE;

-- Add comment explaining the table
COMMENT ON TABLE analysis_prompts IS 'Stores versioned archetype analysis prompts for character analysis';
COMMENT ON COLUMN analysis_prompts.version IS 'Semantic version (e.g., 1.0.0)';
COMMENT ON COLUMN analysis_prompts.content IS 'Full prompt text sent to Claude';
COMMENT ON COLUMN analysis_prompts.is_active IS 'Only one prompt should be active at a time';

-- Function to ensure only one active prompt
CREATE OR REPLACE FUNCTION ensure_single_active_prompt()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = TRUE THEN
    UPDATE analysis_prompts SET is_active = FALSE WHERE version != NEW.version;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single active prompt
DROP TRIGGER IF EXISTS single_active_prompt ON analysis_prompts;
CREATE TRIGGER single_active_prompt
  AFTER INSERT OR UPDATE OF is_active ON analysis_prompts
  FOR EACH ROW
  WHEN (NEW.is_active = TRUE)
  EXECUTE FUNCTION ensure_single_active_prompt();
