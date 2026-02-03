#!/usr/bin/env npx tsx
/**
 * Apply Archetype Analysis Script
 *
 * This script applies the archetype analysis prompt to characters in the database,
 * tracking prompt versions to avoid redundant analysis and enable re-analysis
 * when the prompt improves.
 *
 * Usage:
 *   npx tsx scripts/apply-archetype-analysis.ts [options]
 *
 * Options:
 *   --dry-run       Show what would be processed without making changes
 *   --delay <ms>    Delay between API calls (default: 2000)
 *   --limit <n>     Only process first N characters
 *   --model <name>  Claude model: sonnet, opus, haiku (default: sonnet)
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import type { Database } from "../types/database";
import { ARCHETYPES, VIRTUES } from "../lib/archetypes";

// Load environment variables from .env.local
config({ path: path.join(__dirname, "..", ".env.local") });

// ============================================================================
// Configuration
// ============================================================================

const MODELS = {
  sonnet: "claude-sonnet-4-20250514",
  opus: "claude-opus-4-5-20251101",
  haiku: "claude-haiku-4-20250514",
} as const;

type ModelName = keyof typeof MODELS;

interface Config {
  dryRun: boolean;
  delay: number;
  limit: number | null;
  model: ModelName;
}

// ============================================================================
// Parse CLI Arguments
// ============================================================================

function parseArgs(): Config {
  const args = process.argv.slice(2);
  const config: Config = {
    dryRun: false,
    delay: 2000,
    limit: null,
    model: "sonnet",
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--dry-run":
        config.dryRun = true;
        break;
      case "--delay":
        config.delay = parseInt(args[++i], 10);
        if (isNaN(config.delay) || config.delay < 0) {
          console.error("Error: --delay must be a positive number");
          process.exit(1);
        }
        break;
      case "--limit":
        config.limit = parseInt(args[++i], 10);
        if (isNaN(config.limit) || config.limit < 1) {
          console.error("Error: --limit must be a positive number");
          process.exit(1);
        }
        break;
      case "--model":
        const modelArg = args[++i] as ModelName;
        if (!MODELS[modelArg]) {
          console.error(
            `Error: --model must be one of: ${Object.keys(MODELS).join(", ")}`
          );
          process.exit(1);
        }
        config.model = modelArg;
        break;
      case "--help":
      case "-h":
        printHelp();
        process.exit(0);
      default:
        console.error(`Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  return config;
}

function printHelp() {
  console.log(`
Apply Archetype Analysis Script

Usage:
  npx tsx scripts/apply-archetype-analysis.ts [options]

Options:
  --dry-run       Show what would be processed without making changes
  --delay <ms>    Delay between API calls (default: 2000)
  --limit <n>     Only process first N characters
  --model <name>  Claude model: sonnet, opus, haiku (default: sonnet)
  --help, -h      Show this help message

Examples:
  npx tsx scripts/apply-archetype-analysis.ts --dry-run
  npx tsx scripts/apply-archetype-analysis.ts --model opus --limit 5
  npx tsx scripts/apply-archetype-analysis.ts --delay 3000
`);
}

// ============================================================================
// Version Parsing
// ============================================================================

interface PromptMetadata {
  version: string;
  lastUpdated?: string;
  description?: string;
}

function parsePromptFile(filePath: string): {
  metadata: PromptMetadata;
  content: string;
} {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  // Check for YAML frontmatter
  if (!fileContent.startsWith("---")) {
    throw new Error(
      `Prompt file missing YAML frontmatter. Add version info at the top of ${filePath}`
    );
  }

  const endOfFrontmatter = fileContent.indexOf("---", 3);
  if (endOfFrontmatter === -1) {
    throw new Error("Invalid YAML frontmatter: missing closing ---");
  }

  const frontmatter = fileContent.slice(3, endOfFrontmatter).trim();
  const content = fileContent.slice(endOfFrontmatter + 3).trim();

  // Parse YAML manually (simple key: value parsing)
  const metadata: PromptMetadata = { version: "" };
  for (const line of frontmatter.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    if (key === "version") metadata.version = value;
    if (key === "lastUpdated") metadata.lastUpdated = value;
    if (key === "description") metadata.description = value;
  }

  if (!metadata.version) {
    throw new Error("Prompt file missing version in frontmatter");
  }

  return { metadata, content };
}

/**
 * Compare semantic versions
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] || 0;
    const partB = partsB[i] || 0;
    if (partA < partB) return -1;
    if (partA > partB) return 1;
  }
  return 0;
}

// ============================================================================
// Database Operations
// ============================================================================

type Character = Database["public"]["Tables"]["characters"]["Row"];
type Source = Database["public"]["Tables"]["sources"]["Row"];

interface CharacterWithSource extends Character {
  source: Source;
}

function createSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)"
    );
  }

  return createClient<Database>(url, key);
}

/**
 * Sync the local prompt file to the database.
 * - If the version doesn't exist, insert it and mark as active
 * - If the version exists with same content, do nothing
 * - If the version exists with different content, warn (content drift)
 */
async function syncPromptToDatabase(
  supabase: ReturnType<typeof createSupabaseClient>,
  metadata: PromptMetadata,
  content: string,
  dryRun: boolean
): Promise<void> {
  console.log("Syncing prompt to database...");

  // Check if this version already exists
  const { data: existing, error: fetchError } = await supabase
    .from("analysis_prompts")
    .select("*")
    .eq("version", metadata.version)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 = not found, which is expected for new versions
    throw new Error(`Failed to check existing prompt: ${fetchError.message}`);
  }

  if (existing) {
    // Version exists - check if content matches
    if (existing.content === content) {
      console.log(`  Prompt v${metadata.version} already in database (content matches)`);
    } else {
      console.warn(`  ⚠ WARNING: Prompt v${metadata.version} exists in database with DIFFERENT content!`);
      console.warn(`    Local file has been modified without bumping the version.`);
      console.warn(`    Either bump the version in ARCHETYPE_ANALYSIS_PROMPT.md or update the database.`);
    }

    // Ensure it's marked as active
    if (!existing.is_active && !dryRun) {
      const { error: updateError } = await supabase
        .from("analysis_prompts")
        .update({ is_active: true })
        .eq("version", metadata.version);

      if (updateError) {
        throw new Error(`Failed to activate prompt: ${updateError.message}`);
      }
      console.log(`  Marked v${metadata.version} as active`);
    }
  } else {
    // New version - insert it
    if (dryRun) {
      console.log(`  Would insert prompt v${metadata.version} and mark as active`);
    } else {
      const { error: insertError } = await supabase
        .from("analysis_prompts")
        .insert({
          version: metadata.version,
          content: content,
          description: metadata.description || null,
          is_active: true,
        });

      if (insertError) {
        throw new Error(`Failed to insert prompt: ${insertError.message}`);
      }
      console.log(`  ✓ Inserted prompt v${metadata.version} and marked as active`);
    }
  }
}


async function getCharactersNeedingAnalysis(
  supabase: ReturnType<typeof createSupabaseClient>,
  currentVersion: string,
  limit: number | null
): Promise<CharacterWithSource[]> {
  // Fetch all characters with their sources
  let query = supabase.from("characters").select(`
      *,
      source:sources(*)
    `);

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch characters: ${error.message}`);
  }

  // Filter to characters needing analysis:
  // 1. No analysis_prompt_version (never analyzed or pre-tracking)
  // 2. Version is older than current version
  return (data as unknown as CharacterWithSource[]).filter((char) => {
    if (!char.analysis_prompt_version) return true;
    return compareVersions(char.analysis_prompt_version, currentVersion) < 0;
  });
}

async function updateCharacterAnalysis(
  supabase: ReturnType<typeof createSupabaseClient>,
  characterId: string,
  analysis: AnalysisResult,
  version: string
): Promise<void> {
  const { error } = await supabase
    .from("characters")
    .update({
      archetypes: analysis.archetypes,
      virtues: analysis.virtues,
      arc_description: analysis.arc_description,
      key_moments: analysis.key_moments,
      analysis_prompt_version: version,
    })
    .eq("id", characterId);

  if (error) {
    throw new Error(`Failed to update character: ${error.message}`);
  }
}

// ============================================================================
// Claude API
// ============================================================================

interface AnalysisResult {
  archetypes: string[];
  virtues: string[];
  arc_description: string;
  key_moments: string[];
}

function createAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }
  return new Anthropic({ apiKey });
}

async function analyzeCharacter(
  client: Anthropic,
  promptContent: string,
  character: CharacterWithSource,
  model: string
): Promise<AnalysisResult> {
  const userPrompt = `
Analyze this character:
- Character: ${character.name}
- Source: ${character.source.title}
- Source Type: ${character.source.category}

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "archetypes": ["Archetype1", "Archetype2"],
  "virtues": ["Virtue1", "Virtue2", "Virtue3"],
  "arc_description": "2-5 sentences describing their archetypal journey...",
  "key_moments": ["Moment 1 description", "Moment 2 description"]
}
`;

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: promptContent,
    messages: [{ role: "user", content: userPrompt }],
  });

  // Extract text from response
  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON from response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from response: ${textContent.text}`);
  }

  const result = JSON.parse(jsonMatch[0]) as AnalysisResult;

  // Validate the result
  validateAnalysisResult(result, character.name);

  return result;
}

function validateAnalysisResult(result: AnalysisResult, characterName: string): void {
  // Check required fields
  if (!Array.isArray(result.archetypes) || result.archetypes.length === 0) {
    throw new Error(`Invalid archetypes for ${characterName}`);
  }
  if (!Array.isArray(result.virtues) || result.virtues.length === 0) {
    throw new Error(`Invalid virtues for ${characterName}`);
  }
  if (typeof result.arc_description !== "string" || !result.arc_description) {
    throw new Error(`Invalid arc_description for ${characterName}`);
  }
  if (!Array.isArray(result.key_moments) || result.key_moments.length === 0) {
    throw new Error(`Invalid key_moments for ${characterName}`);
  }

  // Validate archetypes exist in our system
  const validArchetypes: string[] = Object.values(ARCHETYPES).map((a) => a.name);
  for (const archetype of result.archetypes) {
    if (!validArchetypes.includes(archetype)) {
      console.warn(`  Warning: Unknown archetype "${archetype}" for ${characterName}`);
    }
  }

  // Validate virtues exist in our system
  for (const virtue of result.virtues) {
    if (!VIRTUES.includes(virtue)) {
      console.warn(`  Warning: Unknown virtue "${virtue}" for ${characterName}`);
    }
  }
}

// ============================================================================
// Main
// ============================================================================

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const config = parseArgs();

  console.log("=".repeat(60));
  console.log("Archetype Analysis Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${config.dryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Model: ${config.model} (${MODELS[config.model]})`);
  console.log(`Delay: ${config.delay}ms`);
  if (config.limit) console.log(`Limit: ${config.limit} characters`);
  console.log();

  // Parse prompt file
  const promptPath = path.join(__dirname, "..", "ARCHETYPE_ANALYSIS_PROMPT.md");
  console.log(`Loading prompt from: ${promptPath}`);
  const { metadata, content: promptContent } = parsePromptFile(promptPath);
  console.log(`Prompt version: ${metadata.version}`);
  if (metadata.lastUpdated) console.log(`Last updated: ${metadata.lastUpdated}`);
  console.log();

  // Initialize clients
  const supabase = createSupabaseClient();
  const anthropic = config.dryRun ? null : createAnthropicClient();

  // Sync prompt to database (so edge function can use it)
  await syncPromptToDatabase(supabase, metadata, promptContent, config.dryRun);
  console.log();

  // Get characters needing analysis
  console.log("Fetching characters needing analysis...");
  const characters = await getCharactersNeedingAnalysis(
    supabase,
    metadata.version,
    config.limit
  );

  if (characters.length === 0) {
    console.log("No characters need analysis. All up to date!");
    return;
  }

  console.log(`Found ${characters.length} characters needing analysis:`);
  for (const char of characters) {
    const reason = char.analysis_prompt_version
      ? `outdated (${char.analysis_prompt_version} < ${metadata.version})`
      : "never analyzed";
    console.log(`  - ${char.name} (${char.source.title}): ${reason}`);
  }
  console.log();

  if (config.dryRun) {
    console.log("DRY RUN - No changes will be made.");
    return;
  }

  // Process characters
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const progress = `[${i + 1}/${characters.length}]`;

    console.log(`${progress} Analyzing ${char.name} from ${char.source.title}...`);

    try {
      const analysis = await analyzeCharacter(
        anthropic!,
        promptContent,
        char,
        MODELS[config.model]
      );

      await updateCharacterAnalysis(supabase, char.id, analysis, metadata.version);

      const archetypesSummary = analysis.archetypes.slice(0, 3).join(", ");
      console.log(`  ✓ ${char.name}: ${archetypesSummary} - v${metadata.version}`);
      processed++;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ ${char.name}: ${message}`);
      failed++;
    }

    // Delay before next request (except for last one)
    if (i < characters.length - 1) {
      await sleep(config.delay);
    }
  }

  // Summary
  console.log();
  console.log("=".repeat(60));
  console.log("Summary");
  console.log("=".repeat(60));
  console.log(`Total: ${characters.length}`);
  console.log(`Processed: ${processed}`);
  console.log(`Failed: ${failed}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
