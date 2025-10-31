import { Route, Routes, Navigate } from 'react-router-dom'
import { AppProvider } from './state/AppContext'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Play from './pages/Play'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/editor/:gameId" element={<Editor />} />
      <Route path="/play/:gameId" element={<Play />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}


