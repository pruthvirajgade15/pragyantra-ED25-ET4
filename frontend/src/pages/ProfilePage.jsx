import { useState, useEffect } from 'react'
import { User, Save, CheckCircle } from 'lucide-react'
import { profileAPI } from '../utils/api'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Bihar', 'West Bengal',
  'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Delhi', 'Punjab', 'Andhra Pradesh', 'Telangana',
  'Kerala', 'Odisha', 'Jharkhand', 'Chhattisgarh', 'Assam', 'Himachal Pradesh', 'Uttarakhand']

const FIELDS = ['Engineering', 'Medical/MBBS', 'Science', 'Arts/Humanities', 'Commerce',
  'Computer Science', 'Law', 'Management/MBA', 'Architecture', 'Agriculture', 'Pharmacy', 'Education']

const InputField = ({ label, name, value, onChange, type = 'text', placeholder = '', required = false, children }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children || (
      <input type={type} name={name} value={value} onChange={onChange}
        className="input-field" placeholder={placeholder} required={required} />
    )}
  </div>
)

export default function ProfilePage() {
  const { lang } = useAuth()
  const { t } = useTranslation(lang)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: '', annual_income: '', percentage: '',
    category: 'General', state: 'Maharashtra', field_of_study: 'Engineering',
    gender: 'Male', religion: '', disability: false, is_minority: false,
    current_year: 1, college: '', phone: '', dob: '',
  })

  useEffect(() => {
    profileAPI.get().then(({ data }) => {
      if (data) setForm(prev => ({ ...prev, ...data }))
    }).catch(() => { })
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.annual_income || !form.percentage) {
      toast.error('Please fill all required fields')
      return
    }
    setLoading(true)
    try {
      await profileAPI.save({
        ...form,
        annual_income: parseFloat(form.annual_income),
        percentage: parseFloat(form.percentage),
        current_year: parseInt(form.current_year),
      })
      setSaved(true)
      toast.success(t('profile_saved'))
      setTimeout(() => { setSaved(false); navigate('/dashboard') }, 1500)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page-enter max-w-3xl mx-auto px-4 sm:px-6 py-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>
      {}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-800">{t('profile_title')}</h1>
          <p className="text-slate-500 text-sm">{t('profile_subtitle')}</p>
        </div>
      </div>

      {}
      <div className="glass-card p-4 mb-6 bg-sky-50 border border-sky-100">
        <p className="text-sm text-sky-700 flex items-start gap-2">
          <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
          Your profile helps us match you to scholarships with <strong>95%+ accuracy</strong>. All data is private and secure.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100">
            👤 Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label={t('full_name')} name="full_name" value={form.full_name} onChange={handleChange} placeholder="Priya Sharma" required />
            <InputField label={t('phone')} name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" />
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {t('gender')} <span className="text-red-400">*</span>
              </label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            {}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 align-middle">
                Date of Birth
              </label>
              <div className="grid grid-cols-3 gap-3">
                <select className="input-field py-3 bg-slate-50 hover:border-sky-300 transition-colors shadow-inner text-slate-700 cursor-pointer"
                  value={form.dob ? form.dob.split('-')[2] : ''}
                  onChange={(e) => {
                    const parts = (form.dob || 'YYYY-MM-DD').split('-');
                    parts[2] = String(e.target.value).padStart(2, '0');
                    if (parts[0] === 'YYYY') parts[0] = '2005';
                    if (parts[1] === 'MM') parts[1] = '01';
                    setForm({ ...form, dob: parts.join('-') });
                  }}>
                  <option value="" disabled>Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                    const strVal = String(d).padStart(2, '0');
                    return <option key={strVal} value={strVal}>{d}</option>;
                  })}
                </select>

                <select className="input-field py-3 bg-slate-50 hover:border-sky-300 transition-colors shadow-inner text-slate-700 cursor-pointer"
                  value={form.dob ? form.dob.split('-')[1] : ''}
                  onChange={(e) => {
                    const parts = (form.dob || 'YYYY-MM-DD').split('-');
                    parts[1] = String(e.target.value).padStart(2, '0');
                    if (parts[0] === 'YYYY') parts[0] = '2005';
                    if (parts[2] === 'DD') parts[2] = '01';
                    setForm({ ...form, dob: parts.join('-') });
                  }}>
                  <option value="" disabled>Month</option>
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => {
                    const strVal = String(i + 1).padStart(2, '0');
                    return <option key={strVal} value={strVal}>{m}</option>;
                  })}
                </select>

                <select className="input-field py-3 bg-slate-50 hover:border-sky-300 transition-colors shadow-inner text-slate-700 cursor-pointer"
                  value={form.dob ? form.dob.split('-')[0] : ''}
                  onChange={(e) => {
                    const parts = (form.dob || 'YYYY-MM-DD').split('-');
                    parts[0] = e.target.value;
                    if (parts[1] === 'MM') parts[1] = '01';
                    if (parts[2] === 'DD') parts[2] = '01';
                    setForm({ ...form, dob: parts.join('-') });
                  }}>
                  <option value="" disabled>Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - 10 - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100">
            🎓 Academic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label={t('percentage')} name="percentage" type="number" placeholder="85.5" required>
              <div className="relative">
                <input type="number" name="percentage" value={form.percentage} onChange={handleChange}
                  className="input-field pr-8" placeholder="85.5" min="0" max="100" step="0.1" required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
              </div>
            </InputField>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t('current_year')} *</label>
              <select name="current_year" value={form.current_year} onChange={handleChange} className="input-field">
                <option value={1}>1st Year</option><option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option><option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Field of Study *</label>
              <select name="field_of_study" value={form.field_of_study} onChange={handleChange} className="input-field">
                {FIELDS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <InputField label={t('college')} name="college" value={form.college} onChange={handleChange} placeholder="Modern College of Engineering, Pune" />
          </div>
        </div>

        {}
        <div className="glass-card p-6">
          <h2 className="font-display font-semibold text-slate-800 mb-5 pb-3 border-b border-slate-100">
            💰 Financial & Social Background
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <InputField label={t('annual_income')} name="annual_income" required>
              <div className="flex flex-col gap-2">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/20 overflow-hidden transition-all shadow-inner">
                  <div className="px-4 py-3 bg-slate-100/80 border-r border-slate-200 text-slate-600 font-bold">
                    ₹
                  </div>
                  <input type="number" name="annual_income" value={form.annual_income} onChange={handleChange}
                    className="w-full px-4 py-3 bg-transparent text-slate-700 outline-none font-medium placeholder:text-slate-400" placeholder="150000" required />
                </div>
                {}
                <div className="flex flex-wrap gap-2">
                  {[100000, 250000, 500000, 800000].map(amount => (
                    <button key={amount} type="button"
                      onClick={() => setForm({ ...form, annual_income: amount })}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-100">
                      ₹{amount / 100000} Lakh
                    </button>
                  ))}
                  <button type="button" onClick={() => setForm({ ...form, annual_income: '' })} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                    Clear
                  </button>
                </div>
              </div>
            </InputField>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field">
                {['General', 'SC', 'ST', 'OBC', 'EWS', 'Minority'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">State *</label>
              <select name="state" value={form.state} onChange={handleChange} className="input-field">
                {STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {}
            <div className="col-span-1 sm:col-span-2 space-y-4">
              {}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-semibold text-slate-700 block text-sm">Disability Status</span>
                    <span className="text-xs text-slate-500">Are you a person with disability?</span>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({ ...form, disability: true })} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${form.disability ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Yes</button>
                    <button type="button" onClick={() => setForm({ ...form, disability: false })} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!form.disability ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>No</button>
                  </div>
                </div>
                {form.disability && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-up grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Disability Percentage (%)" name="disability_percentage" type="number" placeholder="40" onChange={() => { }} />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Verification</label>
                      <input type="text" className="input-field bg-slate-50 text-slate-500" value="Certificate required for >40%" readOnly />
                    </div>
                  </div>
                )}
              </div>

              {}
              <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-semibold text-slate-700 block text-sm">Minority Community</span>
                    <span className="text-xs text-slate-500">Do you belong to a recognized minority?</span>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button type="button" onClick={() => setForm({ ...form, is_minority: true })} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${form.is_minority ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Yes</button>
                    <button type="button" onClick={() => setForm({ ...form, is_minority: false })} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${!form.is_minority ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>No</button>
                  </div>
                </div>
                {form.is_minority && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-slide-up grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Confirm Religion" name="religion" value={form.religion || ''} onChange={handleChange} placeholder="Muslim, Christian, Sikh, Jain..." />
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Check</label>
                      <input type="text" className="input-field bg-slate-50 text-slate-500" value="Eligible for National Minority Scheme" readOnly />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {}
        <button type="submit" disabled={loading || saved}
          className={`group w-full py-4 rounded-2xl font-display font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 transform ${saved
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg shadow-green-500/40 scale-100'
              : loading
                ? 'bg-sky-400 text-white cursor-wait scale-[0.98]'
                : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 hover:-translate-y-1 hover:scale-[1.01] active:scale-[0.98]'
            }`}>
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving Profile...</>
          ) : saved ? (
            <><CheckCircle size={22} className="animate-bounce" /> Profile Saved Successfully!</>
          ) : (
            <><Save size={22} className="group-hover:scale-110 transition-transform duration-300" /> Save My Profile</>
          )}
        </button>
      </form>
    </div>
  )
}