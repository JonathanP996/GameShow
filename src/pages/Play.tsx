import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Scoreboard from '../components/Scoreboard'
import { useApp } from '../state/AppContext'
import { JeopardyQuestion, PriceIsRightItem } from '../types'

export default function Play() {
  const { gameId } = useParams()
  const { getGame, updateGame } = useApp()
  const game = useMemo(() => gameId ? getGame(gameId) : undefined, [gameId, getGame])
  const [mode, setMode] = useState<'pir'|'ff'|'jep'>(game?.progress.currentMode ? (game.progress.currentMode === 'priceIsRight' ? 'pir' : game.progress.currentMode === 'familyFeud' ? 'ff' : 'jep') : 'pir')
  if (!game) return null

  const setScores = (a: number, b: number) => {
    updateGame({ ...game, scores: { teamA: a, teamB: b }, progress: { ...game.progress, currentMode: mode === 'pir' ? 'priceIsRight' : mode === 'ff' ? 'familyFeud' : 'jeopardy' } })
  }

  return (
    <div className="min-h-full">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button className={`px-3 py-2 rounded border ${mode==='pir'?'bg-blue-50 border-blue-400':''}`} onClick={()=>setMode('pir')}>Price Is Right</button>
            <button className={`px-3 py-2 rounded border ${mode==='ff'?'bg-blue-50 border-blue-400':''}`} onClick={()=>setMode('ff')}>Family Feud</button>
            <button className={`px-3 py-2 rounded border ${mode==='jep'?'bg-blue-50 border-blue-400':''}`} onClick={()=>setMode('jep')}>Jeopardy</button>
          </div>
          <Scoreboard scores={game.scores} teamA={game.teams.teamA} teamB={game.teams.teamB} />
        </div>

        {mode==='pir' && <PIRPlay items={game.modes.priceIsRight} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b)=>setScores(a,b)} />}
        {mode==='ff' && <FFPlay questions={game.modes.familyFeud} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b)=>setScores(a,b)} />}
        {mode==='jep' && <JepPlay questions={game.modes.jeopardy} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b)=>setScores(a,b)} onUse={(id)=>{
          const updated = game.modes.jeopardy.map(q => q.id===id?{...q, used:true}:q)
          updateGame({ ...game, modes: { ...game.modes, jeopardy: updated } })
        }} />}

        {game.scores.teamA !== game.scores.teamB && (game.modes.priceIsRight.length + game.modes.familyFeud.length + game.modes.jeopardy.filter(q=>!q.used).length) === 0 && (
          <div className="p-4 bg-yellow-50 border rounded">
            <div className="text-xl">🏆 {game.scores.teamA > game.scores.teamB ? game.teams.teamA : game.teams.teamB} Wins!</div>
          </div>
        )}
      </div>
    </div>
  )
}

function PIRPlay({ items, scores, onScores }: { items: PriceIsRightItem[], scores: [number, number], onScores: (a:number,b:number)=>void }) {
  const [idx, setIdx] = useState(0)
  const [guessA, setGuessA] = useState<number | ''>('')
  const [guessB, setGuessB] = useState<number | ''>('')
  const [revealed, setRevealed] = useState(false)
  const current = items[idx]
  if (!current) return <div className="text-slate-600">No items added. Add some in the editor.</div>
  const award = () => {
    if (guessA===''
      || guessB==='') return
    const da = Math.abs(Number(guessA) - current.price)
    const db = Math.abs(Number(guessB) - current.price)
    const next = [...scores] as [number, number]
    if (da < db) next[0] += 1; else if (db < da) next[1] += 1
    onScores(next[0], next[1])
  }
  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <div className="text-lg font-medium">Guess the price: {current.item}</div>
      <div className="flex gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs">Team A</label>
          <input className="border rounded px-3 py-2" type="number" value={guessA} onChange={e=>setGuessA(e.target.value?Number(e.target.value):'')} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs">Team B</label>
          <input className="border rounded px-3 py-2" type="number" value={guessB} onChange={e=>setGuessB(e.target.value?Number(e.target.value):'')} />
        </div>
        <button onClick={()=>{ setRevealed(true); award() }} className="px-3 py-2 rounded bg-blue-600 text-white">Reveal</button>
        <button onClick={()=>{ setIdx(i=>Math.min(i+1, items.length)); setRevealed(false); setGuessA(''); setGuessB('')}} className="px-3 py-2 rounded border">Next</button>
      </div>
      {revealed && <div className="text-green-700">Actual price: ${current.price}</div>}
    </div>
  )
}

function FFPlay({ questions, scores, onScores }: { questions: {question:string, answers:{answer:string, points:number}[]}[], scores: [number, number], onScores:(a:number,b:number)=>void }) {
  const [idx, setIdx] = useState(0)
  const [revealed, setRevealed] = useState<number[]>([])
  const current = questions[idx]
  if (!current) return <div className="text-slate-600">No Family Feud questions. Add some in the editor.</div>
  const toggle = (i: number) => {
    setRevealed(r => r.includes(i) ? r.filter(x=>x!==i) : [...r, i])
  }
  const total = revealed.reduce((acc, i)=> acc + current.answers[i].points, 0)
  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <div className="text-lg font-medium">{current.question}</div>
      <ul className="grid gap-2">
        {current.answers.map((a, i) => (
          <li key={i} className="border rounded px-3 py-2 cursor-pointer" onClick={()=>toggle(i)}>
            {revealed.includes(i) ? `${a.answer} — ${a.points}` : 'Reveal'}
          </li>
        ))}
      </ul>
      <div className="flex gap-2 items-center">
        <button onClick={()=>onScores(scores[0]+total, scores[1])} className="px-3 py-2 rounded border">Award to Team A (+{total})</button>
        <button onClick={()=>onScores(scores[0], scores[1]+total)} className="px-3 py-2 rounded border">Award to Team B (+{total})</button>
        <button onClick={()=>{ setIdx(i=>Math.min(i+1, questions.length)); setRevealed([]) }} className="px-3 py-2 rounded bg-blue-600 text-white">Next</button>
      </div>
    </div>
  )
}

function JepPlay({ questions, scores, onScores, onUse }: { questions: JeopardyQuestion[], scores:[number,number], onScores:(a:number,b:number)=>void, onUse:(id:string)=>void }) {
  const board = groupByCategory(questions)
  const [selected, setSelected] = useState<JeopardyQuestion | null>(null)
  const [revealed, setRevealed] = useState(false)
  const select = (q: JeopardyQuestion) => { if (q.used) return; setSelected(q); setRevealed(false) }
  const award = (team: 0 | 1) => { if (!selected) return; const next = [...scores] as [number, number]; next[team]+=selected.points; onScores(next[0], next[1]); onUse(selected.id); setSelected(null) }
  return (
    <div className="bg-white border rounded p-4 space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(board).map(([cat, qs]) => (
          <div key={cat} className="border rounded">
            <div className="px-2 py-1 font-medium bg-slate-50 border-b">{cat}</div>
            <div className="grid grid-cols-2 gap-2 p-2">
              {qs.map(q => (
                <button key={q.id} disabled={q.used} onClick={()=>select(q)} className={`px-2 py-2 rounded border ${q.used? 'opacity-40 cursor-not-allowed': ''}`}>{q.points}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="p-4 rounded border bg-slate-50 space-y-2">
          <div className="text-sm text-slate-600">{selected.category} — {selected.points}</div>
          <div className="text-lg font-medium">{selected.question}</div>
          {revealed ? (
            <div className="text-green-700">Answer: {selected.answer}</div>
          ) : (
            <button onClick={()=>setRevealed(true)} className="px-3 py-2 rounded bg-blue-600 text-white">Reveal Answer</button>
          )}
          <div className="flex gap-2">
            <button onClick={()=>award(0)} className="px-3 py-2 rounded border">Award Team A</button>
            <button onClick={()=>award(1)} className="px-3 py-2 rounded border">Award Team B</button>
          </div>
        </div>
      )}
    </div>
  )
}

function groupByCategory(questions: JeopardyQuestion[]) {
  return questions.reduce<Record<string, JeopardyQuestion[]>>((acc, q)=>{
    acc[q.category] = acc[q.category] || []
    acc[q.category].push(q)
    return acc
  }, {})
}


