import { useState, useEffect } from 'react'
import { FileText, Copy, Check, Trash2, Sparkles, Languages, Download, Clock, ArrowRight, History } from 'lucide-react'
import { essayAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import toast from 'react-hot-toast'

const POPULAR_SCHOLARSHIPS = [
  'NSP Post-Matric Scholarship', 'AICTE Pragati Scholarship for Girls', 
  'Buddy4Study Merit Scholarship', 'Dhirubhai Ambani Reliance Scholarship', 
  'LIC Golden Jubilee Scholarship', 'Kotak Kanya STEM Scholarship',
  'Central Sector Scheme of Scholarships', 'MahaDBT State Merit Scholarship',
]

export default function EssayPage() {
  const { lang } = useAuth()
  const { t } = useTranslation(lang)
  const [form, setForm] = useState({
    scholarship_name: '', 
    language: lang || 'en', 
    word_count: 300,
    personal_story: '', 
    goals: '', 
    achievements: '',
  })
  const [essay, setEssay] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [drafts, setDrafts] = useState([])
  const [showDraftsModal, setShowDraftsModal] = useState(false)

  useEffect(() => { 
    loadDrafts() 
  }, [])

  const loadDrafts = async () => {
    try {
      const { data } = await essayAPI.drafts()
      setDrafts(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleGenerate = async (e) => {
    e?.preventDefault()
    if (!form.scholarship_name.trim()) { 
      toast.error('Please enter or select a scholarship name')
      return 
    }
    setLoading(true)
    try {
      const { data } = await essayAPI.generate(form)
      setEssay(data.essay)
      toast.success('Scholarship essay generated! ✨')
      loadDrafts()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!essay) return
    await navigator.clipboard.writeText(essay)
    setCopied(true)
    toast.success('Copied essay to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!essay) return
    const element = document.createElement("a")
    const file = new Blob([essay], {type: 'text/plain;charset=utf-8'})
    element.href = URL.createObjectURL(file)
    element.download = `${form.scholarship_name.replace(/\s+/g, '_')}_Essay.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Downloaded as text file')
  }

  const handleDeleteDraft = async (id, e) => {
    e?.stopPropagation()
    await essayAPI.delete(id)
    loadDrafts()
    toast.success('Draft removed')
  }

  const loadDraft = async (id) => {
    try {
      const { data } = await essayAPI.getDraft(id)
      setEssay(data.content)
      setForm(f => ({ ...f, scholarship_name: data.title.replace('Essay for ', '') }))
      setShowDraftsModal(false)
      toast.success('Loaded saved draft')
    } catch (e) {
      toast.error('Failed to load draft')
    }
  }

  const currentWords = essay.trim() ? essay.trim().split(/\s+/).length : 0

  return (
    <div className={`page-enter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200 mb-2">
            <Sparkles size={13} /> AI Statement of Purpose & Essay Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Scholarship Essay Studio
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate tailored application essays and statements of purpose in English and Hindi customized to your personal background.
          </p>
        </div>

        {/* Drafts History Button */}
        <button
          onClick={() => setShowDraftsModal(true)}
          className="surface-card px-4 py-2 text-xs font-semibold text-slate-700 hover:border-purple-300 hover:text-purple-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <History size={15} /> Saved Drafts ({drafts.length})
        </button>
      </div>

      {/* Split-Screen Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Config Panel (5 cols) */}
        <form onSubmit={handleGenerate} className="lg:col-span-5 surface-card p-6 space-y-5 bg-white">
          <h2 className="text-base font-bold text-slate-900 font-display pb-3 border-b border-slate-100 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" /> Essay Configuration
          </h2>

          {/* Scholarship Name Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Target Scholarship Name *
            </label>
            <input 
              type="text" 
              value={form.scholarship_name}
              onChange={e => setForm(f => ({ ...f, scholarship_name: e.target.value }))}
              placeholder="e.g. AICTE Pragati Scholarship for Girls" 
              required
              className="input-field"
            />
            
            {/* Quick Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_SCHOLARSHIPS.slice(0, 4).map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, scholarship_name: name }))}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors truncate max-w-[200px]"
                >
                  + {name}
                </button>
              ))}
            </div>
          </div>

          {/* Language & Word Count Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Language
              </label>
              <select 
                value={form.language} 
                onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                className="input-field"
              >
                <option value="en">English (Professional)</option>
                <option value="hi">हिंदी (Devanagari)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Target Words
                </label>
                <span className="text-xs font-bold text-blue-600">{form.word_count} words</span>
              </div>
              <input 
                type="range" 
                min="150" 
                max="600" 
                step="50"
                value={form.word_count}
                onChange={e => setForm(f => ({ ...f, word_count: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Personal Background & Narrative Inputs */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Personal Story / Background (Optional)
            </label>
            <textarea 
              rows="3"
              value={form.personal_story}
              onChange={e => setForm(f => ({ ...f, personal_story: e.target.value }))}
              placeholder="e.g. First generation college student from rural Maharashtra, passionate about renewable energy..."
              className="input-field text-xs resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Career Goals (Optional)
            </label>
            <textarea 
              rows="2"
              value={form.goals}
              onChange={e => setForm(f => ({ ...f, goals: e.target.value }))}
              placeholder="e.g. Aiming to work in AI research and give back to underrepresented rural schools..."
              className="input-field text-xs resize-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Sparkles size={16} className="animate-spin" /> Drafting Personalized Essay...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles size={16} /> Generate Essay with AI
              </span>
            )}
          </button>
        </form>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7 surface-card p-6 space-y-4 bg-white flex flex-col justify-between min-h-[500px]">
          
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm font-display">Generated Statement</span>
                {essay && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {currentWords} words
                  </span>
                )}
              </div>

              {essay && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCopy}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                  >
                    <Download size={14} /> Download TXT
                  </button>
                </div>
              )}
            </div>

            {/* Essay Content Area */}
            {loading ? (
              <div className="space-y-3 py-12">
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-4 w-full" />
              </div>
            ) : essay ? (
              <div className="prose prose-slate max-w-none text-sm leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-5 rounded-xl border border-slate-100 font-serif text-slate-800 selection:bg-blue-100">
                {essay}
              </div>
            ) : (
              <div className="py-20 text-center space-y-3 text-slate-400">
                <FileText size={40} className="mx-auto opacity-40 text-slate-300" />
                <h3 className="text-sm font-bold text-slate-600">No essay generated yet</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Fill in the scholarship details on the left and click "Generate Essay with AI" to create your tailored draft.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Advisory */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>AI drafts should be reviewed and personalized before final portal submission.</span>
          </div>

        </div>

      </div>

      {/* Saved Drafts History Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <History size={18} className="text-purple-600" /> Saved Essay Drafts
              </h3>
              <button onClick={() => setShowDraftsModal(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>

            <div className="overflow-y-auto space-y-2.5 flex-1 text-sm">
              {drafts.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">No saved drafts found</p>
              ) : (
                drafts.map(d => (
                  <div 
                    key={d.id}
                    onClick={() => loadDraft(d.id)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 cursor-pointer transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-slate-800 text-xs group-hover:text-blue-600 truncate">{d.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{d.preview}</p>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>{d.word_count} words</span>
                        <span>•</span>
                        <span>{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button 
                      onClick={(e) => handleDeleteDraft(d.id, e)}
                      className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50"
                      title="Delete draft"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button onClick={() => setShowDraftsModal(false)} className="btn-secondary py-1.5 px-4 text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}