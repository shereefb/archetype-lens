import { createClient } from '@/lib/supabase/server'
import { getSelectionFromCookie } from '@/lib/selection'
import { CardStack } from '@/components/CardStack'
import Link from 'next/link'

export default async function RandomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let sourceIds: string[] = []

  if (user) {
    const { data: selections } = await supabase
      .from('user_selections')
      .select('source_id')
      .eq('user_id', user.id)
    sourceIds = selections?.map(s => s.source_id) || []
  } else {
    sourceIds = await getSelectionFromCookie()
  }

  if (sourceIds.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Sources Selected</h1>
        <p className="text-zinc-400 mb-6">Add sources to your deck first</p>
        <Link
          href="/"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-xl"
        >
          Browse Library
        </Link>
      </div>
    )
  }

  // Fetch random characters from selected sources
  const { data: characters } = await supabase
    .from('characters')
    .select(`
      id,
      name,
      image_url,
      archetypes,
      virtues,
      arc_description,
      key_moments,
      source:sources(title, category)
    `)
    .in('source_id', sourceIds)

  if (!characters || characters.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No Characters Found</h1>
        <p className="text-zinc-400">Selected sources have no characters yet</p>
      </div>
    )
  }

  // Shuffle characters
  const shuffled = [...characters].sort(() => Math.random() - 0.5)

  // Transform for CardStack
  const cardCharacters = shuffled.map(c => ({
    id: c.id,
    name: c.name,
    image_url: c.image_url,
    archetypes: c.archetypes as string[],
    virtues: c.virtues as string[],
    arc_description: c.arc_description,
    key_moments: c.key_moments as { title: string; description: string }[],
    source: {
      title: (c.source as any)?.title || 'Unknown',
      category: (c.source as any)?.category || 'movie',
    },
  }))

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-xl font-bold">Random Character</h1>
        <p className="text-zinc-400 text-sm">Guess the archetypes, then tap to reveal</p>
      </header>

      <CardStack characters={cardCharacters} />
    </div>
  )
}
