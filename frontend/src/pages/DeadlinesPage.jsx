import { useState, useEffect } from 'react'
import { Clock, ExternalLink, AlertTriangle, Bell, Calendar, CheckCircle, ShieldAlert } from 'lucide-react'
import { deadlineAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'

export default function DeadlinesPage() {
  const { lang } = useAuth()
  const { t } = useTranslation(lang)
  const [deadlines, setDeadlines] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const [d, s] = await Promise.all([deadlineAPI.upcoming(), deadlineAPI.summary()])
        setDeadlines(d.data)
        setSummary(s.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = filter === 'all' ? deadlines
    : filter === 'critical' ? deadlines.filter(d => d.days_left != null && d.days_left <= 3)
    : filter === 'urgent'   ? deadlines.filter(d => d.days_left != null && d.days_left <= 7 && d.days_left > 3)
    : deadlines.filter(d => d.days_left == null || d.days_left > 7)

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className={`page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 mb-2">
            <Clock size={13} /> Real-Time Application Schedule
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Scholarship Deadline Tracker
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track exact closing dates across National Scholarship Portal, state portals, and university merit schemes.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="surface-card p-5 border-l-4 border-l-rose-500 space-y-1">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle size={14} /> Closing This Week (&le; 7d)
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {summary.expiring_in_7_days || 0}
          </div>
          <p className="text-[11px] text-slate-400">Requires immediate submission</p>
        </div>

        <div className="surface-card p-5 border-l-4 border-l-amber-500 space-y-1">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
            <Bell size={14} /> Closing This Month (&le; 30d)
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {summary.expiring_in_30_days || 0}
          </div>
          <p className="text-[11px] text-slate-400">Prepare documents now</p>
        </div>

        <div className="surface-card p-5 border-l-4 border-l-emerald-500 space-y-1">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle size={14} /> Total Active Schemes
          </span>
          <div className="text-3xl font-extrabold text-slate-900 font-display">
            {summary.total_scholarships || 0}
          </div>
          <p className="text-[11px] text-slate-400">Verified official schemes</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { key: 'all',      label: `All Schemes (${deadlines.length})` },
          { key: 'critical', label: `⚠️ Critical < 3 Days (${deadlines.filter(d => d.days_left != null && d.days_left <= 3).length})` },
          { key: 'urgent',   label: `🔔 This Week (${deadlines.filter(d => d.days_left != null && d.days_left <= 7 && d.days_left > 3).length})` },
          { key: 'upcoming', label: `📅 Later (${deadlines.filter(d => d.days_left == null || d.days_left > 7).length})` },
        ].map(({ key, label }) => (
          <button 
            key={key} 
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              filter === key 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Deadline Items List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="surface-card p-5 flex gap-4">
              <div className="skeleton w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface-card p-12 text-center space-y-3">
          <Calendar size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No deadlines in this category</h3>
          <p className="text-xs text-slate-500">Check the "All Schemes" tab to view all open application schedules.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const isCritical = d.days_left != null && d.days_left <= 3
            const isUrgent = d.days_left != null && d.days_left <= 7

            return (
              <div 
                key={d.id} 
                className={`surface-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 ${
                  isCritical 
                    ? 'border-l-4 border-l-rose-500 bg-rose-50/20' 
                    : isUrgent 
                      ? 'border-l-4 border-l-amber-500 bg-amber-50/20' 
                      : ''
                }`}
              >
                {/* Left side: Countdown Badge + Details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 font-display ${
                    isCritical 
                      ? 'bg-rose-100 text-rose-700 font-extrabold' 
                      : isUrgent 
                        ? 'bg-amber-100 text-amber-800 font-bold' 
                        : 'bg-slate-100 text-slate-700 font-semibold'
                  }`}>
                    <span className="text-sm leading-none">{d.days_left != null ? d.days_left : '—'}</span>
                    <span className="text-[9px] uppercase font-medium">days</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {d.provider}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          ⚠️ Closing in {d.days_left}d
                        </span>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {d.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="font-semibold text-emerald-700">₹{d.amount}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> Deadline: {formatDate(d.deadline)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right Action: Apply Now */}
                <a 
                  href={d.official_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary text-xs py-2 px-4 whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center gap-1.5"
                >
                  Apply on Portal <ExternalLink size={13} />
                </a>
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}