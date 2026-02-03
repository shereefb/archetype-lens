# Archetype Lens Development Notes

## Character Analysis System

The character analysis system uses a versioned prompt stored in the database, ensuring consistency between:
- The CLI script (bulk character analysis)
- The edge function (on-demand character generation)

### Architecture Overview

```
ARCHETYPE_ANALYSIS_PROMPT.md  →  CLI Script  →  analysis_prompts table
                                                        ↓
                                              Edge Function reads from here
```

### Files

| File | Purpose |
|------|---------|
| `ARCHETYPE_ANALYSIS_PROMPT.md` | Source of truth for the analysis prompt |
| `scripts/apply-archetype-analysis.ts` | CLI script for bulk character analysis |
| `supabase/functions/generate-characters/` | Edge function for on-demand generation |
| `supabase/migrations/` | Database schema changes |

---

## CLI Script: apply-archetype-analysis

Applies the archetype analysis prompt to characters in the database.

### Setup

1. Install dependencies:
   ```bash
   cd archetype-lens
   npm install @anthropic-ai/sdk tsx
   ```

2. Set environment variables (in `.env.local` or export):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # or NEXT_PUBLIC_SUPABASE_ANON_KEY
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

3. Apply database migrations:
   ```bash
   # Run these in your Supabase dashboard or via CLI
   # - 20260203_add_analysis_prompt_version.sql
   # - 20260203_create_analysis_prompts_table.sql
   ```

### Usage

```bash
cd archetype-lens

# Dry run - see what would be processed
npx tsx scripts/apply-archetype-analysis.ts --dry-run

# Process all characters needing analysis (default: Sonnet)
npx tsx scripts/apply-archetype-analysis.ts

# Use a specific model
npx tsx scripts/apply-archetype-analysis.ts --model opus
npx tsx scripts/apply-archetype-analysis.ts --model haiku

# Limit number of characters (for testing)
npx tsx scripts/apply-archetype-analysis.ts --limit 5

# Adjust delay between API calls
npx tsx scripts/apply-archetype-analysis.ts --delay 3000

# Combine options
npx tsx scripts/apply-archetype-analysis.ts --model opus --limit 10 --delay 1000
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--dry-run` | Show what would be processed without changes | false |
| `--delay <ms>` | Delay between API calls | 2000 |
| `--limit <n>` | Only process first N characters | unlimited |
| `--model <name>` | Claude model: sonnet, opus, haiku | sonnet |
| `--help` | Show help message | - |

### What It Does

1. **Reads the prompt** from `ARCHETYPE_ANALYSIS_PROMPT.md` (with version in frontmatter)
2. **Syncs to database** - inserts/updates the prompt in `analysis_prompts` table
3. **Finds characters** needing analysis:
   - Characters with no `analysis_prompt_version` (never analyzed)
   - Characters with older version than current prompt
4. **Analyzes each character** via Claude API
5. **Updates the database** with archetypes, virtues, arc description, key moments, and version

### Updating the Prompt

1. Edit `ARCHETYPE_ANALYSIS_PROMPT.md`
2. **Bump the version** in the frontmatter:
   ```yaml
   ---
   version: 1.1.0  # was 1.0.0
   lastUpdated: 2026-02-04
   ---
   ```
3. Run the script - it will re-analyze all characters with the new prompt

---

## Edge Function: generate-characters

Generates character analyses for new content requests (movies, books, etc.).

### Deployment

```bash
# Using Supabase CLI
supabase functions deploy generate-characters

# Or via Supabase MCP tools
```

### Environment Variables (set in Supabase Dashboard)

- `SUPABASE_URL` - Auto-set by Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Auto-set by Supabase
- `ANTHROPIC_API_KEY` - Must be set manually

### How It Works

1. Receives request with `title` and `category`
2. Fetches **active prompt** from `analysis_prompts` table
3. Calls Claude to analyze 5-10 characters from the source
4. Creates `source` record and `character` records
5. Stores `analysis_prompt_version` on each character

### Important

The edge function reads the prompt from the database, NOT from the file. You must run the CLI script at least once to sync the prompt before the edge function will work.

---

## Database Schema

### analysis_prompts

Stores versioned prompts for character analysis.

| Column | Type | Description |
|--------|------|-------------|
| version | TEXT (PK) | Semantic version (e.g., "1.0.0") |
| content | TEXT | Full prompt text |
| description | TEXT | Optional description |
| created_at | TIMESTAMPTZ | When inserted |
| is_active | BOOLEAN | Only one can be active |

### characters.analysis_prompt_version

Added column to track which prompt version was used.

| Column | Type | Description |
|--------|------|-------------|
| analysis_prompt_version | TEXT | Version used for this analysis |

---

## Version Strategy

- **Patch** (1.0.x): Typo fixes, minor wording changes
- **Minor** (1.x.0): Improved instructions, new examples
- **Major** (x.0.0): Changed output format, new archetype definitions

When you bump the version and run the script, all characters will be re-analyzed with the new prompt.
