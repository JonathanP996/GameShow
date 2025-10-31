import { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Scoreboard from '../components/Scoreboard'
import { useApp } from '../state/AppContext'
import { JeopardyQuestion, PriceIsRightItem } from '../types'

export default function Play() {
  const { gameId } = useParams()
  const { getGame, updateGame, updateGameScores, updateGameAndMarkUsed, data } = useApp()
  // Get game directly from data.games - this ensures component re-renders when data changes
  const game = gameId ? data.games.find(g => g.id === gameId) : undefined
  const [mode, setMode] = useState<'pir'|'ff'|'jep'>(game?.progress.currentMode ? (game.progress.currentMode === 'priceIsRight' ? 'pir' : game.progress.currentMode === 'familyFeud' ? 'ff' : 'jep') : 'pir')
  
  if (!game) return null

  const setScores = (a: number, b: number) => {
    if (!gameId) return
    // Use dedicated function that directly updates scores without reading stale data
    updateGameScores(gameId, { teamA: a, teamB: b })
    // Also update progress separately
    const currentGame = data.games.find(g => g.id === gameId)
    if (currentGame) {
      updateGame({ ...currentGame, progress: { ...currentGame.progress, currentMode: mode === 'pir' ? 'priceIsRight' : mode === 'ff' ? 'familyFeud' : 'jeopardy' } })
    }
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
          <Scoreboard key={`${game.scores.teamA}-${game.scores.teamB}`} scores={game.scores} teamA={game.teams.teamA} teamB={game.teams.teamB} />
        </div>

        {mode==='pir' && <PIRPlay items={game.modes.priceIsRight} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b)=>setScores(a,b)} />}
        {mode==='ff' && <FFPlay questions={game.modes.familyFeud} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b)=>setScores(a,b)} />}
        {mode==='jep' && <JepPlay questions={game.modes.jeopardy} categories={game.modes.jeopardyCategories || ['', '', '', '', '', '']} scores={[game.scores.teamA, game.scores.teamB]} onScores={(a,b,questionId)=>{
          // Update scores and mark question as used in one atomic operation
          if (!gameId) return
          updateGameAndMarkUsed(gameId, { teamA: a, teamB: b }, questionId)
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

function JepPlay({ questions, categories, scores, onScores }: { questions: JeopardyQuestion[], categories: string[], scores:[number,number], onScores:(a:number,b:number,questionId:string)=>void }) {
  // Force component to use latest scores by using them directly
  const [selected, setSelected] = useState<JeopardyQuestion | null>(null)
  const [revealed, setRevealed] = useState(false)
  const points = [100, 200, 300, 400, 500]
  const categoryColors = ['bg-green-300', 'bg-purple-300', 'bg-orange-300', 'bg-blue-300', 'bg-amber-300', 'bg-yellow-300']
  const cardColors = ['bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-blue-100', 'bg-amber-100', 'bg-yellow-100']

  const getQuestion = (catIdx: number, rowIdx: number) => {
    return questions.find(q => q.categoryIndex === catIdx && q.rowIndex === rowIdx)
  }

  const select = (catIdx: number, rowIdx: number) => {
    const q = getQuestion(catIdx, rowIdx)
    if (!q || q.used) return
    setSelected(q)
    setRevealed(false)
  }

  const award = (team: 0 | 1) => {
    if (!selected) return
    // Calculate new scores based on current scores prop
    const newScoreA = team === 0 ? scores[0] + selected.points : scores[0]
    const newScoreB = team === 1 ? scores[1] + selected.points : scores[1]
    // Update scores and mark question as used in one call
    onScores(newScoreA, newScoreB, selected.id)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg border-4 border-black">
        <div className="grid grid-cols-6 gap-2">
          {/* Category row */}
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className={`${categoryColors[idx]} border-2 border-black rounded px-2 py-3 text-center font-bold text-sm`}
            >
              {cat || `Category ${idx + 1}`}
            </div>
          ))}
          
          {/* Question cards */}
          {points.map((point, rowIdx) => (
            categories.map((_, catIdx) => {
              const q = getQuestion(catIdx, rowIdx)
              const isUsed = q?.used || false
              return (
                <button
                  key={`${catIdx}-${rowIdx}`}
                  disabled={!q || isUsed}
                  onClick={() => select(catIdx, rowIdx)}
                  className={`${cardColors[catIdx]} border-2 border-black rounded px-2 py-6 text-center font-bold text-xl transition ${
                    !q ? 'opacity-50 cursor-not-allowed' : isUsed ? 'opacity-30 cursor-not-allowed line-through' : 'hover:opacity-80 cursor-pointer'
                  }`}
                >
                  {!q ? '' : isUsed ? 'X' : `$${point}`}
                </button>
              )
            })
          ))}
        </div>
      </div>

      {selected && (
        <div className="p-4 rounded-lg border-2 border-black bg-white space-y-4">
          <div className="text-sm text-slate-600 font-semibold">
            {selected.category} — ${selected.points}
          </div>
          <div className="text-2xl font-bold">{selected.question}</div>
          {revealed ? (
            <div className="text-green-700 text-xl font-semibold">Answer: {selected.answer}</div>
          ) : (
            <button 
              onClick={() => setRevealed(true)} 
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700"
            >
              Reveal Answer
            </button>
          )}
          {revealed && (
            <div className="flex gap-4 pt-4 border-t">
              <button 
                onClick={() => award(0)} 
                className="flex-1 px-6 py-3 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
              >
                Award Team A (+${selected.points})
              </button>
              <button 
                onClick={() => award(1)} 
                className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Award Team B (+${selected.points})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


