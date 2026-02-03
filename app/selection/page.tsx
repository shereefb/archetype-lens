import { createClient } from '@/lib/supabase/server'
import { getSelectionFromCookie } from '@/lib/selection'
import { CATEGORIES, type Category } from '@/lib/archetypes'
import Link from 'next/link'

export default async function SelectionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let sourceIds: string[] = []

  if (user) {
    // Get from database for logged-in users
    const { data: selections } = await supabase
      .from('user_selections')
      .select('source_id')
      .eq('user_id', user.id)
    sourceIds = selections?.map(s => s.source_id) || []
  } else {
    // Get from cookie for anonymous users
    sourceIds = await getSelectionFromCookie()
  }

  // Fetch source details
  let sources: any[] = []
  if (sourceIds.length > 0) {
    const { data } = await supabase
      .from('sources')
      .select('*, characters(count)')
      .in('id', sourceIds)
    sources = data || []
  }

  const totalCharacters = sources.reduce(
    (sum, s) => sum + (s.characters?.[0]?.count || 0),
    0
  )

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">My Deck</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {sources.length} sources · {totalCharacters} characters
        </p>
      </header>

      {sources.length > 0 ? (
        <>
          <Link
            href="/random"
            className="block w-full bg-amber-600 hover:bg-amber-500 text-white text-center font-medium py-4 rounded-xl transition-colors"
          >
            🎲 Start Random
          </Link>

          <div className="space-y-3">
            {sources.map((source) => (
              <div
                key={source.id}
                className="flex items-center gap-4 bg-zinc-900 rounded-xl p-4"
              >
                <span className="text-2xl">
                  {CATEGORIES[source.category as Category]?.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{source.title}</h3>
                  <p className="text-xs text-zinc-500">
                    {source.characters?.[0]?.count || 0} characters
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-4">Your deck is empty</p>
          <Link
            href="/"
            className="inline-block bg-zinc-800 text-white px-6 py-3 rounded-xl"
          >
            Browse Library
          </Link>
        </div>
      )}

      {!user && sources.length > 0 && (
        <p className="text-center text-sm text-zinc-500">
          <Link href="/login" className="text-amber-500">Sign in</Link> to save your deck across devices
        </p>
      )}
    </div>
  )
}
