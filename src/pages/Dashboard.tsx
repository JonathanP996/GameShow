import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { useApp } from '../state/AppContext'

export default function Dashboard() {
  const { data, createGame, removeGame } = useApp()
  const [name, setName] = useState('Friday Night Game')
  const [modes, setModes] = useState<{pir: boolean, ff: boolean, jep: boolean}>({ pir: true, ff: true, jep: true })
  const navigate = useNavigate()

  const onCreate = () => {
    const id = createGame(name, {
      priceIsRight: modes.pir ? [] : [],
      familyFeud: modes.ff ? [] : [],
      jeopardy: modes.jep ? [] : [],
    })
    navigate(`/editor/${id}`)
  }

  return (
    <div className="min-h-full">
      <TopBar />
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">Create a New Game</h2>
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
            <input className="border rounded px-3 py-2 w-full md:w-64" value={name} onChange={e=>setName(e.target.value)} />
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={modes.pir} onChange={e=>setModes(m=>({...m, pir: e.target.checked}))}/> Price Is Right</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={modes.ff} onChange={e=>setModes(m=>({...m, ff: e.target.checked}))}/> Family Feud</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={modes.jep} onChange={e=>setModes(m=>({...m, jep: e.target.checked}))}/> Jeopardy</label>
            </div>
            <button onClick={onCreate} className="bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2">Create New Game</button>
          </div>
        </div>

        <div className="bg-white p-4 rounded border">
          <h2 className="font-semibold mb-3">Your Games</h2>
          <div className="grid gap-3">
            {data.games.length === 0 && <div className="text-slate-600">No games yet. Create one above.</div>}
            {data.games.map(g => (
              <div key={g.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{g.name}</div>
                  <div className="text-sm text-slate-600">
                    Modes: {[
                      g.modes.priceIsRight.length >= 0 ? 'Price Is Right' : null,
                      g.modes.familyFeud.length >= 0 ? 'Family Feud' : null,
                      g.modes.jeopardy.length >= 0 ? 'Jeopardy' : null,
                    ].filter(Boolean).join(', ')}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/editor/${g.id}`} className="px-3 py-2 rounded border">Edit</Link>
                  <Link to={`/play/${g.id}`} className="px-3 py-2 rounded bg-blue-600 text-white">Play</Link>
                  <button onClick={()=>removeGame(g.id)} className="px-3 py-2 rounded border border-red-300 text-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


