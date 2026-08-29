import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, ShieldCheck, Sparkles, Clock, FileText, Globe2, Bot, CheckCircle, IndianRupee, Users, Award, Star, ExternalLink } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'

const POPULAR_PILLS = [
  { label: 'Engineering / STEM', field: 'Engineering' },
  { label: 'Medical & MBBS', field: 'Medical' },
  { label: 'SC / ST Students', category: 'SC' },
  { label: 'OBC / EWS Categories', category: 'OBC' },
  { label: 'Girls in Tech', search: 'Girls' },
  { label: 'Closing Soon', sort: 'deadline' },
]

const TRUST_LOGOS = [
  { name: 'National Scholarship Portal (NSP)', desc: 'Central Schemes' },
  { name: 'AICTE Pragati & Saksham', desc: 'Technical Education' },
  { name: 'MahaDBT State Portal', desc: 'State Government' },
  { name: 'DST INSPIRE Fellowship', desc: 'Science & Research' },
  { name: 'UGC National Fellowships', desc: 'Higher Education' },
]

const FEATURES = [
  { 
    icon: Sparkles, 
    title: 'Eligibility & Win Probability Matcher', 
    desc: 'Our rule-based & AI matching engine compares your category, income, marks, state, and branch with official criteria in seconds.' 
  },
  { 
    icon: Clock, 
    title: 'Live Deadline Tracker', 
    desc: 'Never miss an application window. Get clear countdown alerts before scholarships close on NSP and state portals.' 
  },
  { 
    icon: FileText, 
    title: 'AI Scholarship Essay Studio', 
    desc: 'Generate tailored statement of purpose and scholarship application essays in Hindi and English tailored to each scheme.' 
  },
  { 
    icon: Bot, 
    title: '24/7 AI Scholarship Advisor', 
    desc: 'Ask questions in natural language about eligibility criteria, required certificates, and application steps.' 
  },
]

const STEPS = [
  {
    step: '01',
    title: 'Fill Your Student Profile',
    desc: 'Enter your basic academic percentage, family income, category, and state once.',
  },
  {
    step: '02',
    title: 'Get Matched Scholarships',
    desc: 'Instant match score and calculated win probability for every government and merit scheme.',
  },
  {
    step: '03',
    title: 'Apply Directly on Official Portals',
    desc: 'One-click direct link to official government portals with required document checklists.',
  },
]

const TESTIMONIALS = [
  {
    quote: "I never knew I was eligible for the AICTE Pragati scholarship until ScholarshipHunter matched my profile. Received ₹50,000 for my engineering tuition!",
    name: "Priya S.",
    role: "B.Tech Computer Engineering",
    college: "Government College of Engineering, Pune",
  },
  {
    quote: "The deadline tracker and Hindi bilingual option helped me submit my NSP post-matric form 5 days before the closing date with zero hassle.",
    name: "Rahul K.",
    role: "B.Sc Physics",
    college: "Patna University, Bihar",
  },
  {
    quote: "The essay studio generated a genuine, well-formatted statement of purpose that helped me secure the private merit grant. Truly student-focused.",
    name: "Ananya T.",
    role: "Commerce / CA Aspirant",
    college: "Bengaluru, Karnataka",
  }
]

export default function HomePage() {
  const { user, lang } = useAuth()
  const { t } = useTranslation(lang)
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/scholarships?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/scholarships')
    }
  }

  const handlePillClick = (pill) => {
    const params = new URLSearchParams()
    if (pill.field) params.set('field', pill.field)
    if (pill.category) params.set('category', pill.category)
    if (pill.search) params.set('search', pill.search)
    navigate(`/scholarships?${params.toString()}`)
  }

  return (
    <div className={`page-enter ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {/* Hero Section */}
      <section className="hero-gradient text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-blue-300">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>100% Free & Verified Government & Merit Scholarships</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white font-display max-w-4xl mx-auto">
            Find Scholarships You Actually Qualify For in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">30 Seconds</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            AI-powered matching for Indian students across all categories, states, and streams. Calculate your eligibility and apply directly on verified portals.
          </p>

          {/* Search Bar in Hero */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl border border-slate-200">
              <div className="flex items-center gap-2.5 px-3 w-full">
                <Search size={18} className="text-slate-400 flex-shrink-0" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by degree, branch (Engineering, Medical), category, or portal..."
                  className="w-full text-slate-800 placeholder-slate-400 text-sm focus:outline-none py-1.5"
                />
              </div>
              <button 
                type="submit"
                className="btn-primary w-full sm:w-auto px-6 py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                Search Scholarships <ArrowRight size={15} />
              </button>
            </div>

            {/* Popular Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {POPULAR_PILLS.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handlePillClick(pill)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </form>

        </div>
      </section>

      {/* Verified Portals Trust Bar */}
      <section className="bg-slate-900 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-semibold text-slate-400 tracking-wider uppercase mb-4">
            Direct Data & Official Links from Verified Government & Private Portals
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-300 text-xs font-medium">
            {TRUST_LOGOS.map((portal) => (
              <div key={portal.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-800">
                <CheckCircle size={14} className="text-blue-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white block leading-tight">{portal.name}</span>
                  <span className="text-[10px] text-slate-400">{portal.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              How ScholarshipHunter Works For You
            </h2>
            <p className="text-slate-500 text-sm">
              We eliminate endless portal searching and confusing government notifications.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((item) => (
              <div key={item.step} className="surface-card p-6 relative group hover:border-blue-300">
                <div className="text-3xl font-extrabold text-blue-100 font-display mb-3 group-hover:text-blue-200 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 font-display">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <Link to={user ? "/dashboard" : "/register"} className="btn-primary px-8 py-3 text-sm">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Complete Discovery Suite
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Engineered For Student Success
            </h2>
            <p className="text-slate-500 text-sm">
              Everything required to discover, track deadlines, write statements, and submit verified applications.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feat) => {
              const Icon = feat.icon
              return (
                <div key={feat.title} className="surface-card p-6 space-y-3 bg-white">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base font-display">
                    {feat.title}
                  </h3>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">
              Trusted by Students Across India
            </h2>
            <p className="text-slate-500 text-sm">
              Real stories from students who unlocked financial support for their education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="surface-card p-6 space-y-4 flex flex-col justify-between bg-slate-50/50">
                <p className="text-slate-700 text-sm italic leading-relaxed">
                  "{t.quote}"
                </p>
                <div className="pt-3 border-t border-slate-200/80">
                  <div className="font-bold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-xs text-blue-600 font-medium">{t.role}</div>
                  <div className="text-xs text-slate-500">{t.college}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display">
            Ready to Find Every Scholarship You Deserve?
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto">
            Create your free student account in 30 seconds. No subscription fees, no middlemen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to={user ? "/dashboard" : "/register"} className="btn-saffron px-8 py-3 text-sm font-semibold">
              Find My Scholarships Now <ArrowRight size={16} />
            </Link>
            <Link to="/scholarships" className="btn-secondary py-3 px-6 text-sm bg-white/10 text-white border-white/20 hover:bg-white/20">
              Browse All Schemes
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}