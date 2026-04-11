import { useState, useEffect, useCallback } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { scholarshipAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import ScholarshipCard from '../components/ScholarshipCard'

const CATEGORIES = ['All', 'SC', 'ST', 'OBC', 'General', 'EWS', 'Minority']
const STATES = ['All', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar',
                'West Bengal', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Delhi', 'Punjab',
                'Andhra Pradesh', 'Telangana', 'Kerala', 'Northeast']
const FIELDS = ['All', 'Engineering', 'Medical', 'Science', 'Arts', 'Commerce',
                'Computer Science', 'STEM', 'Research', 'Professional Courses']

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="skeleton h-4 w-3/4" /><div className="skeleton h-3 w-1/2" />
      <div className="skeleton h-3 w-full" />
      <div className="flex gap-2"><div className="skeleton h-6 w-20 rounded-full" /><div className="skeleton h-6 w-16 rounded-full" /></div>
      <div className="skeleton h-8 w-full rounded-xl" />
    </div>
  )
}

export default function ScholarshipsPage() {
  const { lang }          = useAuth()
  const { t }             = useTranslation(lang)
  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [category, setCategory]         = useState('All')
  const [state, setState]               = useState('All')
  const [field, setField]               = useState('All')
  const [showFilters, setShowFilters]   = useState(false)

  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search)              params.search   = search
      if (category !== 'All')  params.category = category
      if (state !== 'All')     params.state    = state
      if (field !== 'All')     params.field    = field
      const { data } = await scholarshipAPI.list(params)
      setScholarships(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, category, state, field])

  useEffect(() => {
    const timer = setTimeout(fetchScholarships, 300)
    return () => clearTimeout(timer)
  }, [fetchScholarships])

  const clearFilters = () => { setCategory('All'); setState('All'); setField('All'); setSearch('') }
  const hasFilters = category !== 'All' || state !== 'All' || field !== 'All' || search

  return (
    <div className={`page-enter max-w-7xl mx-auto px-4 sm:px-6 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>
      {}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 text-sm font-semibold text-sky-600 mb-3">
          <Search size={14} /> Browse & Filter
        </div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">{t('all_scholarships')}</h1>
        <p className="text-slate-500 mt-1.5">
          Explore <span className="font-semibold text-sky-600">{scholarships.length}</span> scholarships from NSP, AICTE, Buddy4Study & more
        </p>
      </div>

      {}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all ${
            showFilters || hasFilters ? 'bg-sky-50 border-sky-300 text-sky-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}>
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="w-2 h-2 rounded-full bg-sky-500" />}
        </button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-all">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {}
      {showFilters && (
        <div className="glass-card p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('filter_category')}</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm py-2">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('filter_state')}</label>
            <select value={state} onChange={e => setState(e.target.value)} className="input-field text-sm py-2">
              {STATES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{t('filter_field')}</label>
            <select value={field} onChange={e => setField(e.target.value)} className="input-field text-sm py-2">
              {FIELDS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
        </div>
      )}

      {}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : scholarships.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scholarships.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
          <Search size={48} className="mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{t('no_results')}</p>
          <button onClick={clearFilters} className="btn-secondary mt-4">Clear Filters</button>
        </div>
      )}
    </div>
  )
}