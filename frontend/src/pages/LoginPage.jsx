import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, Zap, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { authAPI } from '../utils/api'

function AuthLayout({ children, side }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      {/* Left Feature Column (Desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-slate-900 text-white relative items-center justify-center p-12 overflow-hidden border-r border-slate-800">
        <div className="relative z-10 max-w-md space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <GraduationCap size={24} />
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
            {side === 'login' ? 'Welcome back to your Scholarship Hub' : 'Join thousands of students finding scholarships'}
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed">
            {side === 'login' 
              ? 'Access your calculated match probabilities, saved applications, document vault, and personalized deadline alerts.'
              : 'Create your free account in 30 seconds. Calculate your exact eligibility for government and private merit scholarships.'}
          </p>

          <div className="space-y-3 pt-2">
            {[
              '100% Free platform with zero agent commissions',
              'AI-calculated match percentages & win probabilities',
              'Direct verified links to NSP, AICTE, and state portals',
              'Automated scholarship essay studio in Hindi & English',
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] surface-card p-8 bg-white shadow-xl">
          {children}
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const emailRef = useRef(null)
  const pwRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const email = emailRef.current.value.trim()
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
      toast.error(err.response?.data?.detail || err.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout side="login">
      <div className="page-enter space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Sign in to your account</h1>
          <p className="text-slate-500 text-xs mt-1">Enter your student credentials to view your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
            <input ref={emailRef} type="email" placeholder="you@email.com" required className="input-field text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
            <div className="relative">
              <input 
                ref={pwRef} 
                type={showPw ? 'text' : 'password'} 
                placeholder="••••••••" 
                required 
                className="input-field pr-10 text-sm" 
              />
              <button 
                type="button" 
                onClick={() => setShowPw(p => !p)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Signing in...' : <>Sign in to Dashboard <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register free</Link>
        </p>

        {/* Demo Account Credentials */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center text-xs text-slate-500 space-y-1">
          <span className="font-semibold text-slate-700 block">🧪 Instant Demo Credentials</span>
          <code>demo@scholar.in</code> / <code>demo1234</code>
        </div>
      </div>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en')
  const nameRef = useRef(null)
  const emailRef = useRef(null)
  const pwRef = useRef(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const name = nameRef.current.value.trim()
    const email = emailRef.current.value.trim()
    const password = pwRef.current.value
    if (!name) { toast.error('Please enter your full name'); return }
    if (!email) { toast.error('Please enter your email address'); return }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    if (password.length > 70) { toast.error('Password too long (max 70 characters)'); return }
    
    setLoading(true)
    try {
      const { data } = await authAPI.register({ name, email, password, language })
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data))
      localStorage.setItem('lang', language)
      toast.success('Student account created! 🎓')
      window.location.href = '/profile'
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout side="register">
      <div className="page-enter space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Create your free account</h1>
          <p className="text-slate-500 text-xs mt-1">Start discovering eligible scholarships in 30 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Full Name</label>
            <input ref={nameRef} type="text" placeholder="e.g. Priya Sharma" required className="input-field text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Email Address</label>
            <input ref={emailRef} type="email" placeholder="you@email.com" required className="input-field text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Password</label>
            <div className="relative">
              <input 
                ref={pwRef} 
                type={showPw ? 'text' : 'password'} 
                placeholder="Minimum 6 characters" 
                required 
                className="input-field pr-10 text-sm" 
              />
              <button 
                type="button" 
                onClick={() => setShowPw(p => !p)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Preferred Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)} className="input-field text-sm">
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : <>Create Account <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default LoginPage