'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import RoleSwitcher from '@/components/RoleSwitcher'

function GamePageContent() {
  const searchParams = useSearchParams()
  const [gameId, setGameId] = useState<string>('')

  useEffect(() => {
    // Get game ID from query parameter
    const id = searchParams?.get('id')
    if (id) {
      setGameId(id)
    } else if (typeof window !== 'undefined') {
      // Fallback: try to get from URL
      const url = new URL(window.location.href)
      const idFromUrl = url.searchParams.get('id')
      if (idFromUrl) {
        setGameId(idFromUrl)
      }
    }
  }, [searchParams])

  if (!gameId) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center max-w-md px-4">
          <p className="mb-2 text-lg">No game ID found</p>
          <p className="text-sm text-gray-400 mb-4">
            Please create or join a game from the home page.
          </p>
          <button
            onClick={() => window.location.href = '/join'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
          >
            Go to Join Page
          </button>
        </div>
      </div>
    )
  }

  return <RoleSwitcher gameId={gameId} />
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white">
        <p>Loading...</p>
      </div>
    }>
      <GamePageContent />
    </Suspense>
  )
}
