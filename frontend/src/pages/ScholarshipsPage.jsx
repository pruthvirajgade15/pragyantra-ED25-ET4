import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ArrowUpDown, Grid, List, Check, RotateCcw, Filter, Sparkles } from 'lucide-react'
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
    <div className="surface-card p-5 space-y-4">
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-28" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-5 w-3/4" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-8 w-1/3 rounded-full" />
      <div className="pt-2 flex gap-2">
        <div className="skeleton h-7 w-20 rounded-md" />
        <div className="skeleton h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}

export default function ScholarshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { lang, user } = useAuth()
  const { t } = useTranslation(lang)

  const [scholarships, setScholarships] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter states initialized from URL params if present
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'All')
  const [state, setState] = useState(searchParams.get('state') || 'All')
  const [field, setField] = useState(searchParams.get('field') || 'All')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Fetch scholarships
  const fetchScholarships = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      if (state !== 'All') params.state = state
      if (field !== 'All') params.field = field

      const { data } = await scholarshipAPI.list(params)
      
      // Sort logic
      let sorted = [...data]
      if (sortBy === 'deadline') {
        sorted.sort((a, b) => {
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline) - new Date(b.deadline)
        })
      } else if (sortBy === 'name') {
        sorted.sort((a, b) => a.name.localeCompare(b.name))
      }

      setScholarships(sorted)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [search, category, state, field, sortBy])

  useEffect(() => {
    const timer = setTimeout(fetchScholarships, 250)
    return () => clearTimeout(timer)
  }, [fetchScholarships])

  const clearFilters = () => {
    setCategory('All')
    setState('All')
    setField('All')
    setSearch('')
    setSearchParams({})
  }

  const hasActiveFilters = category !== 'All' || state !== 'All' || field !== 'All' || search.trim() !== ''

  return (
    <div className={`page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>
      
      {/* Header Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Scholarship Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Discover verified scholarships from Central Government (NSP), State Portals & Private Foundations.
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {scholarships.length} Schemes Available
          </span>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block surface-card p-5 space-y-6 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="font-bold text-slate-800 text-sm font-display flex items-center gap-2">
              <Filter size={15} className="text-blue-600" /> Filters
            </span>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="text-xs text-rose-600 hover:underline font-semibold flex items-center gap-1"
              >
                <RotateCcw size={12} /> Clear all
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Social Category
            </label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)} 
              className="input-field text-xs py-2"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
          </div>

          {/* State / Domicile Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              State / Domicile
            </label>
            <select 
              value={state} 
              onChange={e => setState(e.target.value)} 
              className="input-field text-xs py-2"
            >
              {STATES.map(s => <option key={s} value={s}>{s === 'All' ? 'All States (National)' : s}</option>)}
            </select>
          </div>

          {/* Field of Study */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Field of Study
            </label>
            <select 
              value={field} 
              onChange={e => setField(e.target.value)} 
              className="input-field text-xs py-2"
            >
              {FIELDS.map(f => <option key={f} value={f}>{f === 'All' ? 'All Streams' : f}</option>)}
            </select>
          </div>

          {/* Quick Help Tip */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Sparkles size={13} className="text-blue-600" /> Need automatic matching?
            </p>
            <p className="text-slate-600 text-[11px]">
              Complete your profile on the dashboard to calculate exact match scores and AI win probability.
            </p>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-5">
          
          {/* Search & Action Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={search} 
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search scholarship name, provider, keyword..."
                className="input-field pl-10 pr-9 text-sm"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Mobile Filter Trigger Button */}
            <button 
              onClick={() => setMobileFilterOpen(true)}
              className={`lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold ${
                hasActiveFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal size={15} /> Filters {hasActiveFilters && '•'}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-xs py-2 w-auto bg-white"
              >
                <option value="default">Sort: Default</option>
                <option value="deadline">Sort: Closing Soonest</option>
                <option value="name">Sort: Alphabetical</option>
              </select>

              {/* View Switcher */}
              <div className="hidden sm:flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="Grid View"
                >
                  <Grid size={15} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-xs text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                  title="List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>

          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-slate-400 font-medium">Active:</span>
              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                  Category: {category}
                  <button onClick={() => setCategory('All')}><X size={13} /></button>
                </span>
              )}
              {state !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                  State: {state}
                  <button onClick={() => setState('All')}><X size={13} /></button>
                </span>
              )}
              {field !== 'All' && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                  Field: {field}
                  <button onClick={() => setField('All')}><X size={13} /></button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                  Search: "{search}"
                  <button onClick={() => setSearch('')}><X size={13} /></button>
                </span>
              )}
              <button 
                onClick={clearFilters}
                className="text-xs text-slate-500 hover:text-rose-600 font-semibold ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Cards Grid / List */}
          {loading ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : scholarships.length > 0 ? (
            <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
              {scholarships.map((s) => (
                <ScholarshipCard key={s.id} scholarship={s} onSaved={fetchScholarships} />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="surface-card p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search size={26} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900 font-display">No scholarships match your filters</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Try adjusting your search terms or clearing specific category and state filters.
                </p>
              </div>
              <button onClick={clearFilters} className="btn-secondary text-xs py-2 px-4">
                Reset All Filters
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Mobile Slide-Out Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-slate-900/60 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="w-full max-w-xs bg-white h-full ml-auto p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between animate-slide-up">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                  <Filter size={16} className="text-blue-600" /> Filters
                </h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Filter Controls */}
              <div className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Category
                  </label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="input-field text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    State
                  </label>
                  <select value={state} onChange={e => setState(e.target.value)} className="input-field text-sm">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Field of Study
                  </label>
                  <select value={field} onChange={e => setField(e.target.value)} className="input-field text-sm">
                    {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="w-full btn-primary py-2.5 text-sm"
              >
                Apply Filters
              </button>
              {hasActiveFilters && (
                <button 
                  onClick={() => { clearFilters(); setMobileFilterOpen(false) }}
                  className="w-full btn-secondary py-2 text-xs text-rose-600"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}