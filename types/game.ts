export interface Game {
  id: string
  code: string
  createdAt: any
  hider: string | null
  seekers: string[]
  status: 'waiting' | 'active' | 'ended'
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
  } | null
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
  type: 'timeBonus' | 'curse'
  name: string
  description: string
  value?: number
}

export interface Question {
  id: string
  category: string
  question: string
  answer: string
  type?: 'ping' | 'radar' | 'normal'
}
