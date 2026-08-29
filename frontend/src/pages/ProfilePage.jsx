import { useState, useEffect } from 'react'
import { User, Save, CheckCircle, ArrowRight, ShieldCheck, GraduationCap, IndianRupee, MapPin, Building, Sparkles } from 'lucide-react'
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

const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS', 'Minority']

export default function ProfilePage() {
  const { lang, user } = useAuth()
  const { t } = useTranslation(lang)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.name || '',
    annual_income: '',
    percentage: '',
    category: 'General',
    state: 'Maharashtra',
    field_of_study: 'Engineering',
    gender: 'Male',
    religion: 'Hindu',
    disability: false,
    is_minority: false,
    current_year: 1,
    college: '',
    phone: '',
    dob: '',
  })

  useEffect(() => {
    profileAPI.get().then(({ data }) => {
      if (data) {
        setForm(prev => ({
          ...prev,
          ...data,
          annual_income: data.annual_income != null ? String(data.annual_income) : '',
          percentage: data.percentage != null ? String(data.percentage) : '',
        }))
      }
    }).catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  // Calculate completion %
  const calculateCompleteness = () => {
    let score = 0
    if (form.full_name) score += 15
    if (form.annual_income) score += 20
    if (form.percentage) score += 20
    if (form.state) score += 15
    if (form.field_of_study) score += 10
    if (form.college) score += 10
    if (form.category) score += 10
    return Math.min(100, score)
  }

  const completeness = calculateCompleteness()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name || !form.annual_income || !form.percentage) {
      toast.error('Please fill all required fields marked with *')
      return
    }
    setLoading(true)
    try {
      await profileAPI.save({
        ...form,
        annual_income: parseFloat(form.annual_income),
        percentage: parseFloat(form.percentage),
        current_year: parseInt(form.current_year) || 1,
      })
      setSaved(true)
      toast.success('Student profile saved successfully! ✨')
      setTimeout(() => {
        setSaved(false)
        navigate('/dashboard')
      }, 1200)
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`page-enter max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Student Eligibility Profile
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Keep your profile updated. Our matching algorithms use these criteria to find guaranteed matches.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="surface-card p-3 flex items-center gap-3 self-start sm:self-auto bg-white">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center">
            {completeness}%
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 block">Match Accuracy</span>
            <span className="text-[10px] text-slate-500">{completeness === 100 ? 'Fully calibrated' : 'Complete remaining fields'}</span>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center gap-3 text-xs text-blue-800">
        <ShieldCheck size={18} className="text-blue-600 flex-shrink-0" />
        <span><strong>Data Privacy:</strong> Your financial and academic information is strictly confidential and used solely for scholarship matching and auto-fill.</span>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 1. Academic Information */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap size={18} className="text-blue-600" />
            <h2 className="font-display font-bold text-slate-900 text-base">
              Academic Background
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name *
              </label>
              <input 
                type="text" 
                name="full_name" 
                value={form.full_name} 
                onChange={handleChange}
                placeholder="e.g. Priya Sharma" 
                required 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current College / Institute Name
              </label>
              <input 
                type="text" 
                name="college" 
                value={form.college} 
                onChange={handleChange}
                placeholder="e.g. Government College of Engineering, Pune" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Field / Stream of Study *
              </label>
              <select 
                name="field_of_study" 
                value={form.field_of_study} 
                onChange={handleChange} 
                className="input-field"
              >
                {FIELDS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Percentage / % *
                </label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="100" 
                  name="percentage" 
                  value={form.percentage} 
                  onChange={handleChange}
                  placeholder="e.g. 85.5" 
                  required 
                  className="input-field" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Current Year
                </label>
                <select 
                  name="current_year" 
                  value={form.current_year} 
                  onChange={handleChange} 
                  className="input-field"
                >
                  {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Financial & Eligibility Criteria */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <IndianRupee size={18} className="text-emerald-600" />
            <h2 className="font-display font-bold text-slate-900 text-base">
              Financial & Reservation Eligibility
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Annual Family Income (₹) *
              </label>
              <input 
                type="number" 
                name="annual_income" 
                value={form.annual_income} 
                onChange={handleChange}
                placeholder="e.g. 250000 (for 2.5 LPA)" 
                required 
                className="input-field" 
              />
              <p className="text-[11px] text-slate-400 mt-1">Required for government income-threshold schemes (e.g. &lt; 2.5 LPA)</p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                State of Domicile / Residence *
              </label>
              <select 
                name="state" 
                value={form.state} 
                onChange={handleChange} 
                className="input-field"
              >
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Social Category *
              </label>
              <select 
                name="category" 
                value={form.category} 
                onChange={handleChange} 
                className="input-field"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Gender
              </label>
              <select 
                name="gender" 
                value={form.gender} 
                onChange={handleChange} 
                className="input-field"
              >
                <option value="Female">Female (Unlocks Girls-in-Tech & Pragati schemes)</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="sm:col-span-2 pt-2 grid sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  name="is_minority" 
                  checked={form.is_minority} 
                  onChange={handleChange} 
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Minority Community Member</span>
                  <span className="text-[11px] text-slate-500">Muslim, Sikh, Christian, Buddhist, Jain, Parsi</span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                <input 
                  type="checkbox" 
                  name="disability" 
                  checked={form.disability} 
                  onChange={handleChange} 
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Person with Disability (PwD)</span>
                  <span className="text-[11px] text-slate-500">Unlocks AICTE Saksham & Divyangjan grants</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* 3. Personal & Contact Details */}
        <div className="surface-card p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User size={18} className="text-slate-600" />
            <h2 className="font-display font-bold text-slate-900 text-base">
              Personal & Contact Information
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <input 
                type="tel" 
                name="phone" 
                value={form.phone} 
                onChange={handleChange}
                placeholder="e.g. 9876543210" 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Date of Birth
              </label>
              <input 
                type="date" 
                name="dob" 
                value={form.dob} 
                onChange={handleChange} 
                className="input-field" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Religion
              </label>
              <input 
                type="text" 
                name="religion" 
                value={form.religion} 
                onChange={handleChange}
                placeholder="e.g. Hindu, Muslim, Sikh..." 
                className="input-field" 
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary py-3 px-8 text-sm font-semibold flex items-center gap-2"
          >
            {loading ? 'Saving Profile...' : <><Save size={16} /> Save Profile & Calculate Matches</>}
          </button>
        </div>

      </form>

    </div>
  )
}