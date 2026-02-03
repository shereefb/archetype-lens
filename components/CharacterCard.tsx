'use client'

import { useState } from 'react'
import { ARCHETYPES, CATEGORIES, type ArchetypeKey, type Category } from '@/lib/archetypes'

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

interface CharacterCardProps {
  character: Character
}

const colorClasses: Record<string, string> = {
  amber: 'bg-amber-900/50 text-amber-300',
  red: 'bg-red-900/50 text-red-300',
  purple: 'bg-purple-900/50 text-purple-300',
  rose: 'bg-rose-900/50 text-rose-300',
  zinc: 'bg-zinc-700 text-zinc-300',
}

export function CharacterCard({ character }: CharacterCardProps) {
  const [flipped, setFlipped] = useState(false)

  const category = CATEGORIES[character.source.category]

  return (
    <div
      className="flip-card-container relative w-full max-w-sm mx-auto cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`flip-card-inner relative w-full ${flipped ? 'flipped' : ''}`}
      >
        {/* ===== FRONT FACE ===== */}
        <div
          className="flip-card-face relative w-full aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden shadow-xl"
        >
          {character.image_url ? (
            <img
              src={character.image_url}
              alt={character.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
              <span className="text-6xl">{category.icon}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Character info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="inline-block px-2 py-1 bg-zinc-800/80 rounded text-xs text-zinc-300 mb-2">
              {category.icon} {character.source.title}
            </span>
            <h2 className="text-2xl font-bold text-white">{character.name}</h2>
            <p className="text-zinc-400 text-sm mt-2 flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-zinc-500 rounded-full" />
              Tap to reveal archetypes
            </p>
          </div>
        </div>

        {/* ===== BACK FACE ===== */}
        <div
          className="flip-card-face flip-card-back absolute inset-0 w-full aspect-[3/4] bg-zinc-900 rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {/* Header */}
            <div className="text-center border-b border-zinc-800 pb-4">
              <span className="text-3xl mb-2 block">{category.icon}</span>
              <h2 className="text-xl font-bold text-white">{character.name}</h2>
              <p className="text-zinc-500 text-xs mt-1">{character.source.title}</p>
            </div>

            {/* Archetypes */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Archetypes
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.archetypes.map((archetype) => {
                  const key = archetype.toLowerCase().replace(' ', '_') as ArchetypeKey
                  const data = ARCHETYPES[key]
                  const colorClass = colorClasses[data?.color || 'zinc'] || colorClasses.zinc

                  return (
                    <span
                      key={archetype}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}
                    >
                      {archetype}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Virtues */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Pillar Virtues
              </h3>
              <div className="flex flex-wrap gap-2">
                {character.virtues.map((virtue) => (
                  <span
                    key={virtue}
                    className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm"
                  >
                    {virtue}
                  </span>
                ))}
              </div>
            </div>

            {/* Arc Description */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Character Arc
              </h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {character.arc_description}
              </p>
            </div>

            {/* Key Moments */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Key Moments
              </h3>
              <ul className="space-y-2">
                {character.key_moments.map((moment, i) => (
                  <li key={i} className="text-sm">
                    <span className="text-white font-medium">{moment.title}:</span>{' '}
                    <span className="text-zinc-400">{moment.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tap hint */}
            <p className="text-center text-zinc-600 text-xs pt-2">
              Tap to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
