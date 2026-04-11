import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import HomePage         from './pages/HomePage'
import { LoginPage }    from './pages/LoginPage'
import { RegisterPage } from './pages/LoginPage'
import DashboardPage    from './pages/DashboardPage'
import ScholarshipsPage from './pages/ScholarshipsPage'
import EssayPage        from './pages/EssayPage'
import DeadlinesPage    from './pages/DeadlinesPage'
import ProfilePage      from './pages/ProfilePage'
import DocumentsPage    from './pages/DocumentsPage'
import './index.css'

import Chatbot          from './components/Chatbot'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'4px solid #0ea5e9',
        borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function GlobalChatbot() {
  const { user } = useAuth()
  if (!user) return null
  return <Chatbot />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/"             element={<HomePage />} />
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/dashboard"    element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/essay"        element={<ProtectedRoute><EssayPage /></ProtectedRoute>} />
          <Route path="/deadlines"    element={<ProtectedRoute><DeadlinesPage /></ProtectedRoute>} />
          <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/documents"    element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          <Route path="*"             element={<Navigate to="/" replace />} />
        </Routes>
        <GlobalChatbot />
        <Toaster position="top-right"
          toastOptions={{ duration: 3000,
            style: { borderRadius:'12px', fontFamily:'DM Sans, sans-serif' }}} />
      </AuthProvider>
    </BrowserRouter>
  )
}