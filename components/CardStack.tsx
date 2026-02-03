'use client'

import React, { useState, useRef, useMemo } from 'react'
import TinderCard from 'react-tinder-card'
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
  const [currentIndex, setCurrentIndex] = useState(characters.length - 1)
  const currentIndexRef = useRef(currentIndex)

  const childRefs = useMemo(
    () => Array(characters.length).fill(0).map(() => React.createRef<any>()),
    [characters.length]
  )

  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val)
    currentIndexRef.current = val
  }

  const canSwipe = currentIndex >= 0

  const swiped = (direction: string, index: number) => {
    updateCurrentIndex(index - 1)
    if (index === 0 && onEmpty) {
      onEmpty()
    }
  }

  const swipe = async (dir: 'left' | 'right') => {
    if (canSwipe && currentIndex < characters.length) {
      await childRefs[currentIndex].current?.swipe(dir)
    }
  }

  return (
    <div className="relative h-[600px] w-full max-w-sm mx-auto">
      {/* Card stack */}
      <div className="absolute inset-0">
        {characters.map((character, index) => (
          <TinderCard
            ref={childRefs[index]}
            key={character.id}
            onSwipe={(dir) => swiped(dir, index)}
            preventSwipe={['up', 'down']}
            className="absolute w-full"
          >
            <CharacterCard character={character} />
          </TinderCard>
        ))}
      </div>

      {/* Swipe buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={() => swipe('left')}
          disabled={!canSwipe}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center disabled:opacity-50"
        >
          ←
        </button>
        <button
          onClick={() => swipe('right')}
          disabled={!canSwipe}
          className="w-14 h-14 rounded-full bg-zinc-800 text-white flex items-center justify-center disabled:opacity-50"
        >
          →
        </button>
      </div>

      {/* Empty state */}
      {!canSwipe && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-400 text-lg">No more characters!</p>
            <p className="text-zinc-500 text-sm mt-2">Add more sources to your selection</p>
          </div>
        </div>
      )}
    </div>
  )
}
