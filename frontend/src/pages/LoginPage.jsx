import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'

function AuthLayout({ children, side }) {
  return (
    <div className="min-h-screen flex">
      {}
      <div className="hidden lg:flex lg:w-[45%] hero-bg relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-8">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-4">
            {side === 'login' ? 'Welcome back!' : 'Join 10,000+ students'}
          </h2>
          <p className="text-sky-100/80 text-lg leading-relaxed mb-10">
            {side === 'login' 
              ? 'Login to access your AI-matched scholarships, saved applications, and personalized recommendations.'
              : 'Create your free account and let AI find every scholarship you deserve in under 30 seconds.'}
          </p>
          <div className="space-y-4">
            {[
              { icon: Sparkles, text: 'AI-powered scholarship matching' },
              { icon: Shield, text: 'Secure & 100% free platform' },
              { icon: Zap, text: 'Apply in under 2 minutes' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-sky-300" />
                </div>
                <span className="text-sm text-sky-100/90 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 via-white to-sky-50/30">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
  const emailRef  = useRef(null)
  const pwRef     = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const email    = emailRef.current.value.trim()
    const password = pwRef.current.value
    if (!email || !password) return
    setLoading(true)
    try {
      const { data } = await authAPI.login(email, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('lang', data.language || 'en')
      toast.success('Welcome back! 🎓')
      window.location.href = '/dashboard'
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout side="login">
      <div className="page-enter">
        {}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
            <GraduationCap size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">ScholarshipHunter</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-8">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input ref={emailRef} type="email" placeholder="you@email.com" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input ref={pwRef} type={showPw ? 'text' : 'password'} placeholder="••••••••" required className="input-field pr-11" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group disabled:opacity-60">
            {loading ? 'Logging in...' : <>{`Login`} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-sky-600 font-semibold hover:underline">Register free</Link>
        </p>

        <div className="mt-6 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            🧪 Demo: <b className="text-slate-700">demo@scholar.in</b> / <b className="text-slate-700">demo1234</b>
          </p>
        </div>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [language, setLanguage] = useState('en')
  const navigate  = useNavigate()
  const nameRef   = useRef(null)
  const emailRef  = useRef(null)
  const pwRef     = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const name     = nameRef.current.value.trim()
    const email    = emailRef.current.value.trim()
    const password = pwRef.current.value
    if (!name)               { toast.error('Enter your name');             return }
    if (!email)              { toast.error('Enter your email');            return }
    if (password.length < 6) { toast.error('Password min 6 characters');  return }
    if (password.length > 70){ toast.error('Password too long (max 70)'); return }
    setLoading(true)
    try {
      const { data } = await authAPI.register({ name, email, password, language })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('lang', language)
      toast.success('Account created! 🎓')
      window.location.href = '/profile'
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout side="register">
      <div className="page-enter">
        {}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
            <GraduationCap size={22} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-800">ScholarshipHunter</span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 mb-2">Create Free Account</h1>
        <p className="text-slate-500 mb-8">Find every scholarship you deserve</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
            <input ref={nameRef} type="text" placeholder="Priya Sharma" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
            <input ref={emailRef} type="email" placeholder="you@email.com" required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input ref={pwRef} type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" required className="input-field pr-11" />
              <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base flex items-center justify-center gap-2 group disabled:opacity-60">
            {loading ? 'Creating...' : <>{`Create Free Account`} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-sky-600 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage