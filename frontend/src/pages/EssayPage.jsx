import { useState, useEffect } from 'react'
import { FileText, Copy, Check, Trash2, ChevronDown, ChevronUp, Sparkles, Languages } from 'lucide-react'
import { essayAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import toast from 'react-hot-toast'

const POPULAR_SCHOLARSHIPS = [
  'NSP Post-Matric Scholarship', 'AICTE Pragati Scholarship', 'Buddy4Study Scholarship',
  'Dhirubhai Ambani Scholarship', 'Sitaram Jindal Foundation Scholarship',
  'Central Sector Scheme Scholarship', 'LIC Golden Jubilee Scholarship',
  'Kotak Kanya Scholarship', 'Maharashtra State Merit Scholarship',
]

export default function EssayPage() {
  const { lang }          = useAuth()
  const { t }             = useTranslation(lang)
  const [form, setForm]   = useState({
    scholarship_name: '', language: lang, word_count: 300,
    personal_story: '', goals: '', achievements: '',
  })
  const [essay, setEssay]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [copied, setCopied]     = useState(false)
  const [drafts, setDrafts]     = useState([])
  const [showDrafts, setShowDrafts] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => { loadDrafts() }, [])

  const loadDrafts = async () => {
    try {
      const { data } = await essayAPI.drafts()
      setDrafts(data)
    } catch (e) {}
  }

  const handleGenerate = async () => {
    if (!form.scholarship_name.trim()) { toast.error('Please enter a scholarship name'); return }
    setLoading(true)
    setEssay('')
    try {
      const { data } = await essayAPI.generate(form)
      setEssay(data.essay)
      toast.success('Essay generated! ✨')
      loadDrafts()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Generation failed. Check API key.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(essay)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeleteDraft = async (id) => {
    await essayAPI.delete(id)
    loadDrafts()
    toast.success('Draft deleted')
  }

  const loadDraft = async (id) => {
    const { data } = await essayAPI.getDraft(id)
    setEssay(data.content)
    setForm(f => ({ ...f, scholarship_name: data.title.replace('Essay for ', '') }))
    setShowDrafts(false)
  }

  return (
    <div className={`page-enter max-w-5xl mx-auto px-4 sm:px-6 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 text-sm font-semibold text-violet-600 mb-3">
          <Sparkles size={14} /> AI-Powered
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg">
            <FileText size={22} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">{t('essay_title')}</h1>
        </div>
        <p className="text-slate-500">{t('essay_subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-5">
          <div className="glass-card p-6 space-y-5">
            {/* Scholarship Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('scholarship_name')} *</label>
              <div className="relative group overflow-hidden rounded-xl bg-white focus-within:ring-2 focus-within:ring-sky-500/30">
                <input
                  type="text"
                  value={form.scholarship_name}
                  onChange={e => setForm({ ...form, scholarship_name: e.target.value })}
                  className="input-field border-transparent shadow-none focus:ring-0 pr-10"
                  placeholder="e.g., NSP Post-Matric Scholarship"
                />
                <div className="absolute inset-y-0 right-0 w-10 border-l border-slate-100 flex items-center justify-center bg-slate-50 opacity-80 hover:opacity-100 transition-opacity">
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    value=""
                    onChange={e => setForm({ ...form, scholarship_name: e.target.value })}
                  >
                    <option value="" disabled>Browse popular...</option>
                    {POPULAR_SCHOLARSHIPS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={16} className="text-slate-600 pointer-events-none" />
                </div>
                <div className="absolute inset-0 rounded-xl border border-slate-300 pointer-events-none border-overlay" />
              </div>
            </div>

            {/* Language + Word Count */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <Languages size={13} className="inline mr-1" />{t('language_select')}
                </label>
                <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="input-field">
                  <option value="en">🇺🇸 English</option>
                  <option value="hi">🇮🇳 हिंदी</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('word_count')}</label>
                <select value={form.word_count} onChange={e => setForm({ ...form, word_count: parseInt(e.target.value) })} className="input-field">
                  <option value={200}>200 words</option>
                  <option value={300}>300 words</option>
                  <option value={500}>500 words</option>
                  <option value={700}>700 words</option>
                </select>
              </div>
            </div>

            {/* Advanced toggle */}
            <button type="button" onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-sky-600 font-medium hover:text-sky-800 transition-colors">
              {showAdvanced ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              {showAdvanced ? 'Hide' : 'Add'} personal details (improves quality)
            </button>

            {showAdvanced && (
              <div className="space-y-4 animate-slide-up">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('your_story')}</label>
                  <textarea rows={3} value={form.personal_story}
                    onChange={e => setForm({ ...form, personal_story: e.target.value })}
                    className="input-field resize-none text-sm"
                    placeholder="e.g., I am the first in my family to attend college..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('your_goals')}</label>
                  <textarea rows={2} value={form.goals}
                    onChange={e => setForm({ ...form, goals: e.target.value })}
                    className="input-field resize-none text-sm"
                    placeholder="e.g., I want to become a software engineer and build apps for rural India..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('achievements')}</label>
                  <textarea rows={2} value={form.achievements}
                    onChange={e => setForm({ ...form, achievements: e.target.value })}
                    className="input-field resize-none text-sm"
                    placeholder="e.g., School topper, 92% in 12th, state-level chess player..." />
                </div>
              </div>
            )}

            <button onClick={handleGenerate} disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('generating')}
                </>
              ) : (
                <><Sparkles size={18} />{t('generate_essay')}</>
              )}
            </button>
          </div>

          {/* Drafts */}
          <div className="glass-card p-5">
            <button type="button" onClick={() => setShowDrafts(!showDrafts)}
              className="flex items-center justify-between w-full">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <FileText size={16} /> {t('my_drafts')} ({drafts.length})
              </span>
              {showDrafts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showDrafts && (
              <div className="mt-3 space-y-2 animate-slide-up">
                {drafts.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">No drafts yet</p>
                ) : drafts.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <button onClick={() => loadDraft(d.id)} className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-700 line-clamp-1">{d.title}</p>
                      <p className="text-xs text-slate-400">{d.language === 'hi' ? 'हिंदी' : 'English'} • {d.word_count} words</p>
                    </button>
                    <button onClick={() => handleDeleteDraft(d.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Essay output */}
        <div className="glass-card p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-slate-700">Generated Essay</h3>
            {essay && (
              <button type="button" onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? 'Copied!' : t('copy_essay')}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
                <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-500" />
              </div>
              <p className="text-slate-500 text-sm animate-pulse">Gemini AI is crafting your essay...</p>
            </div>
          ) : essay ? (
            <div className={`flex-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[600px] pr-1 ${form.language === 'hi' ? 'font-hindi text-base' : ''}`}>
              {essay}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <FileText size={56} className="mb-3" />
              <p className="text-sm">Your essay will appear here</p>
              <p className="text-xs mt-1">Fill the form and click Generate ✨</p>
            </div>
          )}

          {essay && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span>{essay.split(' ').length} words</span>
              <span>{form.language === 'hi' ? '🇮🇳 हिंदी' : '🇺🇸 English'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
