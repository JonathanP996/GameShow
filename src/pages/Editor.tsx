import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useApp } from '../state/AppContext'
import { JeopardyQuestion } from '../types'
import { nanoid } from '../utils/nanoid'

export default function Editor() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { getGame, updateGame } = useApp()
  const game = useMemo(() => gameId ? getGame(gameId) : undefined, [gameId, getGame])

  if (!game) return null

  const saveJep = (q: JeopardyQuestion) => {
    const existing = game.modes.jeopardy.findIndex(j => j.categoryIndex === q.categoryIndex && j.rowIndex === q.rowIndex)
    if (existing >= 0) {
      updateGame({ ...game, modes: { ...game.modes, jeopardy: game.modes.jeopardy.map((j, idx) => idx === existing ? q : j) } })
    } else {
      updateGame({ ...game, modes: { ...game.modes, jeopardy: [...game.modes.jeopardy, q] } })
    }
  }
  const removeJep = (id: string) => {
    updateGame({ ...game, modes: { ...game.modes, jeopardy: game.modes.jeopardy.filter(i => i.id !== id) } })
  }
  const updateCategories = (categories: string[]) => {
    updateGame({ ...game, modes: { ...game.modes, jeopardyCategories: categories } })
  }

  return (
    <div className="min-h-full">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
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
            <h1 className="text-xl font-semibold">Edit: {game.name}</h1>
          </div>
          <Link 
            to={`/play/${game.id}`} 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Play Now
          </Link>
        </div>

        <div className="bg-white rounded border p-4">
          <h3 className="font-semibold mb-2">Game Settings</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <span>Question Timer (seconds):</span>
              <input
                type="number"
                min="0"
                max="300"
                value={game.questionTimerSeconds ?? 30}
                onChange={(e) => {
                  const seconds = parseInt(e.target.value) || 0
                  updateGame({ ...game, questionTimerSeconds: seconds })
                }}
                className="border rounded px-2 py-1 w-20"
              />
            </label>
            <span className="text-sm text-slate-600">(0 = no timer)</span>
          </div>
        </div>

        <div className="bg-white rounded border">
          <div className="p-4">
            <JepSection onAdd={saveJep} onRemove={removeJep} questions={game.modes.jeopardy} categories={game.modes.jeopardyCategories || ['', '', '', '', '', '']} onCategoriesUpdate={updateCategories} />
          </div>
        </div>
      </div>
    </div>
  )
}

function JepSection({ questions, onAdd, onRemove, categories, onCategoriesUpdate }: { questions: JeopardyQuestion[], onAdd: (q: JeopardyQuestion)=>void, onRemove:(id:string)=>void, categories: string[], onCategoriesUpdate: (cats: string[])=>void }) {
  const [editingCard, setEditingCard] = useState<{categoryIndex: number, rowIndex: number} | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const points = [200, 400, 600, 800, 1000]
  const categoryColors = ['bg-green-300', 'bg-purple-300', 'bg-orange-300', 'bg-blue-300', 'bg-amber-300', 'bg-yellow-300']
  const cardColors = ['bg-green-100', 'bg-purple-100', 'bg-orange-100', 'bg-blue-100', 'bg-amber-100', 'bg-yellow-100']

  const getQuestion = (catIdx: number, rowIdx: number) => {
    return questions.find(q => q.categoryIndex === catIdx && q.rowIndex === rowIdx)
  }

  const saveQuestion = () => {
    if (!editingCard || !editQuestion || !editAnswer) return
    const existing = getQuestion(editingCard.categoryIndex, editingCard.rowIndex)
    if (existing) {
      onRemove(existing.id)
    }
    onAdd({
      id: nanoid(),
      category: categories[editingCard.categoryIndex] || `Category ${editingCard.categoryIndex + 1}`,
      question: editQuestion,
      answer: editAnswer,
      points: points[editingCard.rowIndex],
      categoryIndex: editingCard.categoryIndex,
      rowIndex: editingCard.rowIndex,
    })
    setEditingCard(null)
    setEditQuestion('')
    setEditAnswer('')
  }

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-lg border-4 border-black">
        <div className="grid grid-cols-6 gap-2">
          {/* Category row */}
          {categories.map((cat, idx) => (
            <input
              key={idx}
              className={`${categoryColors[idx]} border-2 border-black rounded px-2 py-3 text-center font-bold text-sm`}
              placeholder={`Category ${idx + 1}`}
              value={cat}
              onChange={(e) => {
                const updated = [...categories]
                updated[idx] = e.target.value
                onCategoriesUpdate(updated)
              }}
            />
          ))}
          
          {/* Question cards */}
          {points.map((point, rowIdx) => (
            categories.map((_, catIdx) => {
              const q = getQuestion(catIdx, rowIdx)
              return (
                <button
                  key={`${catIdx}-${rowIdx}`}
                  className={`${cardColors[catIdx]} border-2 border-black rounded px-2 py-6 text-center font-bold text-xl hover:opacity-80 transition cursor-pointer`}
                  onClick={() => {
                    const existing = getQuestion(catIdx, rowIdx)
                    setEditingCard({ categoryIndex: catIdx, rowIndex: rowIdx })
                    setEditQuestion(existing?.question || '')
                    setEditAnswer(existing?.answer || '')
                  }}
                >
                  {q ? '✓' : `$${point.toLocaleString()}`}
                </button>
              )
            })
          ))}
        </div>
      </div>

      {/* Edit modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full space-y-4">
            <h3 className="text-lg font-semibold">
              Edit: {categories[editingCard.categoryIndex] || `Category ${editingCard.categoryIndex + 1}`} — ${points[editingCard.rowIndex].toLocaleString()}
            </h3>
            <div className="space-y-3">
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Question"
                value={editQuestion}
                onChange={e => setEditQuestion(e.target.value)}
              />
              <input
                className="w-full border rounded px-3 py-2"
                placeholder="Answer"
                value={editAnswer}
                onChange={e => setEditAnswer(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={saveQuestion} className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              <button onClick={() => {
                const existing = getQuestion(editingCard.categoryIndex, editingCard.rowIndex)
                if (existing) {
                  if (window.confirm('Delete this clue permanently?')) {
                    onRemove(existing.id)
                    setEditingCard(null)
                  }
                } else {
                  setEditingCard(null)
                }
              }} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              <button onClick={() => setEditingCard(null)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


