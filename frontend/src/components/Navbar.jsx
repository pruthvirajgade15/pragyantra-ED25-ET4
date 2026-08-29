import { memo, useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Menu, X, Globe, User, LogOut, FileText, Bookmark, FolderUp, Clock, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import toast from 'react-hot-toast'

const Navbar = memo(function Navbar() {
  const { user, logout, lang, switchLang } = useAuth()
  const { t } = useTranslation(lang)
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const navLinks = user ? [
    { to: '/scholarships', label: t('scholarships') },
    { to: '/dashboard',    label: t('dashboard') },
    { to: '/deadlines',    label: t('deadlines') },
    { to: '/essay',        label: t('essay') },
    { to: '/documents',    label: 'Documents' },
  ] : [
    { to: '/scholarships', label: t('scholarships') },
  ]

  const handleLogout = () => {
    logout()
    setUserDropdownOpen(false)
    toast.success('Logged out successfully')
    navigate('/')
  }

  return (
    <nav className="navbar sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <GraduationCap size={20} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-slate-900 text-lg tracking-tight">
                Scholarship<span className="text-blue-600">Hunter</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">AI</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link 
                key={to} 
                to={to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(to) 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Bilingual Switcher */}
            <button
              onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              title="Switch Language"
            >
              <Globe size={14} className="text-blue-600" />
              {lang === 'en' ? 'हिंदी' : 'English'}
            </button>

            {user ? (
              /* User Avatar & Dropdown */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 animate-slide-up z-50 text-sm">
                    <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || 'Student Account'}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        to="/profile" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <User size={15} /> My Profile
                      </Link>
                      <Link 
                        to="/dashboard" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <LayoutDashboard size={15} /> Dashboard & Saved
                      </Link>
                      <Link 
                        to="/documents" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <FolderUp size={15} /> Document Vault
                      </Link>
                      <Link 
                        to="/essay" 
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        <FileText size={15} /> Essay Generator
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 text-left font-medium"
                      >
                        <LogOut size={15} /> {t('logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-1.5 px-3.5 text-xs font-semibold">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn-primary py-1.5 px-4 text-xs font-semibold">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
              className="p-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600"
            >
              {lang === 'en' ? 'HI' : 'EN'}
            </button>

            <button 
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-slide-up bg-white">
            {navLinks.map(({ to, label }) => (
              <Link 
                key={to} 
                to={to} 
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  isActive(to) 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {label}
              </Link>
            ))}

            {user ? (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 font-medium"
                >
                  <User size={16} /> My Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 font-semibold bg-rose-50 rounded-xl"
                >
                  <LogOut size={16} /> {t('logout')}
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn-secondary py-2 text-center text-xs">
                  {t('login')}
                </Link>
                <Link to="/register" className="btn-primary py-2 text-center text-xs">
                  {t('register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
})

export default Navbar