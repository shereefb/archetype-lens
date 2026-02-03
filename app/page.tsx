import { createClient } from '@/lib/supabase/server'
import { CATEGORIES, type Category } from '@/lib/archetypes'
import Link from 'next/link'

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const selectedCategory = params.category as Category | undefined

  let query = supabase
    .from('sources')
    .select('*, characters(count)')
    .order('created_at', { ascending: false })

  if (selectedCategory) {
    query = query.eq('category', selectedCategory)
  }

  const { data: sources } = await query

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Library</h1>
        <p className="text-zinc-400 text-sm mt-1">Browse sources and add to your deck</p>
      </header>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        <Link
          href="/"
          className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
            !selectedCategory
              ? 'bg-amber-600 text-white'
              : 'bg-zinc-800 text-zinc-300'
          }`}
        >
          All
        </Link>
        {Object.entries(CATEGORIES).map(([key, value]) => (
          <Link
            key={key}
            href={`/?category=${key}`}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedCategory === key
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {value.icon} {value.name}
          </Link>
        ))}
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-2 gap-3">
        {sources?.map((source) => (
          <Link
            key={source.id}
            href={`/source/${source.id}`}
            className="bg-zinc-900 rounded-xl p-4 hover:bg-zinc-800 transition-colors"
          >
            <span className="text-2xl mb-2 block">
              {CATEGORIES[source.category as Category]?.icon}
            </span>
            <h3 className="font-medium text-white truncate">{source.title}</h3>
            <p className="text-xs text-zinc-500 mt-1">
              {source.characters?.[0]?.count || 0} characters
            </p>
          </Link>
        ))}
      </div>

      {(!sources || sources.length === 0) && (
        <div className="text-center py-12">
          <p className="text-zinc-400">No sources found</p>
          <Link href="/request" className="text-amber-500 text-sm mt-2 inline-block">
            Request new content →
          </Link>
        </div>
      )}
    </div>
  )
}
