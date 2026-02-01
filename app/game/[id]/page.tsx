'use client'

import { useParams } from 'next/navigation'
import RoleSwitcher from '@/components/RoleSwitcher'

export default function GamePage() {
  const params = useParams()
  const gameId = params.id as string

  return <RoleSwitcher gameId={gameId} />
}
