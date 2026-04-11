import { Link } from 'react-router-dom'
import { GraduationCap, Zap, Clock, FileText, Globe2, RefreshCw, Smartphone, ArrowRight, Star, Users, TrendingUp, Shield, Sparkles, Bot } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../i18n/translations'

const FEATURES = [
  { icon: Zap,        title: 'Smart AI Matching',     desc: 'Gemini AI matches you to scholarships based on income, marks, category, state and field of study.', color: 'sky' },
  { icon: Clock,      title: 'Deadline Tracker',      desc: 'Never miss a deadline. Auto-alerts 7 days before every scholarship closes.', color: 'orange' },
  { icon: FileText,   title: 'Essay Generator',        desc: 'Generate personalized application essays in Hindi and English in under 5 seconds.', color: 'violet' },
  { icon: Globe2,     title: 'Hindi + English',        desc: 'Full bilingual support for rural and urban students across India.', color: 'emerald' },
  { icon: RefreshCw,  title: 'Auto-Updated Daily',    desc: 'Web scraper runs every night to add new scholarships from NSP, Buddy4Study, AICTE.', color: 'rose' },
  { icon: Bot,        title: 'AI Chatbot Assistant',   desc: 'Ask our AI anything about scholarships. Get personalized guidance based on your profile.', color: 'indigo' },
]

const STEPS = [
  { num: '01', title: 'Fill Profile',      desc: 'Enter your income, marks, category, state — takes 30 seconds.', icon: '📝' },
  { num: '02', title: 'AI Matches You',    desc: 'Gemini AI ranks all eligible scholarships by match percentage.', icon: '🤖' },
  { num: '03', title: 'Generate Essay',    desc: 'One-click AI essay personalized to each scholarship.', icon: '✍️' },
  { num: '04', title: 'Apply & Win',       desc: 'Direct link to official portal with document checklist.', icon: '🏆' },
]

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Pune, MH', text: 'I found 12 scholarships I never knew about! Got ₹50,000 from AICTE Pragati.', avatar: '👩‍🎓' },
  { name: 'Rahul K.', location: 'Patna, BR', text: 'The AI matched me with NSP scholarship instantly. Applied in 5 minutes.', avatar: '👨‍💻' },
  { name: 'Ananya T.', location: 'Bengaluru, KA', text: 'Essay generator saved me hours. Got shortlisted for Kotak Kanya!', avatar: '👩‍🏫' },
]

export default function HomePage() {
  const { user, lang } = useAuth()
  const { t } = useTranslation(lang)

  return (
    <div className={`page-enter ${lang === 'hi' ? 'font-hindi' : ''}`}>

      {}
      <section className="hero-bg text-white py-24 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-8 hover:bg-white/15 transition-colors cursor-default">
            <Star size={14} className="text-amber-400" />
            <span>Powered by Gemini AI • Team Catalyst</span>
            <Sparkles size={14} className="text-sky-300" />
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 tracking-tight">
            {t('hero_title')}
          </h1>
          <p className="text-sky-100/90 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to={user ? '/dashboard' : '/register'} className="btn-saffron text-base px-10 py-3.5 inline-flex items-center gap-2.5 group">
              {t('hero_cta')} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/scholarships" className="bg-white/10 border border-white/30 text-white font-semibold px-10 py-3.5 rounded-xl hover:bg-white/20 transition-all inline-flex items-center gap-2.5 backdrop-blur-sm group">
              Browse Scholarships <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
            {[
              { val: t('hero_stat1'), label: t('hero_stat1_label') },
              { val: t('hero_stat2'), label: t('hero_stat2_label') },
              { val: t('hero_stat3'), label: t('hero_stat3_label') },
            ].map(({ val, label }) => (
              <div key={label} className="stat-card group cursor-default">
                <div className="font-display font-extrabold text-2xl sm:text-3xl text-white group-hover:scale-105 transition-transform">{val}</div>
                <div className="text-sky-200/80 text-xs sm:text-sm mt-1.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-16 px-4 bg-gradient-to-b from-sky-50/80 to-white relative section-dot-grid">
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="glass-card p-10 text-center">
            <div className="text-6xl mb-5">👩‍🎓</div>
            <blockquote className="font-display font-semibold text-xl sm:text-2xl text-slate-700 leading-relaxed">
              "Meet <span className="text-sky-600">Priya</span> — she qualifies for{' '}
              <span className="saffron-text font-bold">12 scholarships worth ₹2.4 Lakhs</span>{' '}
              but has never heard of any of them."
            </blockquote>
            <p className="text-slate-500 mt-5 text-base leading-relaxed">ScholarshipHunter AI finds Priya's scholarships in 30 seconds. We built this for every Priya in India.</p>
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary mt-7 inline-flex items-center gap-2.5 group">
              Find My Scholarships <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 bg-white relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-full px-4 py-1.5 text-sm font-semibold text-sky-600 mb-4">
              <Sparkles size={14} /> Platform Features
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 mb-3">
              Everything You Need to <span className="gradient-text">Win Scholarships</span>
            </h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">One platform. Six powerful features. Zero cost.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="glass-card feature-card p-7 flex flex-col gap-4 group">
                <div className={`w-12 h-12 rounded-2xl bg-${color}-50 border border-${color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className={`text-${color}-600`} />
                </div>
                <h3 className="font-display font-semibold text-slate-800 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed flex-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 bg-gradient-to-b from-slate-50 to-white relative section-dot-grid">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 text-sm font-semibold text-violet-600 mb-4">
              <Shield size={14} /> Simple Process
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 mb-3">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-slate-500 text-lg">From profile to application in under 2 minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, title, desc, icon }, idx) => (
              <div key={num} className="glass-card p-7 text-center relative group">
                <div className="text-4xl mb-4">{icon}</div>
                <div className="font-display font-extrabold text-5xl gradient-text mb-3 opacity-20 absolute top-3 right-4">{num}</div>
                <h3 className="font-display font-semibold text-slate-800 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 text-2xl z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 mb-3">
              Students <span className="gradient-text">Love Us</span>
            </h2>
            <p className="text-slate-500 text-lg">Real stories from scholarship winners</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, location, text, avatar }) => (
              <div key={name} className="glass-card p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center text-2xl shadow-sm">
                    {avatar}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-slate-800">{name}</div>
                    <div className="text-xs text-slate-400">{location}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed italic">"{text}"</p>
                <div className="flex gap-0.5 text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i}>{s}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-800 mb-12">
            Real <span className="gradient-text">Impact</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: Users,      stat: '16 Cr+',  label: 'Students in India eligible for scholarships', color: 'sky' },
              { icon: TrendingUp, stat: '< 30 sec', label: 'Time to find matching scholarships via AI',   color: 'green' },
              { icon: FileText,   stat: '5 sec',    label: 'Time to generate a full application essay',   color: 'orange' },
            ].map(({ icon: Icon, stat, label, color }) => (
              <div key={stat} className={`glass-card p-8 border-t-4 border-${color}-400 group`}>
                <div className={`w-14 h-14 rounded-2xl bg-${color}-50 border border-${color}-100 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className={`text-${color}-600`} />
                </div>
                <div className={`font-display font-extrabold text-4xl text-${color}-600 mb-2`}>{stat}</div>
                <p className="text-slate-500 text-sm leading-relaxed">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="hero-bg py-24 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto relative z-10">
          <GraduationCap size={56} className="mx-auto mb-5 text-sky-300 opacity-80" />
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl mb-5 leading-tight">
            Find every scholarship<br />you deserve.
          </h2>
          <p className="text-sky-100/80 text-lg mb-10">AI-powered. Auto-updated. 100% Free.</p>
          <Link to={user ? '/dashboard' : '/register'} className="btn-saffron text-lg px-12 py-4 inline-flex items-center gap-2.5 group">
            {t('hero_cta')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sky-300/60 text-sm mt-5">No credit card. No fees. Ever.</p>
        </div>
      </section>

      {}
      <footer className="bg-slate-900 text-slate-400 text-sm text-center py-8 px-4">
        <p>Built with ❤️ by <span className="text-sky-400 font-semibold">Team Catalyst</span> — Modern College of Engineering, Pune</p>
        <p className="mt-1.5 text-slate-500">PRAGYANTRA Hackathon 2025 • Powered by Gemini AI (Google)</p>
      </footer>
    </div>
  )
}