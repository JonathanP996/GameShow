export type UUID = string

export type PriceIsRightItem = {
  id: UUID
  item: string
  price: number
}

export type FamilyFeudAnswer = {
  id: UUID
  answer: string
  points: number
}

export type FamilyFeudQuestion = {
  id: UUID
  question: string
  answers: FamilyFeudAnswer[]
}

export type JeopardyQuestion = {
  id: UUID
  category: string
  question: string
  answer: string
  points: number
  used?: boolean
  categoryIndex?: number // 0-5 for which column this belongs to
  rowIndex?: number // 0-4 for which row (100, 200, 300, 400, 500)
}

export type GameModes = {
  priceIsRight: PriceIsRightItem[]
  familyFeud: FamilyFeudQuestion[]
  jeopardy: JeopardyQuestion[]
  jeopardyCategories?: string[] // 6 category names for the grid
}

export type Teams = {
  teamA: string
  teamB: string
}

export type Scores = {
  teamA: number
  teamB: number
}

export type Progress = {
  currentMode: keyof GameModes | null
  round: number
}

export type Game = {
  id: UUID
  name: string
  modes: GameModes
  teams: Teams
  scores: Scores
  progress: Progress
}

export type AppData = {
  users: string[]
  games: Game[]
  lastUser?: string
}


