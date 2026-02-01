'use client'

import { useEffect, useState } from 'react'
import { doc, collection, getDocs, updateDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Game, Card, Curse } from '@/types/game'
import Map, { Marker, Source, Layer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Menu, Coins, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HiderInterfaceProps {
  game: Game
}

export default function HiderInterface({ game }: HiderInterfaceProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawnCard, setDrawnCard] = useState<Card | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [mapboxToken] = useState(process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '')
  const [pendingQuestion, setPendingQuestion] = useState<any>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const gameRef = doc(db, 'games', game.id)
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (!snapshot.exists()) return
      const gameData = snapshot.data()
      if (gameData.pendingQuestion) {
        setPendingQuestion(gameData.pendingQuestion)
      } else {
        setPendingQuestion(null)
      }
    })

    return () => unsubscribe()
  }, [game.id])

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(loc)
          updateHiderLocation(loc)
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      )

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(loc)
          updateHiderLocation(loc)
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  const updateHiderLocation = async (loc: { lat: number; lng: number }) => {
    try {
      const gameRef = doc(db, 'games', game.id)
      await updateDoc(gameRef, { hiderLocation: loc })
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const drawCard = async () => {
    try {
      const deckRef = collection(db, 'deck')
      const snapshot = await getDocs(deckRef)
      const cards = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Card[]

      if (cards.length === 0) {
        alert('No cards in deck')
        return
      }

      const randomCard = cards[Math.floor(Math.random() * cards.length)]
      setDrawnCard(randomCard)
    } catch (error) {
      console.error('Error drawing card:', error)
    }
  }

  const playCard = async () => {
    if (!drawnCard) return

    try {
      const gameRef = doc(db, 'games', game.id)
      const gameSnapshot = await getDoc(gameRef)
      const currentGame = { id: gameSnapshot.id, ...gameSnapshot.data() } as Game

      if (drawnCard.type === 'timeBonus') {
        await updateDoc(gameRef, {
          totalHidingTime: (currentGame.totalHidingTime || 0) + (drawnCard.value || 0),
        })
      } else if (drawnCard.type === 'curse') {
        const newCurse: Curse = {
          id: Date.now().toString(),
          name: drawnCard.name,
          description: drawnCard.description,
          duration: drawnCard.value || 0,
          timestamp: new Date(),
        }
        await updateDoc(gameRef, {
          activeCurses: [...(currentGame.activeCurses || []), newCurse],
        })
      }

      setDrawnCard(null)
    } catch (error) {
      console.error('Error playing card:', error)
    }
  }

  const answerQuestion = async (correct: boolean) => {
    try {
      const gameRef = doc(db, 'games', game.id)
      const gameSnapshot = await getDoc(gameRef)
      const currentGame = { id: gameSnapshot.id, ...gameSnapshot.data() } as Game

      if (correct) {
        await updateDoc(gameRef, {
          coins: (currentGame.coins || 0) + 1,
          pendingQuestion: null,
        })
      } else {
        await updateDoc(gameRef, {
          pendingQuestion: null,
        })
      }

      setPendingQuestion(null)
    } catch (error) {
      console.error('Error answering question:', error)
    }
  }

  if (!mapboxToken) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center max-w-md">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Mapbox Token Missing</h2>
          <p className="text-gray-300 mb-4">
            Please add NEXT_PUBLIC_MAPBOX_TOKEN to your .env.local file
          </p>
          <p className="text-sm text-gray-400">
            Get your token from: https://account.mapbox.com/access-tokens/
          </p>
        </div>
      </div>
    )
  }

  if (!location) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Getting your location...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="h-dvh w-screen flex items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center max-w-md">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2">Map Error</h2>
          <p className="text-gray-300">{mapError}</p>
        </div>
      </div>
    )
  }

  const centerLat = location.lat
  const centerLng = location.lng

  return (
    <div className="h-dvh w-screen relative">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: centerLng,
          latitude: centerLat,
          zoom: 15,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v10"
        onLoad={() => setMapReady(true)}
        onError={(e) => {
          console.error('Map error:', e)
          setMapError('Failed to load map. Please check your Mapbox token.')
        }}
        reuseMaps
        interactive={mapReady}
      >
        <Marker longitude={centerLng} latitude={centerLat}>
          <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
        </Marker>
        <Source
          id="hiding-zone"
          type="geojson"
          data={{
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [centerLng, centerLat],
            },
          }}
        >
          <Layer
            id="hiding-zone-circle"
            type="circle"
            paint={{
              'circle-radius': 804.672,
              'circle-color': 'rgba(255, 0, 0, 0.1)',
              'circle-stroke-color': 'rgba(255, 0, 0, 0.5)',
              'circle-stroke-width': 2,
            }}
          />
        </Source>
      </Map>

      <button
        onClick={() => setDrawerOpen(true)}
        className="absolute top-4 left-4 bg-gray-900 text-white p-3 rounded-full shadow-lg z-10"
      >
        <Menu className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-80 bg-gray-900 text-white z-20 shadow-2xl overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                <Coins className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Coins</p>
                  <p className="text-2xl font-bold">{game.coins || 0}</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={drawCard}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Draw Card
                </button>

                {drawnCard && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-gray-800 p-4 rounded-lg border-2 border-blue-500"
                  >
                    <h3 className="font-bold text-lg mb-2">{drawnCard.name}</h3>
                    <p className="text-sm text-gray-300 mb-3">{drawnCard.description}</p>
                    <p className="text-xs text-gray-400 mb-3">
                      Type: {drawnCard.type === 'timeBonus' ? 'Time Bonus' : 'Curse'}
                    </p>
                    <button
                      onClick={playCard}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Play Card
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-400">Total Hiding Time</p>
                <p className="text-xl font-bold">{game.totalHidingTime || 0} seconds</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 text-white p-6 rounded-2xl max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-4">Question</h2>
              <p className="text-lg mb-6">{pendingQuestion.question?.question}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => answerQuestion(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Correct
                </button>
                <button
                  onClick={() => answerQuestion(false)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Wrong
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
