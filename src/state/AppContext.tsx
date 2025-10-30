import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { nanoid } from '../utils/nanoid'
import { AppData, Game, GameModes, Scores, Teams } from '../types'
import { loadAppData, saveAppData } from '../services/storage'

type AppContextValue = {
  data: AppData
  currentUser?: string
  setCurrentUser: (name: string) => void
  createGame: (name: string, modes?: Partial<GameModes>) => string
  updateGame: (game: Game) => void
  getGame: (id: string) => Game | undefined
  removeGame: (id: string) => void
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadAppData())
  const [currentUser, setCurrentUserState] = useState<string | undefined>(data.lastUser)

  // Auto-save on changes
  useEffect(() => {
    saveAppData({ ...data, lastUser: currentUser })
  }, [data, currentUser])

  const setCurrentUser = (name: string) => {
    setCurrentUserState(name)
    setData(prev => ({
      ...prev,
      users: prev.users.includes(name) ? prev.users : [...prev.users, name],
    }))
  }

  const createGame = (name: string, modes: Partial<GameModes> = {}): string => {
    const id = nanoid()
    const newGame: Game = {
      id,
      name,
      modes: {
        priceIsRight: modes.priceIsRight ?? [],
        familyFeud: modes.familyFeud ?? [],
        jeopardy: modes.jeopardy ?? [],
      },
      teams: { teamA: 'Team A', teamB: 'Team B' },
      scores: { teamA: 0, teamB: 0 },
      progress: { currentMode: null, round: 1 },
    }
    setData(prev => ({ ...prev, games: [newGame, ...prev.games] }))
    return id
  }

  const updateGame = (game: Game) => {
    setData(prev => ({
      ...prev,
      games: prev.games.map(g => (g.id === game.id ? game : g)),
    }))
  }

  const getGame = (id: string) => data.games.find(g => g.id === id)

  const removeGame = (id: string) => {
    setData(prev => ({ ...prev, games: prev.games.filter(g => g.id !== id) }))
  }

  const value = useMemo<AppContextValue>(() => ({
    data,
    currentUser,
    setCurrentUser,
    createGame,
    updateGame,
    getGame,
    removeGame,
  }), [data, currentUser])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}


