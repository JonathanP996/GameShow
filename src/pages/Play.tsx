import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Scoreboard from '../components/Scoreboard'
import { useApp } from '../state/AppContext'
import { JeopardyQuestion } from '../types'

export default function Play() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { updateGameAndMarkUsed, updateGame, data } = useApp()
  // Get game directly from data.games - this ensures component re-renders when data changes
  const game = gameId ? data.games.find(g => g.id === gameId) : undefined
  const [editingTeams, setEditingTeams] = useState(false)
  const [teamAName, setTeamAName] = useState(game?.teams.teamA || 'Team A')
  const [teamBName, setTeamBName] = useState(game?.teams.teamB || 'Team B')
  
  // Update local state when game changes
  useEffect(() => {
    if (game) {
      setTeamAName(game.teams.teamA)
      setTeamBName(game.teams.teamB)
    }
  }, [game?.teams.teamA, game?.teams.teamB])
  
  if (!game) return null

  const saveTeamNames = () => {
    if (!gameId) return
    const currentGame = data.games.find(g => g.id === gameId)
    if (currentGame) {
      updateGame({
        ...currentGame,
        teams: { teamA: teamAName, teamB: teamBName }
      })
    }
    setEditingTeams(false)
  }

  return (
    <div className="min-h-full bg-slate-50">
      <TopBar />
      <div className="max-w-7xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 rounded-lg border hover:bg-slate-100 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold">{game.name}</h1>
          </div>
          <div className="flex items-center gap-4">
            {editingTeams ? (
              <div className="flex items-center gap-2 bg-white rounded-lg border p-2">
                <input
                  type="text"
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm w-32"
                  placeholder="Team A"
                />
                <span className="text-slate-500">vs</span>
                <input
                  type="text"
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="px-2 py-1 border rounded text-sm w-32"
                  placeholder="Team B"
                />
                <button
                  onClick={saveTeamNames}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingTeams(false)
                    setTeamAName(game.teams.teamA)
                    setTeamBName(game.teams.teamB)
                  }}
                  className="px-3 py-1 border rounded text-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <Scoreboard key={`${game.teams.teamA}-${game.teams.teamB}-${game.scores.teamA}-${game.scores.teamB}`} scores={game.scores} teamA={game.teams.teamA} teamB={game.teams.teamB} />
                <button
                  onClick={() => setEditingTeams(true)}
                  className="px-4 py-2 rounded-lg border hover:bg-slate-100 transition text-sm"
                  title="Edit Team Names"
                >
                  ✏️ Edit Teams
                </button>
              </>
            )}
            <Link 
              to={`/editor/${gameId}`}
              className="px-4 py-2 rounded-lg border hover:bg-slate-100 transition"
            >
              Edit Game
            </Link>
          </div>
        </div>

        <JepPlay 
          questions={game.modes.jeopardy} 
          categories={game.modes.jeopardyCategories || ['', '', '', '', '', '']} 
          scores={[game.scores.teamA, game.scores.teamB]} 
          onScores={(a,b,questionId)=>{
            if (!gameId) return
            updateGameAndMarkUsed(gameId, { teamA: a, teamB: b }, questionId)
          }} 
        />

        {game.modes.jeopardy.filter(q=>!q.used).length === 0 && (
          <div className="p-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg text-center">
            <div className="text-3xl font-bold">🏆 {game.scores.teamA > game.scores.teamB ? game.teams.teamA : game.scores.teamB > game.scores.teamA ? game.teams.teamB : 'Tie Game!'} Wins!</div>
            {game.scores.teamA === game.scores.teamB && <div className="text-xl mt-2">Both teams scored {game.scores.teamA} points!</div>}
          </div>
        )}
      </div>
    </div>
  )
}

function JepPlay({ questions, categories, scores, onScores }: { questions: JeopardyQuestion[], categories: string[], scores:[number,number], onScores:(a:number,b:number,questionId:string)=>void }) {
  // Force component to use latest scores by using them directly
  const [selected, setSelected] = useState<JeopardyQuestion | null>(null)
  const [revealed, setRevealed] = useState(false)
  const points = [200, 400, 600, 800, 1000]

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

  const wrongAnswer = () => {
    if (!selected) return
    // Mark question as used without awarding points
    onScores(scores[0], scores[1], selected.id)
    setSelected(null)
    setRevealed(false)
  }

  return (
    <div className="space-y-4">
      {/* If no selection, show the board */}
      {!selected && (
        <div className="bg-black p-2">
          <div className="grid grid-cols-6 gap-1">
            {/* Category row */}
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-[#060CE9] border border-black px-2 py-4 text-center font-bold text-yellow-400 text-sm leading-tight flex items-center justify-center min-h-[80px]"
                style={{ fontFamily: 'sans-serif' }}
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
                    className={`bg-[#060CE9] border border-black px-2 py-8 text-center font-bold text-yellow-400 text-xl transition min-h-[100px] flex items-center justify-center ${
                      !q ? 'opacity-30 cursor-not-allowed' : isUsed ? 'opacity-20 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer hover:bg-[#0715E6]'
                    }`}
                    style={{ fontFamily: 'sans-serif' }}
                  >
                    {!q ? '' : isUsed ? '' : `$${point.toLocaleString()}`}
                  </button>
                )
              })
            ))}
          </div>
        </div>
      )}

      {/* If a question is selected, show the full-screen question view */}
      {selected && (
        <div className="min-h-[60vh] md:min-h-[70vh] flex flex-col justify-between rounded-lg border-2 border-yellow-400 bg-[#060CE9] text-yellow-400 p-6">
          <div className="space-y-6">
            <div className="text-sm font-semibold text-yellow-300 uppercase tracking-wide">
              {selected.category} — ${selected.points.toLocaleString()}
            </div>
            <div className="text-3xl md:text-5xl font-bold leading-tight text-center">
              {selected.question}
            </div>
            {revealed ? (
              <div className="text-yellow-300 text-2xl md:text-3xl font-semibold text-center">Answer: {selected.answer}</div>
            ) : (
              <div className="flex justify-center">
                <button 
                  onClick={() => setRevealed(true)} 
                  className="px-8 py-4 rounded-lg bg-yellow-400 text-black font-bold text-xl hover:bg-yellow-300 transition"
                >
                  Reveal Answer
                </button>
              </div>
            )}
          </div>

          {revealed && (
            <div className="space-y-3 pt-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => award(0)} 
                  className="flex-1 px-6 py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-700 transition"
                >
                  Award Team A (+${selected.points.toLocaleString()})
                </button>
                <button 
                  onClick={() => award(1)} 
                  className="flex-1 px-6 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition"
                >
                  Award Team B (+${selected.points.toLocaleString()})
                </button>
              </div>
              <button 
                onClick={wrongAnswer} 
                className="w-full px-6 py-4 rounded-lg bg-red-600 text-white font-bold text-lg hover:bg-red-700 transition"
              >
                Wrong Answer (No Points)
              </button>
            </div>
          )}

          <div className="pt-6 flex justify-center">
            <button onClick={() => { setSelected(null); setRevealed(false) }} className="px-6 py-3 rounded border border-yellow-400 text-yellow-300 hover:bg-[#0715E6]">
              Back to Board
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


