'use client'

import { useEffect, useState } from 'react'
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Game, Curse, Question } from '@/types/game'
import Map, { Marker } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SeekerInterfaceProps {
  game: Game
}

export default function SeekerInterface({ game }: SeekerInterfaceProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [activeCurse, setActiveCurse] = useState<Curse | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [mapboxToken] = useState(process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '')
  const [showHiderLocation, setShowHiderLocation] = useState(false)
  const [currentGame, setCurrentGame] = useState<Game>(game)
  const [mapError, setMapError] = useState<string | null>(null)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    const gameRef = doc(db, 'games', game.id)
    const unsubscribe = onSnapshot(gameRef, (snapshot) => {
      if (!snapshot.exists()) return
      const gameData = { id: snapshot.id, ...snapshot.data() } as Game
      setCurrentGame(gameData)
      
      const curses = gameData.activeCurses || []
      if (curses.length > 0) {
        setActiveCurse(curses[curses.length - 1])
      } else {
        setActiveCurse(null)
      }

      if (gameData.pendingQuestion) {
        const questionType = gameData.pendingQuestion.question?.type
        if (questionType === 'ping' || questionType === 'radar') {
          setShowHiderLocation(true)
          setTimeout(() => {
            setShowHiderLocation(false)
          }, 10000)
        }
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
          updateSeekerLocation(loc)
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
          updateSeekerLocation(loc)
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true }
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  useEffect(() => {
    loadQuestions()
  }, [])

  const updateSeekerLocation = async (loc: { lat: number; lng: number }) => {
    try {
      const userId = auth.currentUser?.uid
      if (!userId) return

      const gameRef = doc(db, 'games', game.id)
      await updateDoc(gameRef, {
        [`seekerLocations.${userId}`]: loc,
      })
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }

  const loadQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions')
      const snapshot = await getDocs(questionsRef)
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[]
      setQuestions(questionsData)
    } catch (error) {
      console.error('Error loading questions:', error)
    }
  }

  const getCategories = () => {
    const categories = new Set(questions.map((q) => q.category))
    return Array.from(categories)
  }

  const sendQuestionRequest = async (category: string) => {
    try {
      const categoryQuestions = questions.filter((q) => q.category === category)
      if (categoryQuestions.length === 0) return

      const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)]
      
      const gameRef = doc(db, 'games', game.id)
      await updateDoc(gameRef, {
        pendingQuestion: {
          category,
          question: randomQuestion,
          timestamp: new Date(),
        },
      })

      setSelectedCategory(null)
    } catch (error) {
      console.error('Error sending question request:', error)
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

  return (
    <div className="h-dvh w-screen relative">
      <Map
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          longitude: location.lng,
          latitude: location.lat,
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
        <Marker longitude={location.lng} latitude={location.lat}>
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
        </Marker>
        {showHiderLocation && currentGame.hiderLocation && (
          <Marker
            longitude={currentGame.hiderLocation.lng}
            latitude={currentGame.hiderLocation.lat}
          >
            <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-yellow-400 shadow-2xl animate-pulse"></div>
          </Marker>
        )}
      </Map>

      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white p-4 rounded-t-2xl shadow-2xl max-h-[50vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Questions</h3>
        <div className="grid grid-cols-2 gap-2">
          {getCategories().map((category) => (
            <button
              key={category}
              onClick={() => sendQuestionRequest(category)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeCurse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-90 z-30 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="bg-gray-900 text-white p-8 rounded-2xl max-w-md mx-4 text-center"
            >
              <h2 className="text-3xl font-bold mb-4 text-red-500">{activeCurse.name}</h2>
              <p className="text-lg mb-4">{activeCurse.description}</p>
              <p className="text-sm text-gray-400">
                Duration: {activeCurse.duration} {activeCurse.duration === 1 ? 'minute' : 'minutes'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
