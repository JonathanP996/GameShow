import { Link } from 'react-router-dom'

export default function TopBar() {
  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-xl">Jeopardy Game Show</Link>
      </div>
    </div>
  )
}


