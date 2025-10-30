import { AppData } from '../types'

const STORAGE_KEY = 'gameshow.app.v1'

const defaultData: AppData = {
  users: [],
  games: [],
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData
    const parsed = JSON.parse(raw) as AppData
    return {
      users: parsed.users ?? [],
      games: parsed.games ?? [],
      lastUser: parsed.lastUser,
    }
  } catch {
    return defaultData
  }
}

export function saveAppData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}


