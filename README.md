# Archetype Lens

A mobile-first web app for learning masculine archetypes through fictional and real characters.

## Concept

Archetype Lens helps users understand the King, Warrior, Magician, and Lover archetypes by analyzing characters from movies, books, history, mythology, and current events.

**The Core Loop:**
1. Build a **selection** of sources (movies, books, etc.) from the library
2. Hit **Random** to see a character card (name + image only)
3. **Guess the archetypes** — solo or discuss with a group
4. **Tap to reveal** the AI-generated analysis
5. Learn by comparing your thinking to the analysis

The hidden-then-reveal mechanic turns passive browsing into active learning.

## Features

- **Library Browser** — Browse content by category (Movies, Books, History, Stories, Current Events)
- **Personal Deck** — Build a selection of sources to study
- **Random Mode** — Swipeable card stack for studying characters
- **Request New Content** — AI generates character analyses for any title
- **Magic Link Auth** — Passwordless login with long session memory

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, PostgreSQL, Edge Functions)
- **AI:** Claude API for character analysis generation
- **Hosting:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase project
- Claude API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Project Structure

```
archetype-lens/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Library browser
│   ├── selection/         # User's deck
│   ├── random/            # Card stack view
│   ├── request/           # Request new content
│   ├── source/[id]/       # Source detail
│   ├── login/             # Magic link auth
│   └── auth/confirm/      # Auth callback
├── components/            # React components
│   ├── CharacterCard.tsx  # Card with reveal mechanic
│   ├── CardStack.tsx      # Swipeable card stack
│   └── Navigation.tsx     # Bottom nav
├── lib/                   # Utilities
│   ├── supabase/          # Supabase client setup
│   ├── archetypes.ts      # Archetype system constants
│   └── selection.ts       # Cookie-based selection
├── types/                 # TypeScript types
└── middleware.ts          # Supabase session refresh
```

## Archetype System

Based on the King, Warrior, Magician, Lover framework:

**Main Archetypes:**
- **King** — Order, blessing, providing
- **Warrior** — Courage, discipline, action
- **Magician** — Knowledge, transformation, guidance
- **Lover** — Aliveness, connection, presence

**Sub-Archetypes:** Elder, Visionary, Knight, Explorer, Healer, Guide, Artist, Trickster, and more.

**Shadows:** Each archetype has active and passive shadows (e.g., Tyrant/Victim for King).

**Pillar Virtues:** 40 virtues like Power, Vulnerability, Honor, Compassion, Knowledge, Passion.

## Database Schema

- `sources` — Movies, books, historical events, stories
- `characters` — Characters with archetype analysis
- `user_selections` — User's selected sources
- `content_requests` — Tracks AI generation requests

## Contributing

This is part of the Mature Masculine project. See the main repository for contribution guidelines.

## License

Private — Part of the Mature Masculine project.
