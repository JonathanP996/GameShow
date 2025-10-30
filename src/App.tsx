import { Route, Routes, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './state/AppContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'
import Play from './pages/Play'

function Protected({ children }: { children: JSX.Element }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/editor/:gameId"
        element={
          <Protected>
            <Editor />
          </Protected>
        }
      />
      <Route
        path="/play/:gameId"
        element={
          <Protected>
            <Play />
          </Protected>
        }
      />
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


