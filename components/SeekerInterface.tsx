'use client'

import { useEffect, useState, useRef } from 'react'
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, getDoc } from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { Game, Curse, Question, ChatMessage } from '@/types/game'
import Map, { Marker } from 'react-map-gl'
import { MapPin, X, MessageSquare, HelpCircle } from 'lucide-react'
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
  const [questionsLoading, setQuestionsLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [questionsDrawerOpen, setQuestionsDrawerOpen] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!db) return
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
        if (questionType === 'radar') {
          setShowHiderLocation(true)
          setTimeout(() => {
            setShowHiderLocation(false)
          }, 10000)
        }
      }
    })

    return () => unsubscribe()
  }, [game.id])

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatOpen && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentGame.chatMessages, chatOpen])

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
    if (!db || !auth) return
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
    if (!db) {
      console.error('Firebase db is not initialized')
      setQuestionsLoading(false)
      return
    }
    try {
      console.log('Loading questions from Firestore...')
      const questionsRef = collection(db, 'questions')
      const snapshot = await getDocs(questionsRef)
      const questionsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Question[]
      console.log(`Loaded ${questionsData.length} questions`)
      console.log('Questions:', questionsData)
      setQuestions(questionsData)
      setQuestionsLoading(false)
    } catch (error) {
      console.error('Error loading questions:', error)
      setQuestionsLoading(false)
    }
  }

  const getCategories = () => {
    const categories = new Set(questions.map((q) => q.category))
    return Array.from(categories)
  }

  const sendQuestionRequest = async (category: string) => {
    if (!db) {
      console.error('Firebase db is not initialized')
      return
    }
    try {
      // Check if there's already a pending question
      const gameRef = doc(db, 'games', game.id)
      const gameSnapshot = await getDoc(gameRef)
      const currentGame = { id: gameSnapshot.id, ...gameSnapshot.data() } as Game
      
      if (currentGame.pendingQuestion) {
        alert('Please wait for the current question to be answered before asking another one.')
        return
      }
      
      console.log('Sending question request for category:', category)
      console.log('Available questions:', questions.length)
      
      const categoryQuestions = questions.filter((q) => q.category === category)
      console.log('Category questions:', categoryQuestions.length)
      
      if (categoryQuestions.length === 0) {
        console.warn(`No questions found for category: ${category}`)
        alert(`No questions available in the ${category} category. Please seed questions.`)
        return
      }

      const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)]
      console.log('Selected question:', randomQuestion)
      
      // Create chat message for the question
      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'question',
        content: randomQuestion.question,
        question: randomQuestion.question,
        category: category,
        timestamp: new Date(),
        sender: 'seeker',
      }

      const currentMessages = currentGame.chatMessages || []
      const updatedMessages = [...currentMessages, chatMessage]

      await updateDoc(gameRef, {
        pendingQuestion: {
          category,
          question: randomQuestion,
          timestamp: new Date(),
        },
        chatMessages: updatedMessages,
      })

      console.log('Question sent successfully')
      setSelectedCategory(null)
    } catch (error) {
      console.error('Error sending question request:', error)
      alert('Failed to send question. Check console for details.')
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
        dragRotate={false}
        dragPan={true}
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

      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors relative"
          >
            <MessageSquare className="w-6 h-6" />
            {currentGame.chatMessages && currentGame.chatMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {currentGame.chatMessages.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setQuestionsDrawerOpen(!questionsDrawerOpen)}
            className="bg-gray-900 text-white p-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
          >
            <HelpCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 justify-center">
          <span className="text-sm text-gray-400">Game Code:</span>
          <span className="text-xl font-bold text-blue-400">{currentGame.code}</span>
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-16 left-4 bottom-20 w-80 bg-gray-900 text-white z-20 shadow-2xl rounded-lg overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">Chat</h3>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentGame.chatMessages && currentGame.chatMessages.length > 0 ? (
                <>
                  {currentGame.chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-lg ${
                      message.type === 'question'
                        ? 'bg-blue-900/50 border border-blue-700'
                        : message.type === 'answer'
                        ? 'bg-green-900/50 border border-green-700'
                        : message.type === 'photo'
                        ? 'bg-yellow-900/50 border border-yellow-700'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-400">
                        {message.sender === 'hider' ? 'Hider' : 'Seeker'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {message.timestamp?.toDate
                          ? new Date(message.timestamp.toDate()).toLocaleTimeString()
                          : new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {message.type === 'question' && (
                      <div>
                        <p className="text-xs text-blue-300 mb-1">{message.category}</p>
                        <p className="text-sm font-medium">{message.question}</p>
                      </div>
                    )}
                    {message.type === 'answer' && (
                      <div>
                        <p className="text-xs text-gray-400 mb-1 line-through">{message.question}</p>
                        <p className="text-sm font-medium">
                          {message.content.includes('Correct') ? (
                            <span className="text-green-400">{message.content}</span>
                          ) : (
                            <span className="text-red-400">{message.content}</span>
                          )}
                        </p>
                        {message.photoUrl && (
                          <div className="mt-2">
                            <img 
                              src={message.photoUrl} 
                              alt="Answer photo" 
                              className="w-full rounded-lg max-h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {message.type === 'photo' && (
                      <div>
                        <p className="text-xs text-yellow-300 mb-1">Photo Question: {message.question}</p>
                        {message.photoUrl ? (
                          <div className="mt-2">
                            <img 
                              src={message.photoUrl} 
                              alt="Hider's photo" 
                              className="w-full rounded-lg max-h-64 object-cover"
                            />
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Photo pending...</p>
                        )}
                      </div>
                    )}
                  </div>
                  ))}
                  <div ref={chatEndRef} />
                </>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No messages yet</p>
                  <p className="text-sm mt-2">Questions and answers will appear here</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {questionsDrawerOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 right-0 h-full w-80 bg-gray-900 text-white z-20 shadow-2xl overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Questions</h2>
                <button
                  onClick={() => setQuestionsDrawerOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {questionsLoading ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Loading questions...</p>
                </div>
              ) : getCategories().length === 0 ? (
                <div className="text-center py-8 space-y-4">
                  <p className="text-gray-400">No questions available</p>
                  <p className="text-sm text-gray-500">
                    Questions need to be seeded into Firestore.
                  </p>
                  <a
                    href="/admin/seed"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Go to Seed Page
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {getCategories().map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        sendQuestionRequest(category)
                        setQuestionsDrawerOpen(false)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors text-left"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
