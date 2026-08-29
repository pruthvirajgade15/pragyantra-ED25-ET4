import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import { LoginPage, RegisterPage } from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ScholarshipsPage from './pages/ScholarshipsPage'
import EssayPage from './pages/EssayPage'
import DeadlinesPage from './pages/DeadlinesPage'
import ProfilePage from './pages/ProfilePage'
import DocumentsPage from './pages/DocumentsPage'
import Chatbot from './components/Chatbot'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
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
        <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
          <div>
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/scholarships" element={<ScholarshipsPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/essay" element={<ProtectedRoute><EssayPage /></ProtectedRoute>} />
                <Route path="/deadlines" element={<ProtectedRoute><DeadlinesPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
          
          <Footer />
        </div>

        <GlobalChatbot />
        
        <Toaster 
          position="top-right"
          toastOptions={{ 
            duration: 3500,
            style: { 
              borderRadius: '12px', 
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
            }
          }} 
        />
      </AuthProvider>
    </BrowserRouter>
  )
}