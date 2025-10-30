import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../state/AppContext'

export default function Login() {
  const { currentUser, setCurrentUser } = useApp()
  const [name, setName] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) navigate('/')
  }, [currentUser, navigate])

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome!</h1>
        <p className="mb-4 text-slate-600">Enter your name to continue.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!name.trim()) return
            setCurrentUser(name.trim())
            navigate('/')
          }}
          className="space-y-3"
        >
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border rounded px-3 py-2"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}


