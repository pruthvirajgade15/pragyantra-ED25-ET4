import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, BookmarkIcon, Clock, FileText, TrendingUp, AlertCircle } from 'lucide-react'
import { scholarshipAPI, deadlineAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import ScholarshipCard from '../components/ScholarshipCard'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, value, label, color = 'sky' }) {
  return (
    <div className="glass-card p-5 flex items-center gap-4 group">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 border border-${color}-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className={`text-${color}-600`} />
      </div>
      <div>
        <div className="font-display font-bold text-2xl text-slate-800">{value}</div>
        <div className="text-sm text-slate-500 font-medium">{label}</div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2">
        <div className="skeleton h-6 w-20 rounded-full" />
        <div className="skeleton h-6 w-16 rounded-full" />
      </div>
      <div className="skeleton h-8 w-full rounded-xl" />
    </div>
  )
}

export default function DashboardPage() {
  const { user, lang }            = useAuth()
  const { t }                     = useTranslation(lang)
  const [matched, setMatched]     = useState([])
  const [saved, setSaved]         = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [loading, setLoading]     = useState(true)
  const [hasProfile, setHasProfile] = useState(true)
  const [activeTab, setActiveTab] = useState('matched')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [matchedRes, savedRes, deadlineRes] = await Promise.allSettled([
        scholarshipAPI.prioritize(),
        scholarshipAPI.saved(),
        deadlineAPI.upcoming(),
      ])

      if (matchedRes.status === 'fulfilled') setMatched(matchedRes.value.data)
      else if (matchedRes.reason?.response?.status === 500) setHasProfile(false)

      if (savedRes.status === 'fulfilled') setSaved(savedRes.value.data)
      if (deadlineRes.status === 'fulfilled') setDeadlines(deadlineRes.value.data.slice(0, 5))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const criticalDeadlines = deadlines.filter(d => d.days_left <= 7)

  return (
    <div className={`page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 text-sm font-semibold text-sky-600 mb-3">
          <Sparkles size={14} /> AI Dashboard
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">
          {t('dashboard_title')} 👋
        </h1>
        <p className="text-slate-500 mt-1.5">Welcome back, <span className="font-semibold text-sky-600">{user?.name}</span>. Here's your scholarship overview.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Sparkles}    value={matched.length}          label="AI Matches"        color="sky" />
        <StatCard icon={BookmarkIcon} value={saved.length}           label="Saved"             color="purple" />
        <StatCard icon={Clock}       value={criticalDeadlines.length} label="Closing this week" color="orange" />
        <StatCard icon={TrendingUp}  value={matched.length > 0 ? `${Math.round(matched[0]?.match_score || 0)}%` : '—'}
                  label="Top match score" color="green" />
      </div>

      {/* Critical deadline alert */}
      {criticalDeadlines.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">⚠️ {criticalDeadlines.length} scholarship(s) closing this week!</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {criticalDeadlines.slice(0, 3).map(d => (
                <a key={d.id} href={d.official_link} target="_blank" rel="noopener noreferrer"
                   className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full hover:bg-amber-200 transition-colors">
                  {d.name.slice(0, 35)}... (Deadline: {new Date(d.deadline).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })} ({d.days_left}d left))
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile prompt */}
      {!hasProfile && (
        <div className="mb-6 glass-card p-6 text-center border-dashed border-2 border-sky-200">
          <Sparkles size={36} className="text-sky-400 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-slate-800 mb-2">{t('complete_profile_first')}</h3>
          <Link to="/profile" className="btn-primary inline-flex items-center gap-2 mt-2">{t('go_to_profile')}</Link>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit">
        {[
          { key: 'matched', label: `🎯 ${t('matched_for_you')} (${matched.length})` },
          { key: 'saved',   label: `🔖 ${t('saved')} (${saved.length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>{label}</button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : activeTab === 'matched' ? (
        matched.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {matched.map(s => <ScholarshipCard key={s.id} scholarship={s} showMatchScore onSaved={loadData} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Sparkles size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">{hasProfile ? t('no_results') : t('complete_profile_first')}</p>
            {!hasProfile && (
              <Link to="/profile" className="btn-primary mt-4 inline-flex">{t('go_to_profile')}</Link>
            )}
          </div>
        )
      ) : (
        saved.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {saved.map(s => (
              <ScholarshipCard key={s.saved_id} scholarship={{
                ...s.scholarship,
                match_score: s.match_score,
                days_left: s.scholarship.deadline
                  ? Math.ceil((new Date(s.scholarship.deadline) - new Date()) / 86400000)
                  : null
              }} showMatchScore />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <BookmarkIcon size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No saved scholarships yet</p>
            <Link to="/scholarships" className="btn-primary mt-4 inline-flex">Browse Scholarships</Link>
          </div>
        )
      )}

      {/* Quick links */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/essay" className="glass-card p-5 flex items-center gap-4 hover:border-sky-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-sky-100 flex items-center justify-center">
            <FileText size={20} className="text-sky-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{t('essay_title')}</div>
            <div className="text-xs text-slate-500">{t('essay_subtitle')}</div>
          </div>
        </Link>
        <Link to="/deadlines" className="glass-card p-5 flex items-center gap-4 hover:border-orange-200 transition-all">
          <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center">
            <Clock size={20} className="text-orange-600" />
          </div>
          <div>
            <div className="font-semibold text-slate-800">{t('deadlines_title')}</div>
            <div className="text-xs text-slate-500">Track all upcoming deadlines</div>
          </div>
        </Link>
      </div>
    </div>
  )
}
