'use client'

import { useState } from 'react'
import { CharacterCard } from './CharacterCard'

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
    category: 'movie' | 'book' | 'history' | 'story' | 'current_event'
  }
}

interface CardStackProps {
  characters: Character[]
  onEmpty?: () => void
}

export function CardStack({ characters, onEmpty }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentCharacter = characters[currentIndex]
  const canGoNext = currentIndex < characters.length - 1
  const canGoPrev = currentIndex > 0

  const goNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1)
    } else if (onEmpty) {
      onEmpty()
    }
  }

  const goPrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (!currentCharacter) {
    return (
      <div className="relative h-[600px] w-full max-w-sm mx-auto flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 text-lg">No more characters!</p>
          <p className="text-zinc-500 text-sm mt-2">Add more sources to your selection</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full max-w-sm mx-auto">
      {/* Single card display */}
      <div className="absolute inset-0">
        <CharacterCard key={currentCharacter.id} character={currentCharacter} />
      </div>

      {/* Navigation buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center disabled:opacity-30 hover:bg-zinc-700 transition-colors"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors"
        >
          →
        </button>
      </div>
    </div>
  )
}
