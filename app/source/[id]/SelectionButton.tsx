'use client'

import { useTransition, useState } from 'react'
import { addToSelectionAction, removeFromSelectionAction } from './actions'

interface SelectionButtonProps {
  sourceId: string
  isInSelection: boolean
}

export function SelectionButton({ sourceId, isInSelection: initialIsInSelection }: SelectionButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isInSelection, setIsInSelection] = useState(initialIsInSelection)

  const handleClick = () => {
    startTransition(async () => {
      if (isInSelection) {
        await removeFromSelectionAction(sourceId)
        setIsInSelection(false)
      } else {
        await addToSelectionAction(sourceId)
        setIsInSelection(true)
      }
    })
  }

  if (isInSelection) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="w-full bg-zinc-700 hover:bg-zinc-600 disabled:bg-zinc-800 text-white font-medium py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? (
          'Removing...'
        ) : (
          <>
            <span className="text-green-400">✓</span>
            In My Deck · Tap to Remove
          </>
        )}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white font-medium py-4 rounded-xl transition-colors"
    >
      {isPending ? 'Adding...' : 'Add to My Deck'}
    </button>
  )
}
