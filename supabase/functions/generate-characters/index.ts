import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Anthropic from "npm:@anthropic-ai/sdk@0.39.0";
import { createClient } from "npm:@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Valid archetypes for validation
const VALID_ARCHETYPES = [
  // Main
  "King", "Warrior", "Magician", "Lover",
  // King subs
  "Elder", "Peacemaker", "Provider", "Visionary",
  // Warrior subs
  "Explorer", "Knight", "Challenger", "Chief",
  // Magician subs
  "Alchemist", "Guide", "Healer", "Seeker",
  // Lover subs
  "Artist", "Caregiver", "Trickster", "Infinite Player",
  // King shadows
  "Tyrant", "Victim", "Rebel", "Bystander", "Judge", "Pushover",
  "Codependent", "Mooch", "Dreamer", "Traditionalist",
  // Warrior shadows
  "Bully", "Wimp", "Orphan", "Homebody", "Loser", "Mercenary",
  "Asshole", "Doormat", "Hustler", "Chump",
  // Magician shadows
  "Manipulator", "Dummy", "Know-it-all", "Consumer", "Infidel",
  "Space Cadet", "Charlatan", "Wounded Child", "Extremist", "Blind Follower",
  // Lover shadows
  "Addict", "Hermit", "Sellout", "Tortured Artist", "Narcissist",
  "Martyr", "Jerk", "Grump", "Seducer", "Rigid Romeo",
];

const VALID_VIRTUES = [
  // King
  "Power", "Vulnerability", "Sovereignty", "Responsibility",
  "Justice", "Mercy", "Generosity", "Receptivity", "Progress", "Conservation",
  // Warrior
  "Strength", "Compassion", "Wanderlust", "Belonging",
  "Honor", "Discipline", "Confrontation", "Acceptance", "Confidence", "Humility",
  // Magician
  "Knowledge", "Reverence", "Mastery", "Beginner's Mind",
  "Worldliness", "Spirituality", "Intuition", "Empathy",
  "Allegiance to the Flame", "Obedience",
  // Lover
  "Passion", "Presence", "Performance", "Authenticity",
  "Self-Worth", "Agape", "Mischief", "Dignity", "Charm", "Devotion",
];

interface RequestBody {
  requestId: string;
  title: string;
  category: string;
}

interface CharacterAnalysis {
  name: string;
  archetypes: string[];
  virtues: string[];
  arc_description: string;
  key_moments: string[];
}

interface GenerationResult {
  characters: CharacterAnalysis[];
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { requestId, title, category } = (await req.json()) as RequestBody;

    // Initialize Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const anthropic = new Anthropic({ apiKey: anthropicApiKey });

    // Update request status to processing
    await supabase
      .from("content_requests")
      .update({ status: "processing" })
      .eq("id", requestId);

    // Get the active prompt from the database
    const { data: activePrompt, error: promptError } = await supabase
      .from("analysis_prompts")
      .select("*")
      .eq("is_active", true)
      .single();

    if (promptError || !activePrompt) {
      throw new Error(
        "No active analysis prompt found. Run the apply-archetype-analysis script first to sync the prompt."
      );
    }

    console.log(`Using prompt version: ${activePrompt.version}`);

    // Build the user prompt for generating characters
    const userPrompt = `
Analyze the main characters from: "${title}" (${category})

List the 5-10 most significant characters and provide archetype analysis for each.

Respond ONLY with a JSON object in this exact format (no markdown, no explanation):
{
  "characters": [
    {
      "name": "Character Name",
      "archetypes": ["Archetype1", "Archetype2", "Shadow1"],
      "virtues": ["Virtue1", "Virtue2", "Virtue3"],
      "arc_description": "2-5 sentences describing their archetypal journey...",
      "key_moments": ["Moment 1 description", "Moment 2 description"]
    }
  ]
}

Remember:
- Every character MUST have at least one shadow archetype
- Shadows must match their parent archetype family
- Include 1-4 archetypes per character
- Include 2-4 virtues per character
- Include 2-5 key moments per character
`;

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: activePrompt.content,
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
      throw new Error(`Failed to extract JSON from response`);
    }

    const result = JSON.parse(jsonMatch[0]) as GenerationResult;

    if (!result.characters || !Array.isArray(result.characters)) {
      throw new Error("Invalid response format: missing characters array");
    }

    // Validate and filter characters
    const validCharacters = result.characters.filter((char) => {
      // Basic validation
      if (!char.name || !char.archetypes?.length || !char.virtues?.length) {
        console.warn(`Skipping invalid character: ${char.name || "unnamed"}`);
        return false;
      }

      // Warn about unknown archetypes but still include the character
      for (const archetype of char.archetypes) {
        if (!VALID_ARCHETYPES.includes(archetype)) {
          console.warn(`Unknown archetype "${archetype}" for ${char.name}`);
        }
      }

      // Warn about unknown virtues but still include the character
      for (const virtue of char.virtues) {
        if (!VALID_VIRTUES.includes(virtue)) {
          console.warn(`Unknown virtue "${virtue}" for ${char.name}`);
        }
      }

      return true;
    });

    if (validCharacters.length === 0) {
      throw new Error("No valid characters generated");
    }

    // Create the source record
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .insert({
        title,
        category,
        created_by: null, // Could be set from auth context if available
      })
      .select()
      .single();

    if (sourceError) {
      throw new Error(`Failed to create source: ${sourceError.message}`);
    }

    // Insert all characters
    const charactersToInsert = validCharacters.map((char) => ({
      name: char.name,
      source_id: source.id,
      archetypes: char.archetypes,
      virtues: char.virtues,
      arc_description: char.arc_description,
      key_moments: char.key_moments,
      analysis_prompt_version: activePrompt.version,
    }));

    const { error: charactersError } = await supabase
      .from("characters")
      .insert(charactersToInsert);

    if (charactersError) {
      // Rollback: delete the source
      await supabase.from("sources").delete().eq("id", source.id);
      throw new Error(`Failed to create characters: ${charactersError.message}`);
    }

    // Update request with success
    await supabase
      .from("content_requests")
      .update({
        status: "completed",
        source_id: source.id,
      })
      .eq("id", requestId);

    console.log(
      `Successfully generated ${validCharacters.length} characters for "${title}"`
    );

    return new Response(
      JSON.stringify({
        success: true,
        sourceId: source.id,
        characterCount: validCharacters.length,
        promptVersion: activePrompt.version,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating characters:", error);

    // Try to update request status to failed
    try {
      const { requestId } = await req.clone().json();
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from("content_requests")
        .update({
          status: "failed",
          error_message: error instanceof Error ? error.message : String(error),
        })
        .eq("id", requestId);
    } catch {
      // Ignore errors updating status
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
