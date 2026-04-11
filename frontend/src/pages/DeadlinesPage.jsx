import { useState, useEffect } from 'react'
import { Clock, ExternalLink, AlertTriangle, Bell, Calendar, CheckCircle } from 'lucide-react'
import { deadlineAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'

export default function DeadlinesPage() {
  const { lang }              = useAuth()
  const { t }                 = useTranslation(lang)
  const [deadlines, setDeadlines] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const [d, s] = await Promise.all([deadlineAPI.upcoming(), deadlineAPI.summary()])
        setDeadlines(d.data)
        setSummary(s.data)
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'all' ? deadlines
    : filter === 'critical' ? deadlines.filter(d => d.days_left <= 3)
    : filter === 'urgent'   ? deadlines.filter(d => d.days_left <= 7 && d.days_left > 3)
    : deadlines.filter(d => d.days_left > 7)

  const getUrgencyConfig = (urgency, days) => {
    if (urgency === 'critical' || days <= 3) return {
      bg: 'bg-red-50 border-red-200', badge: 'bg-red-100 text-red-700',
      icon: AlertTriangle, iconColor: 'text-red-500', label: '⚠️ Critical'
    }
    if (urgency === 'urgent' || days <= 7) return {
      bg: 'bg-amber-50 border-amber-200', badge: 'bg-amber-100 text-amber-700',
      icon: Bell, iconColor: 'text-amber-500', label: '🔔 This Week'
    }
    return {
      bg: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700',
      icon: Calendar, iconColor: 'text-green-500', label: '📅 Upcoming'
    }
  }

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true
  })

  const CountdownCircle = ({ days }) => {
    const maxDays = 30
    const pct = Math.max(0, Math.min(100, ((maxDays - days) / maxDays) * 100))
    const color = days <= 3 ? '#ef4444' : days <= 7 ? '#f97316' : '#22c55e'
    const r = 18, circ = 2 * Math.PI * r
    const dashoffset = circ - (pct / 100) * circ

    return (
      <div className="relative w-14 h-14 flex-shrink-0 flex items-center justify-center">
        <svg className="absolute -rotate-90" width="56" height="56">
          <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeDasharray={circ} strokeDashoffset={dashoffset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
        </svg>
        <div className="text-center z-10">
          <div className="font-display font-bold text-sm leading-none" style={{ color }}>{days}</div>
          <div className="text-slate-400 text-[9px]">days</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`page-enter max-w-4xl mx-auto px-4 sm:px-6 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>
      {}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg flex-shrink-0">
          <Clock size={22} className="text-white" />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-4 py-1 text-xs font-semibold text-orange-600 mb-2">
            ⏰ Live Tracking
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">{t('deadlines_title')}</h1>
          <p className="text-slate-500 text-sm mt-1">Never miss a scholarship deadline</p>
        </div>
      </div>

      {}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { val: summary.expiring_in_7_days || 0,  label: 'Closing this week',  color: 'red',    icon: AlertTriangle },
            { val: summary.expiring_in_30_days || 0, label: 'Closing this month', color: 'orange', icon: Bell },
            { val: summary.total_scholarships || 0,  label: 'Total active',       color: 'green',  icon: CheckCircle },
          ].map(({ val, label, color, icon: Icon }) => (
            <div key={label} className={`glass-card p-4 text-center border-t-4 border-${color}-400`}>
              <div className={`font-display font-bold text-2xl text-${color}-600`}>{val}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      )}

      {}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-6 w-fit flex-wrap">
        {[
          { key: 'all',      label: `All (${deadlines.length})` },
          { key: 'critical', label: `⚠️ Critical (${deadlines.filter(d => d.days_left <= 3).length})` },
          { key: 'urgent',   label: `🔔 This Week (${deadlines.filter(d => d.days_left <= 7 && d.days_left > 3).length})` },
          { key: 'upcoming', label: `📅 Later (${deadlines.filter(d => d.days_left > 7).length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>{label}</button>
        ))}
      </div>

      {}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass-card p-5 flex gap-4">
              <div className="skeleton w-14 h-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Clock size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No deadlines in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(d => {
            const cfg = getUrgencyConfig(d.urgency, d.days_left)
            return (
              <div key={d.id} className={`rounded-2xl border p-5 flex items-center gap-4 transition-all hover:shadow-md ${cfg.bg}`}>
                <CountdownCircle days={d.days_left} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{d.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{d.provider} • {d.amount}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <Calendar size={11} /> {formatDate(d.deadline)}
                  </p>
                </div>

                <a href={d.official_link} target="_blank" rel="noopener noreferrer"
                  className="flex-shrink-0 btn-primary text-xs py-2 px-3 flex items-center gap-1">
                  Apply <ExternalLink size={11} />
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}