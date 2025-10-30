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
    updateGame({ ...game, modes: { ...game.modes, jeopardy: [q, ...game.modes.jeopardy] } })
  }
  const removeJep = (id: string) => {
    updateGame({ ...game, modes: { ...game.modes, jeopardy: game.modes.jeopardy.filter(i => i.id !== id) } })
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
            {tab === 'jep' && <JepSection onAdd={saveJep} onRemove={removeJep} questions={game.modes.jeopardy} />}
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

function JepSection({ questions, onAdd, onRemove }: { questions: JeopardyQuestion[], onAdd: (q: JeopardyQuestion)=>void, onRemove:(id:string)=>void }) {
  const [category, setCategory] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [points, setPoints] = useState<number | ''>('')
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-4 gap-2">
        <input className="border rounded px-3 py-2" placeholder="Category" value={category} onChange={e=>setCategory(e.target.value)} />
        <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Question" value={question} onChange={e=>setQuestion(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Points" type="number" value={points} onChange={e=>setPoints(e.target.value?Number(e.target.value):'')} />
        <input className="border rounded px-3 py-2 md:col-span-3" placeholder="Answer" value={answer} onChange={e=>setAnswer(e.target.value)} />
        <button onClick={()=>{ if(!category||!question||!answer||points==='') return; onAdd({ id: nanoid(), category, question, answer, points: Number(points)}); setCategory(''); setQuestion(''); setAnswer(''); setPoints('')}} className="bg-green-600 text-white rounded px-3 py-2">Add</button>
      </div>
      <ul className="grid gap-2">
        {questions.map(q => (
          <li key={q.id} className="flex items-center justify-between border rounded px-3 py-2">
            <div className="truncate">[{q.points}] {q.category} — {q.question}</div>
            <button onClick={()=>onRemove(q.id)} className="text-red-700">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}


