import { Scores } from '../types'

export default function Scoreboard({ scores, teamA, teamB }: { scores: Scores, teamA: string, teamB: string }) {
  return (
    <div className="flex items-center justify-center gap-6 text-center">
      <div className="bg-white rounded border px-4 py-2 min-w-40">
        <div className="text-xs uppercase text-slate-500">{teamA}</div>
        <div className="text-2xl font-bold">{scores.teamA}</div>
      </div>
      <div className="bg-white rounded border px-4 py-2 min-w-40">
        <div className="text-xs uppercase text-slate-500">{teamB}</div>
        <div className="text-2xl font-bold">{scores.teamB}</div>
      </div>
    </div>
  )
}


