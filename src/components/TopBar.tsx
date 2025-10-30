import { Link } from 'react-router-dom'
import { useApp } from '../state/AppContext'

export default function TopBar() {
  const { currentUser } = useApp()
  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold">Game Show</Link>
        <div className="text-sm text-slate-600">{currentUser ? `Signed in as ${currentUser}` : ''}</div>
      </div>
    </div>
  )
}


