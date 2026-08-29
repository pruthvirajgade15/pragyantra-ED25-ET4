import { useState } from 'react'
import { ExternalLink, Bookmark, BookmarkCheck, Calendar, IndianRupee, MapPin, Tag, GraduationCap, Eye } from 'lucide-react'
import { scholarshipAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import ScholarshipDetailModal from './ScholarshipDetailModal'

export default function ScholarshipCard({ scholarship, showMatchScore = false, onSaved }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  if (!scholarship) return null

  const {
    id, name, provider, amount, deadline, category, state, field,
    official_link, description, source, match_score, days_left,
    win_probability
  } = scholarship

  const handleSave = async (e) => {
    e?.stopPropagation()
    if (!user) {
      toast.error('Please login to save scholarships')
      return
    }
    setSaving(true)
    try {
      await scholarshipAPI.save(id, match_score || 0)
      setSaved(true)
      toast.success('Scholarship saved!')
      onSaved?.()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const formatDeadline = (d) => {
    if (!d) return 'Open / Ongoing'
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const isUrgent = days_left != null && days_left <= 7
  const isCritical = days_left != null && days_left <= 3

  return (
    <>
      <div 
        onClick={() => setModalOpen(true)}
        className={`surface-card p-5 flex flex-col justify-between group cursor-pointer hover:-translate-y-1 transition-all duration-200 ${
          isCritical 
            ? 'border-l-4 border-l-rose-500 hover:border-l-rose-600' 
            : isUrgent 
              ? 'border-l-4 border-l-amber-500 hover:border-l-amber-600' 
              : ''
        }`}
      >
        <div className="space-y-3">
          
          {/* Header Row: Provider Badge + Match Score / Save */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold tracking-wide text-blue-700 bg-blue-50/80 px-2.5 py-0.5 rounded-md border border-blue-100/80">
                {provider || 'Verified Organization'}
              </span>
              {source && (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                  {source}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {showMatchScore && match_score != null && (
                <span className={`match-badge ${match_score >= 75 ? '' : match_score >= 50 ? 'medium' : 'low'}`}>
                  {Math.round(match_score)}% Match
                </span>
              )}
              <button 
                onClick={handleSave} 
                disabled={saving || saved}
                className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                  saved 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200'
                }`}
                title={saved ? 'Saved' : 'Save Scholarship'}
              >
                {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-display font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            {description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Key Benefit & Deadline Block */}
          <div className="flex items-center justify-between py-2 border-y border-slate-100 gap-2">
            <div className="flex items-center gap-1 text-emerald-700 font-display font-bold text-sm">
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
                <IndianRupee size={12} /> {amount}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Calendar size={13} className={isUrgent ? 'text-amber-500' : 'text-slate-400'} />
              <span className={`font-medium ${isUrgent ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                {days_left != null && days_left <= 0 ? (
                  <span className="text-rose-600 font-semibold">Closed</span>
                ) : days_left != null && days_left <= 7 ? (
                  <span className="text-amber-700 font-semibold">{days_left}d left</span>
                ) : (
                  formatDeadline(deadline)
                )}
              </span>
            </div>
          </div>

          {/* Tag Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {category && category !== 'All' && (
              <span className="tag-pill">
                <Tag size={10} className="text-slate-400" /> {category}
              </span>
            )}
            {state && state !== 'All India' && state !== 'All' && (
              <span className="tag-pill">
                <MapPin size={10} className="text-slate-400" /> {state}
              </span>
            )}
            {field && field !== 'All' && (
              <span className="tag-pill">
                <GraduationCap size={10} className="text-slate-400" /> {field}
              </span>
            )}
            {win_probability != null && (
              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-md border border-emerald-200/80">
                Win Prob: {Math.round(win_probability)}%
              </span>
            )}
          </div>

        </div>

        {/* Action Button Row */}
        <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setModalOpen(true) }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Eye size={13} /> View Eligibility
          </button>

          <a 
            href={official_link} 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-xs"
          >
            Apply <ExternalLink size={11} />
          </a>
        </div>

      </div>

      {/* Modal */}
      <ScholarshipDetailModal 
        scholarship={scholarship} 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />
    </>
  )
}