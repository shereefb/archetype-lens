import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CATEGORIES, type Category } from '@/lib/archetypes'
import { CharacterCard } from '@/components/CharacterCard'
import { SelectionButton } from './SelectionButton'
import { getSelectionFromCookie } from '@/lib/selection'

interface Character {
  id: string
  name: string
  image_url?: string
  archetypes: string[]
  virtues: string[]
  arc_description: string
  key_moments: { title: string; description: string }[]
  source: {
    title: string
    category: Category
  }
}

export default async function SourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  const { data: source } = await supabase
    .from('sources')
    .select('*, characters(*)')
    .eq('id', id)
    .single()

  if (!source) {
    notFound()
  }

  // Check if source is in user's selection
  const { data: { user } } = await supabase.auth.getUser()
  let isInSelection = false

  if (user) {
    // Check database for logged-in users
    const { data: selection } = await supabase
      .from('user_selections')
      .select('source_id')
      .eq('user_id', user.id)
      .eq('source_id', id)
      .single()
    isInSelection = !!selection
  } else {
    // Check cookie for anonymous users
    const cookieSelection = await getSelectionFromCookie()
    isInSelection = cookieSelection.includes(id)
  }

  const category = CATEGORIES[source.category as Category]

  const characters: Character[] = (source.characters || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    archetypes: c.archetypes as string[],
    virtues: c.virtues as string[],
    arc_description: c.arc_description,
    key_moments: c.key_moments as { title: string; description: string }[],
    source: {
      title: source.title,
      category: source.category,
    },
  }))

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-400 transition-colors"
      >
        <span>←</span>
        <span>Back to Library</span>
      </Link>

      <header>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <span className="text-3xl">{category.icon}</span>
          {source.title}
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {category.name} · {characters.length} characters
        </p>
      </header>

      <SelectionButton sourceId={source.id} isInSelection={isInSelection} />

      <div className="space-y-6">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  )
}
