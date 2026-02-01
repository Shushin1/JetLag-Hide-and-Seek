'use client'

import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { db, auth } from '@/lib/firebase'
import { Game } from '@/types/game'
import HiderInterface from './HiderInterface'
import SeekerInterface from './SeekerInterface'
import { Loader2 } from 'lucide-react'

interface RoleSwitcherProps {
  gameId: string
}

export default function RoleSwitcher({ gameId }: RoleSwitcherProps) {
  const [game, setGame] = useState<Game | null>(null)
  const [role, setRole] = useState<'hider' | 'seeker' | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const initializeAuth = async () => {
      if (!auth) {
        setAuthError('Firebase Authentication is not configured')
        setLoading(false)
        return
      }

      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth)
        }
        setAuthReady(true)
      } catch (error: any) {
        console.error('Auth error:', error)
        setAuthError(error.message || 'Failed to authenticate')
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const isSettingRoleRef = useRef(false)

  useEffect(() => {
    if (!gameId || !db || !auth || !authReady || authError) return

    const gameRef = doc(db, 'games', gameId)
    const unsubscribe = onSnapshot(gameRef, async (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false)
        return
      }

      if (!auth) {
        setLoading(false)
        return
      }

      const gameData = { id: snapshot.id, ...snapshot.data() } as Game
      setGame(gameData)

      const userId = auth.currentUser?.uid
      if (!userId) {
        console.log('No user ID available')
        setLoading(false)
        return
      }

      // If role is already set and matches, don't process again
      if (role) {
        if (gameData.hider === userId && role === 'hider') {
          setLoading(false)
          return
        }
        if (gameData.seekers && gameData.seekers.includes(userId) && role === 'seeker') {
          setLoading(false)
          return
        }
      }

      // Prevent multiple simultaneous role assignments
      if (isSettingRoleRef.current) {
        return
      }

      if (gameData.hider === userId) {
        setRole('hider')
        setLoading(false)
      } else if (gameData.seekers && gameData.seekers.includes(userId)) {
        setRole('seeker')
        setLoading(false)
      } else {
        // User is not assigned yet, assign them
        isSettingRoleRef.current = true
        try {
          if (!gameData.hider) {
            await updateDoc(gameRef, { 
              hider: userId,
              status: 'active',
            })
            setRole('hider')
          } else {
            const currentSeekers = gameData.seekers || []
            if (!currentSeekers.includes(userId)) {
              await updateDoc(gameRef, {
                seekers: [...currentSeekers, userId],
                status: 'active',
              })
            }
            setRole('seeker')
          }
          setLoading(false)
        } catch (error) {
          console.error('Error assigning role:', error)
          setLoading(false)
        } finally {
          isSettingRoleRef.current = false
        }
      }
    })

    return () => unsubscribe()
  }, [gameId, authReady, authError, role])

  if (authError) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-red-400">Authentication Error</h2>
          <p className="text-gray-300">{authError}</p>
          <p className="text-sm text-gray-400">
            Please check your Firebase configuration in .env.local and ensure Anonymous authentication is enabled.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !game || !role) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    )
  }

  if (role === 'hider') {
    return <HiderInterface game={game} />
  }

  return <SeekerInterface game={game} />
}
