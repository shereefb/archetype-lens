'use client'

import { useEffect, useCallback } from 'react'

interface WebViewModalProps {
  url: string
  title: string
  onClose: () => void
}

export function WebViewModal({ url, title, onClose }: WebViewModalProps) {
  // Close on escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex flex-col"
      onClick={onClose}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-medium truncate flex-1 mr-4">{title}</h2>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Iframe container */}
      <div
        className="flex-1 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  )
}
