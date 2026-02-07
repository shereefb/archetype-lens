#!/usr/bin/env npx tsx
/**
 * Add new movie and book sources with their characters
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";

config({ path: path.join(__dirname, "..", ".env.local") });

// Middle school to high school level movies
const MOVIES = [
  "The Hunger Games",
  "Spider-Man: Into the Spider-Verse",
  "The Maze Runner",
  "Divergent",
  "The Fault in Our Stars",
  "Mean Girls",
  "The Breakfast Club",
  "Ferris Bueller's Day Off",
  "Dead Poets Society",
  "Stand By Me",
  "The Karate Kid",
  "E.T. the Extra-Terrestrial",
  "Back to the Future",
  "Jurassic Park",
  "The Princess Bride",
  "Clueless",
  "10 Things I Hate About You",
  "The Outsiders",
  "Remember the Titans",
  "Holes",
];

// Middle school to high school level books
const BOOKS = [
  "The Hunger Games by Suzanne Collins",
  "Percy Jackson and the Lightning Thief by Rick Riordan",
  "The Giver by Lois Lowry",
  "The Outsiders by S.E. Hinton",
  "Holes by Louis Sachar",
  "The Maze Runner by James Dashner",
  "Divergent by Veronica Roth",
  "Ender's Game by Orson Scott Card",
  "The Fault in Our Stars by John Green",
  "Wonder by R.J. Palacio",
  "The Perks of Being a Wallflower by Stephen Chbosky",
  "Tuck Everlasting by Natalie Babbitt",
  "Number the Stars by Lois Lowry",
  "Hatchet by Gary Paulsen",
  "Bridge to Terabithia by Katherine Paterson",
  "A Wrinkle in Time by Madeleine L'Engle",
  "The Diary of Anne Frank",
  "Lord of the Flies by William Golding",
  "Animal Farm by George Orwell",
  "Fahrenheit 451 by Ray Bradbury",
];

interface CharacterAnalysis {
  name: string;
  archetypes: string[];
  virtues: string[];
  arc_description: string;
  key_moments: string[];
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const anthropicKey = process.env.ANTHROPIC_API_KEY!;

  if (!supabaseUrl || !supabaseKey || !anthropicKey) {
    console.error("Missing environment variables");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const anthropic = new Anthropic({ apiKey: anthropicKey });

  // Load the analysis prompt
  const promptPath = path.join(__dirname, "..", "ARCHETYPE_ANALYSIS_PROMPT.md");
  const promptContent = fs.readFileSync(promptPath, "utf-8");
  const systemPrompt = promptContent.split("---").slice(2).join("---").trim();

  // Get existing sources to avoid duplicates
  const { data: existingSources } = await supabase
    .from("sources")
    .select("title");
  const existingTitles = new Set((existingSources || []).map((s) => s.title.toLowerCase()));

  const allSources = [
    ...MOVIES.map((title) => ({ title, category: "movie" })),
    ...BOOKS.map((title) => ({ title, category: "book" })),
  ];

  // Filter out existing sources
  const newSources = allSources.filter(
    (s) => !existingTitles.has(s.title.toLowerCase())
  );

  console.log(`Found ${existingTitles.size} existing sources`);
  console.log(`Adding ${newSources.length} new sources\n`);

  for (let i = 0; i < newSources.length; i++) {
    const { title, category } = newSources[i];
    console.log(`[${i + 1}/${newSources.length}] Processing: ${title}`);

    try {
      // Generate characters with Claude
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
      "key_moments": ["Moment 1 - Description", "Moment 2 - Description"]
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

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });

      const textContent = response.content.find((b) => b.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text response");
      }

      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON in response");
      }

      const result = JSON.parse(jsonMatch[0]) as { characters: CharacterAnalysis[] };

      if (!result.characters?.length) {
        throw new Error("No characters in response");
      }

      // Create source
      const { data: source, error: sourceError } = await supabase
        .from("sources")
        .insert({ title, category })
        .select()
        .single();

      if (sourceError) {
        throw new Error(`Source insert failed: ${sourceError.message}`);
      }

      // Create characters
      const characters = result.characters.map((c) => ({
        name: c.name,
        source_id: source.id,
        archetypes: c.archetypes,
        virtues: c.virtues,
        arc_description: c.arc_description,
        key_moments: c.key_moments,
        analysis_prompt_version: "1.1.0",
      }));

      const { error: charError } = await supabase
        .from("characters")
        .insert(characters);

      if (charError) {
        // Rollback source
        await supabase.from("sources").delete().eq("id", source.id);
        throw new Error(`Characters insert failed: ${charError.message}`);
      }

      console.log(`  ✓ Added ${result.characters.length} characters`);

      // Delay between API calls
      await new Promise((r) => setTimeout(r, 2000));
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ✗ Failed: ${msg}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
