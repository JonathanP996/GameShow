import { Scores } from '../types'

export default function Scoreboard({ scores, teamA, teamB }: { scores: Scores, teamA: string, teamB: string }) {
  return (
    <div className="flex items-center justify-center gap-6 text-center">
      <div className="bg-white rounded border px-4 py-2 min-w-40">
        <div className="text-sm uppercase font-bold text-slate-700">{teamA}</div>
        <div className="text-2xl font-bold text-[#060CE9]">{scores.teamA}</div>
      </div>
      <div className="bg-white rounded border px-4 py-2 min-w-40">
        <div className="text-sm uppercase font-bold text-slate-700">{teamB}</div>
        <div className="text-2xl font-bold text-[#060CE9]">{scores.teamB}</div>
      </div>
    </div>
  )
}


