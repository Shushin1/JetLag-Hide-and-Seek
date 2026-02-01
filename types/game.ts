export interface Game {
  id: string
  code: string
  createdAt: any
  hider: string | null
  seekers: string[]
  status: 'waiting' | 'active' | 'hidingPeriod' | 'ended' | 'endGame'
  totalHidingTime: number
  activeCurses: Curse[]
  coins: number
  hiderLocation: {
    lat: number
    lng: number
  } | null
  seekerLocations: {
    [userId: string]: {
      lat: number
      lng: number
    }
  }
  pendingQuestion?: {
    category: string
    question: Question
    timestamp: any
    expiresAt?: any
  } | null
  gameSize?: 'small' | 'medium' | 'large'
  hidingPeriodEndsAt?: any
  hidingZoneRadius?: number // in meters
  chatMessages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  type: 'question' | 'answer' | 'system' | 'photo'
  content: string
  question?: string
  category?: string
  timestamp: any
  sender?: 'hider' | 'seeker'
  photoUrl?: string
}

export interface Curse {
  id: string
  name: string
  description: string
  duration: number
  timestamp: any
}

export interface Card {
  id: string
  type: 'timeBonus' | 'curse' | 'powerup'
  name: string
  description: string
  value?: number
  effect?: string
}

export interface Question {
  id: string
  category: 'Matching' | 'Measuring' | 'Radar' | 'Thermometer' | 'Photo' | 'Tentacle'
  question: string
  answer: string
  type: 'matching' | 'measuring' | 'radar' | 'thermometer' | 'photo' | 'tentacle'
  drawCards?: number // number of cards to draw
  keepCards?: number // number of cards to keep
  timeLimit?: number // time limit in seconds (300 for normal, 600-1200 for photos)
}
