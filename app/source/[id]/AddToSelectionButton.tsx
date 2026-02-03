'use client'

import { useTransition } from 'react'
import { addToSelectionAction } from './actions'

export function AddToSelectionButton({ sourceId }: { sourceId: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => addToSelectionAction(sourceId))}
      disabled={isPending}
      className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-700 text-white font-medium py-4 rounded-xl transition-colors"
    >
      {isPending ? 'Adding...' : 'Add to My Deck'}
    </button>
  )
}
