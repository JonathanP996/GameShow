import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useApp } from '../state/AppContext'
import { FamilyFeudAnswer, FamilyFeudQuestion, JeopardyQuestion, PriceIsRightItem } from '../types'
import { nanoid } from '../utils/nanoid'

export default function Editor() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const { getGame, updateGame } = useApp()
  const game = useMemo(() => gameId ? getGame(gameId) : undefined, [gameId, getGame])

  const [tab, setTab] = useState<'pir' | 'ff' | 'jep'>('pir')
  if (!game) return null

  const savePIR = (item: PriceIsRightItem) => {
    updateGame({ ...game, modes: { ...game.modes, priceIsRight: [item, ...game.modes.priceIsRight] } })
  }
  const removePIR = (id: string) => {
    updateGame({ ...game, modes: { ...game.modes, priceIsRight: game.modes.priceIsRight.filter(i => i.id !== id) } })
  }

  const saveFF = (q: FamilyFeudQuestion) => {
    updateGame({ ...game, modes: { ...game.modes, familyFeud: [q, ...game.modes.familyFeud] } })
  }
  const removeFF = (id: string) => {
    updateGame({ ...game, modes: { ...game.modes, familyFeud: game.modes.familyFeud.filter(i => i.id !== id) } })
  }

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
          <h1 className="text-xl font-semibold">Edit: {game.name}</h1>
          <div className="flex gap-2">
            <Link to={`/play/${game.id}`} className="px-3 py-2 rounded bg-blue-600 text-white">Play Now</Link>
            <button onClick={()=>navigate('/')} className="px-3 py-2 rounded border">Back</button>
          </div>
        </div>

        <div className="bg-white rounded border">
          <div className="flex border-b">
            <button className={`px-4 py-2 ${tab==='pir'?'border-b-2 border-blue-600':''}`} onClick={()=>setTab('pir')}>Price Is Right</button>
            <button className={`px-4 py-2 ${tab==='ff'?'border-b-2 border-blue-600':''}`} onClick={()=>setTab('ff')}>Family Feud</button>
            <button className={`px-4 py-2 ${tab==='jep'?'border-b-2 border-blue-600':''}`} onClick={()=>setTab('jep')}>Jeopardy</button>
          </div>
          <div className="p-4">
            {tab === 'pir' && <PIRSection onAdd={savePIR} onRemove={removePIR} items={game.modes.priceIsRight} />}
            {tab === 'ff' && <FFSection onAdd={saveFF} onRemove={removeFF} questions={game.modes.familyFeud} />}
            {tab === 'jep' && <JepSection onAdd={saveJep} onRemove={removeJep} questions={game.modes.jeopardy} categories={game.modes.jeopardyCategories || ['', '', '', '', '', '']} onCategoriesUpdate={updateCategories} />}
          </div>
        </div>
      </div>
    </div>
  )
}

function PIRSection({ items, onAdd, onRemove }: { items: PriceIsRightItem[], onAdd: (i: PriceIsRightItem)=>void, onRemove:(id:string)=>void }) {
  const [item, setItem] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  return (
    <div className="space-y-4">
      <form onSubmit={(e)=>{e.preventDefault(); if(!item || price === '' ) return; onAdd({ id: nanoid(), item, price: Number(price)}); setItem(''); setPrice('')}} className="flex flex-col md:flex-row gap-2">
        <input className="border rounded px-3 py-2 w-full" placeholder="Item name" value={item} onChange={e=>setItem(e.target.value)} />
        <input className="border rounded px-3 py-2 w-full md:w-40" placeholder="Price" type="number" value={price} onChange={e=>setPrice(e.target.value?Number(e.target.value):'')} />
        <button className="bg-green-600 text-white rounded px-3 py-2">Add</button>
      </form>
      <ul className="grid gap-2">
        {items.map(i => (
          <li key={i.id} className="flex items-center justify-between border rounded px-3 py-2">
            <div>{i.item} <span className="text-slate-500">(${i.price})</span></div>
            <button onClick={()=>onRemove(i.id)} className="text-red-700">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function FFSection({ questions, onAdd, onRemove }: { questions: FamilyFeudQuestion[], onAdd: (q: FamilyFeudQuestion)=>void, onRemove:(id:string)=>void }) {
  const [question, setQuestion] = useState('')
  const [answers, setAnswers] = useState<FamilyFeudAnswer[]>([])
  const [ans, setAns] = useState('')
  const [pts, setPts] = useState<number | ''>('')
  const addAns = () => { if(!ans || pts==='') return; setAnswers(a=>[{ id: nanoid(), answer: ans, points: Number(pts)}, ...a]); setAns(''); setPts('') }
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input className="border rounded px-3 py-2 w-full" placeholder="Question" value={question} onChange={e=>setQuestion(e.target.value)} />
        <div className="flex gap-2">
          <input className="border rounded px-3 py-2 w-full" placeholder="Answer" value={ans} onChange={e=>setAns(e.target.value)} />
          <input className="border rounded px-3 py-2 w-32" placeholder="Points" type="number" value={pts} onChange={e=>setPts(e.target.value?Number(e.target.value):'')} />
          <button type="button" onClick={addAns} className="px-3 py-2 rounded border">Add Answer</button>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {answers.map(a => (
            <span key={a.id} className="px-2 py-1 rounded border bg-slate-50">{a.answer} ({a.points})</span>
          ))}
        </div>
        <button onClick={()=>{ if(!question || answers.length===0) return; onAdd({ id: nanoid(), question, answers }); setQuestion(''); setAnswers([])}} className="bg-green-600 text-white rounded px-3 py-2">Save Question</button>
      </div>
      <ul className="grid gap-2">
        {questions.map(q => (
          <li key={q.id} className="flex items-center justify-between border rounded px-3 py-2">
            <div>{q.question} <span className="text-slate-500">({q.answers.length} answers)</span></div>
            <button onClick={()=>onRemove(q.id)} className="text-red-700">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function JepSection({ questions, onAdd, onRemove, categories, onCategoriesUpdate }: { questions: JeopardyQuestion[], onAdd: (q: JeopardyQuestion)=>void, onRemove:(id:string)=>void, categories: string[], onCategoriesUpdate: (cats: string[])=>void }) {
  const [editingCard, setEditingCard] = useState<{categoryIndex: number, rowIndex: number} | null>(null)
  const [editQuestion, setEditQuestion] = useState('')
  const [editAnswer, setEditAnswer] = useState('')
  const points = [100, 200, 300, 400, 500]
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
                  {q ? '✓' : `$${point}`}
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
              Edit: {categories[editingCard.categoryIndex] || `Category ${editingCard.categoryIndex + 1}`} — ${points[editingCard.rowIndex]}
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
                if (existing) onRemove(existing.id)
                setEditingCard(null)
              }} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
              <button onClick={() => setEditingCard(null)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


