import { useState } from 'react'
import { X, ExternalLink, IndianRupee, Calendar, MapPin, Tag, GraduationCap, CheckCircle2, AlertTriangle, ShieldCheck, Bookmark, BookmarkCheck, FileText } from 'lucide-react'
import { scholarshipAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ScholarshipDetailModal({ scholarship, isOpen, onClose, onSaved }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!isOpen || !scholarship) return null

  const {
    id, name, provider, amount, deadline, eligibility, category,
    state, field, official_link, description, source, match_score,
    win_probability, days_left
  } = scholarship

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save scholarships')
      return
    }
    setSaving(true)
    try {
      await scholarshipAPI.save(id, match_score || 0)
      setSaved(true)
      toast.success('Scholarship saved to your dashboard!')
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
      weekday: 'long', day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const isUrgent = days_left != null && days_left <= 7

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                {provider || 'Verified Provider'}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Source: {source || 'Official'}
              </span>
              {match_score != null && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {Math.round(match_score)}% Match
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug font-display">
              {name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-xs font-semibold text-emerald-700 block mb-1">Scholarship Amount</span>
              <span className="text-base font-bold text-emerald-900 font-display flex items-center gap-1">
                <IndianRupee size={16} />{amount}
              </span>
            </div>

            <div className={`p-3.5 rounded-xl border ${isUrgent ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <span className={`text-xs font-semibold block mb-1 ${isUrgent ? 'text-amber-800' : 'text-slate-600'}`}>
                Application Deadline
              </span>
              <span className={`text-sm font-bold block ${isUrgent ? 'text-amber-900' : 'text-slate-900'}`}>
                {formatDeadline(deadline)}
              </span>
              {days_left != null && (
                <span className={`text-xs font-semibold mt-0.5 block ${isUrgent ? 'text-amber-700' : 'text-slate-500'}`}>
                  {days_left === 0 ? 'Closing Today / Closed' : `${days_left} days remaining`}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 col-span-2 sm:col-span-1">
              <span className="text-xs font-semibold text-blue-700 block mb-1">Target Field</span>
              <span className="text-sm font-bold text-blue-900 block truncate">
                {field || 'All Streams'}
              </span>
              <span className="text-xs text-blue-600 mt-0.5 block truncate">
                {state || 'All India'}
              </span>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800 font-display text-sm">About This Scholarship</h4>
              <p className="text-slate-600 leading-relaxed text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                {description}
              </p>
            </div>
          )}

          {/* Eligibility Criteria Matrix */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-800 font-display text-sm">Eligibility Criteria</h4>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
                <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Category</span>
                  <span className="text-xs font-semibold text-slate-700">{category || 'All Categories'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
                <MapPin size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Location / State</span>
                  <span className="text-xs font-semibold text-slate-700">{state || 'All India'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
                <GraduationCap size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Academic Eligibility</span>
                  <span className="text-xs font-semibold text-slate-700">{eligibility || 'Check official guidelines'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-white shadow-xs">
                <Tag size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Field of Study</span>
                  <span className="text-xs font-semibold text-slate-700">{field || 'All Fields'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Required Documents Checklist */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 font-display text-sm flex items-center gap-1.5">
              <FileText size={16} className="text-slate-500" />
              Standard Required Documents Checklist
            </h4>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Aadhar Card / Valid Photo ID
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Previous Year Academic Marksheet
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Family Income Certificate
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Caste / Category Certificate (if applicable)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> College Admission / Fee Receipt
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Student Active Bank Passbook / IFSC
              </li>
            </ul>
          </div>

          {/* Trust & Safe Application Notice */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-800">
            <ShieldCheck size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Official Direct Link:</strong> You will be directed directly to the verified official portal (<code className="text-blue-700 font-mono">{provider}</code>) to submit your application.
            </p>
          </div>

        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button 
            onClick={handleSave} 
            disabled={saving || saved}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              saved 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {saved ? 'Saved in Dashboard' : 'Save to Dashboard'}
          </button>

          <a 
            href={official_link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto btn-primary px-6 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            Apply on Official Portal <ExternalLink size={15} />
          </a>
        </div>

      </div>
    </div>
  )
}
