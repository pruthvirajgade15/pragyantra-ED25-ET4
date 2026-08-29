import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, BookmarkIcon, Clock, FileText, TrendingUp, AlertCircle, ArrowRight, UserCheck, FolderUp, CheckCircle, ExternalLink, Calendar } from 'lucide-react'
import { scholarshipAPI, deadlineAPI, profileAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import ScholarshipCard from '../components/ScholarshipCard'

function StatCard({ icon: Icon, value, label, subtext, color = 'blue' }) {
  const colorMap = {
    blue:   'bg-blue-50 text-blue-600 border-blue-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber:  'bg-amber-50 text-amber-600 border-amber-100',
    green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
  }

  return (
    <div className="surface-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">{value}</div>
        {subtext && <p className="text-xs text-slate-400 mt-0.5">{subtext}</p>}
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="surface-card p-5 space-y-4">
      <div className="skeleton h-4 w-1/3" />
      <div className="skeleton h-6 w-3/4" />
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-8 w-1/2 rounded-full" />
    </div>
  )
}

export default function DashboardPage() {
  const { user, lang } = useAuth()
  const { t } = useTranslation(lang)
  const [matched, setMatched] = useState([])
  const [saved, setSaved] = useState([])
  const [deadlines, setDeadlines] = useState([])
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(true)
  const [activeTab, setActiveTab] = useState('matched')

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [matchedRes, savedRes, deadlineRes, profileRes] = await Promise.allSettled([
        scholarshipAPI.prioritize(),
        scholarshipAPI.saved(),
        deadlineAPI.upcoming(),
        profileAPI.get(),
      ])

      if (matchedRes.status === 'fulfilled') setMatched(matchedRes.value.data)
      else if (matchedRes.reason?.response?.status === 400) setHasProfile(false)

      if (savedRes.status === 'fulfilled') setSaved(savedRes.value.data)
      if (deadlineRes.status === 'fulfilled') setDeadlines(deadlineRes.value.data.slice(0, 5))
      if (profileRes.status === 'fulfilled' && profileRes.value.data) {
        setProfileData(profileRes.value.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const criticalDeadlines = deadlines.filter(d => d.days_left != null && d.days_left <= 7)

  // Calculate profile completeness score
  const getProfileCompletion = () => {
    if (!profileData) return 20
    let score = 20 // Account created
    if (profileData.full_name) score += 15
    if (profileData.annual_income) score += 15
    if (profileData.percentage) score += 15
    if (profileData.state) score += 15
    if (profileData.field_of_study) score += 10
    if (profileData.college) score += 10
    return Math.min(100, score)
  }

  const profilePct = getProfileCompletion()

  return (
    <div className={`page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Welcoming Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 mb-2">
            <Sparkles size={13} /> AI Scholarship Match Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here is your live eligibility overview, verified matches, and upcoming application deadlines.
          </p>
        </div>

        {/* Profile Completion Pill */}
        <Link 
          to="/profile" 
          className="surface-card p-3.5 flex items-center gap-3.5 hover:border-blue-300 transition-all self-start md:self-auto"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
            {profilePct}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Profile Completeness <ArrowRight size={12} className="text-blue-600" />
            </div>
            <p className="text-[11px] text-slate-500">
              {profilePct === 100 ? 'All criteria active' : 'Complete profile for 100% match accuracy'}
            </p>
          </div>
        </Link>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Sparkles} 
          value={matched.length} 
          label="Eligible Matches" 
          subtext="Ranked by AI win probability" 
          color="blue" 
        />
        <StatCard 
          icon={BookmarkIcon} 
          value={saved.length} 
          label="Saved Schemes" 
          subtext="Ready for submission" 
          color="purple" 
        />
        <StatCard 
          icon={Clock} 
          value={criticalDeadlines.length} 
          label="Closing This Week" 
          subtext={criticalDeadlines.length > 0 ? "Urgent action required" : "No critical deadlines"} 
          color="amber" 
        />
        <StatCard 
          icon={TrendingUp} 
          value={matched.length > 0 ? `${Math.round(matched[0]?.match_score || 0)}%` : '—'} 
          label="Top Match Score" 
          subtext="Highest compatibility" 
          color="green" 
        />
      </div>

      {/* Critical Closing Soon Alert Banner */}
      {criticalDeadlines.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                {criticalDeadlines.length} scholarship scheme(s) close this week!
              </p>
              <p className="text-xs text-amber-700">
                Review required documents and apply on the official portals before the closing date.
              </p>
            </div>
          </div>

          <Link 
            to="/deadlines" 
            className="btn-saffron text-xs py-2 px-4 whitespace-nowrap self-stretch sm:self-auto text-center"
          >
            View Deadlines <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Incomplete Profile Prompt */}
      {!hasProfile && (
        <div className="surface-card p-6 border-dashed border-2 border-blue-200 text-center space-y-3 bg-blue-50/30">
          <UserCheck size={32} className="text-blue-600 mx-auto" />
          <div>
            <h3 className="font-bold text-slate-900 text-base font-display">Complete your student profile</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Add your category, annual family income, percentage, and state so our AI engine can calculate exact match scores.
            </p>
          </div>
          <Link to="/profile" className="btn-primary text-xs py-2 px-5 inline-flex">
            Complete Profile <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Main Tabbed Interface */}
      <div className="space-y-5">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button 
            onClick={() => setActiveTab('matched')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'matched' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles size={16} /> Recommended For You ({matched.length})
          </button>

          <button 
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'saved' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookmarkIcon size={16} /> Saved ({saved.length})
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : activeTab === 'matched' ? (
          matched.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {matched.map(s => (
                <ScholarshipCard key={s.id} scholarship={s} showMatchScore onSaved={loadDashboard} />
              ))}
            </div>
          ) : (
            <div className="surface-card p-12 text-center space-y-3">
              <Sparkles size={36} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No matched scholarships found yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Update your academic criteria or explore all available scholarships in our directory.
              </p>
              <Link to="/scholarships" className="btn-secondary text-xs py-2 px-4 inline-flex">
                Browse Directory
              </Link>
            </div>
          )
        ) : (
          /* Saved Scholarships Tab */
          saved.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map(s => (
                <ScholarshipCard 
                  key={s.saved_id} 
                  scholarship={{
                    ...s.scholarship,
                    match_score: s.match_score,
                    days_left: s.scholarship.deadline
                      ? Math.max(0, Math.ceil((new Date(s.scholarship.deadline) - new Date()) / 86400000))
                      : null
                  }} 
                  showMatchScore 
                  onSaved={loadDashboard}
                />
              ))}
            </div>
          ) : (
            <div className="surface-card p-12 text-center space-y-3">
              <BookmarkIcon size={36} className="text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No saved scholarships</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Bookmark scholarships from your matches or the directory to track them here.
              </p>
              <Link to="/scholarships" className="btn-primary text-xs py-2 px-4 inline-flex">
                Explore Scholarships
              </Link>
            </div>
          )
        )}

      </div>

      {/* Quick Launch Cards */}
      <div className="grid sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
        <Link to="/essay" className="surface-card p-4 flex items-center gap-3 hover:border-blue-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileText size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
              AI Essay Studio <ArrowRight size={12} className="text-purple-600" />
            </div>
            <p className="text-xs text-slate-500">Draft application statements</p>
          </div>
        </Link>

        <Link to="/documents" className="surface-card p-4 flex items-center gap-3 hover:border-blue-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FolderUp size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
              Document Vault <ArrowRight size={12} className="text-blue-600" />
            </div>
            <p className="text-xs text-slate-500">Store and extract certificate data</p>
          </div>
        </Link>

        <Link to="/deadlines" className="surface-card p-4 flex items-center gap-3 hover:border-blue-300 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Clock size={20} />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
              Live Deadline Tracker <ArrowRight size={12} className="text-amber-600" />
            </div>
            <p className="text-xs text-slate-500">Track application closing dates</p>
          </div>
        </Link>
      </div>

    </div>
  )
}