import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CATEGORIES, type Category } from '@/lib/archetypes'
import { CharacterCard } from '@/components/CharacterCard'
import { AddToSelectionButton } from './AddToSelectionButton'

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
      <header>
        <span className="text-3xl mb-2 block">{category.icon}</span>
        <h1 className="text-2xl font-bold">{source.title}</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {category.name} · {characters.length} characters
        </p>
      </header>

      <AddToSelectionButton sourceId={source.id} />

      <div className="space-y-6">
        {characters.map((character) => (
          <CharacterCard key={character.id} character={character} />
        ))}
      </div>
    </div>
  )
}
