import { ExternalLink, Bookmark, BookmarkCheck, Calendar, IndianRupee, Tag, MapPin, Clock } from 'lucide-react'
import { useState } from 'react'
import { scholarshipAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ScholarshipCard({ scholarship, showMatchScore = false, onSaved }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)

  const { id, name, provider, amount, deadline, category, state, field,
          official_link, description, source, match_score, days_left } = scholarship

  const getMatchBadgeClass = (score) => {
    if (!score) return 'match-badge low'
    if (score >= 80) return 'match-badge'
    if (score >= 55) return 'match-badge medium'
    return 'match-badge low'
  }

  const getUrgencyClass = () => {
    if (!days_left) return ''
    if (days_left <= 3)  return 'border-l-4 border-red-400'
    if (days_left <= 7)  return 'border-l-4 border-orange-400'
    return ''
  }

  const handleSave = async () => {
    if (!user) { toast.error('Please login to save scholarships'); return }
    setSaving(true)
    try {
      await scholarshipAPI.save(id, match_score || 0)
      setSaved(true)
      toast.success('Scholarship saved! ✓')
      onSaved?.()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const formatDeadline = (d) => {
    if (!d) return 'Open'
    return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })
  }

  return (
    <div className={`glass-card feature-card p-5 flex flex-col gap-3 group ${getUrgencyClass()}`}>
      {}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-slate-800 text-sm leading-snug line-clamp-2">{name}</h3>
          <p className="text-xs text-sky-600 font-medium mt-0.5">{provider}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {showMatchScore && match_score != null && (
            <span className={getMatchBadgeClass(match_score)}>{Math.round(match_score)}% Match</span>
          )}
          {scholarship.win_probability != null && (
            <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200 shadow-sm leading-none whitespace-nowrap">
              Win Prob: {Math.round(scholarship.win_probability)}%
            </span>
          )}
        </div>
      </div>

      {}
      <p className="text-xs text-slate-500 line-clamp-2">{description}</p>

      {}
      <div className="flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 text-xs px-2.5 py-1 rounded-full font-medium">
          <IndianRupee size={11} />{amount}
        </span>
        {category !== 'All' && (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium">
            <Tag size={11} />{category}
          </span>
        )}
        {state !== 'All India' && state !== 'All' && (
          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
            <MapPin size={11} />{state}
          </span>
        )}
        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
          {source}
        </span>
      </div>

      {}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={13} className={days_left != null && days_left <= 7 ? 'text-red-500' : 'text-slate-400'} />
          <span className={days_left != null && days_left <= 7 ? 'text-red-500 font-semibold' : ''}>
            Deadline: {formatDeadline(deadline)}
            {days_left != null && <span className="ml-1 opacity-80">({days_left}d left)</span>}
          </span>
        </div>
        {days_left != null && days_left <= 3 && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold animate-pulse">
            ⚠️ Closing soon
          </span>
        )}
      </div>

      {}
      <div className="flex items-center gap-2 pt-1">
        <a href={official_link} target="_blank" rel="noopener noreferrer"
          className="flex-1 btn-primary text-xs py-2 text-center flex items-center justify-center gap-1.5">
          Apply Now <ExternalLink size={12} />
        </a>
        <button onClick={handleSave} disabled={saving || saved}
          className={`p-2 rounded-xl border transition-all ${
            saved ? 'border-green-300 bg-green-50 text-green-600' : 'border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600 hover:bg-sky-50'
          }`}>
          {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
        </button>
      </div>
    </div>
  )
}