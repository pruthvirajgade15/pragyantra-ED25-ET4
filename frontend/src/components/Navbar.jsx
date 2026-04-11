import { memo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Menu, X, Globe } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import toast from 'react-hot-toast'

// ✅ memo() stops Navbar re-rendering when parent re-renders
const Navbar = memo(function Navbar() {
  const { user, logout, lang, switchLang } = useAuth()
  const { t } = useTranslation(lang)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navLinks = user ? [
    { to: '/dashboard',    label: t('dashboard') },
    { to: '/scholarships', label: t('scholarships') },
    { to: '/documents',    label: 'Documents' },
    { to: '/essay',        label: t('essay') },
    { to: '/deadlines',    label: t('deadlines') },
    { to: '/profile',      label: t('profile') },
  ] : [
    { to: '/scholarships', label: t('scholarships') },
  ]

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-shadow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-display font-bold text-slate-800 text-lg tracking-tight">Scholarship</span>
              <span className="font-display font-bold text-sky-500 text-lg">Hunter</span>
              <span className="ml-1.5 text-[10px] font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white px-1.5 py-0.5 rounded-full shadow-sm">AI</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(to) ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}>{label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
            >
              <Globe size={15} />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-1 pr-3 py-1 shadow-sm hover:shadow hover:border-sky-300 transition-all cursor-default">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-inner">
                  <span className="text-white text-sm font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-700 pr-3 border-r border-slate-200">
                  {user.name?.split(' ')[0]}
                </span>
                <button onClick={handleLogout} className="text-xs font-extrabold text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-wider">
                  {t('logout')}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"    className="btn-secondary text-sm py-2">{t('login')}</Link>
                <Link to="/register" className="btn-primary text-sm py-2">{t('register')}</Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(to) ? 'bg-sky-100 text-sky-700' : 'text-slate-600 hover:bg-slate-100'
                }`}>{label}</Link>
            ))}
            <div className="pt-2 flex gap-2 flex-wrap">
              <button onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-600">
                <Globe size={14} /> {lang === 'en' ? 'हिंदी' : 'English'}
              </button>
              {user ? (
                <div className="flex items-center justify-between w-full bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-inner">
                      <span className="text-white text-sm font-bold">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-700">{user.name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-colors uppercase tracking-wider">
                    {t('logout')}
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary text-sm py-2">{t('login')}</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-sm py-2">{t('register')}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
})

export default Navbar