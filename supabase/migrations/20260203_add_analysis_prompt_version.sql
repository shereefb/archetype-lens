-- Add analysis_prompt_version column to characters table
-- This tracks which version of the archetype analysis prompt was used to generate the character's analysis
-- NULL means the character has never been analyzed (or was analyzed before version tracking)

ALTER TABLE characters
ADD COLUMN IF NOT EXISTS analysis_prompt_version TEXT DEFAULT NULL;

-- Add a comment explaining the column
COMMENT ON COLUMN characters.analysis_prompt_version IS 'Semantic version of the archetype analysis prompt used to generate this character analysis (e.g., 1.0.0)';
