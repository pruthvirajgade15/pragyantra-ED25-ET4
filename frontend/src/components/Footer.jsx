import { Link } from 'react-router-dom'
import { GraduationCap, ShieldCheck, ExternalLink, Heart, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Footer() {
  const { lang, switchLang } = useAuth()

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      {/* Top Advisory Banner */}
      <div className="border-b border-slate-800 bg-slate-950/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={16} className="flex-shrink-0" />
            <span><strong>Student Safety Advisory:</strong> Government scholarships are 100% free. Never pay application or registration fees to any agent or website.</span>
          </div>
          <button 
            onClick={() => switchLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 transition-colors"
          >
            <Globe size={13} />
            <span>{lang === 'en' ? 'हिंदी में देखें' : 'View in English'}</span>
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={18} />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Scholarship<span className="text-blue-400">Hunter</span>
              </span>
              <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">AI</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Empowering Indian students from all backgrounds to discover, match, and apply for government and merit scholarships in under 30 seconds.
            </p>
            <div className="text-xs text-slate-500">
              Built for students across India with full bilingual support (English + Hindi).
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/scholarships" className="hover:text-white transition-colors">Browse Scholarships</Link></li>
              <li><Link to="/deadlines" className="hover:text-white transition-colors">Deadline Tracker</Link></li>
              <li><Link to="/essay" className="hover:text-white transition-colors">AI Essay Studio</Link></li>
              <li><Link to="/documents" className="hover:text-white transition-colors">Document Vault</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
            </ul>
          </div>

          {/* Official Portals */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">Verified Portals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://scholarships.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center gap-1">
                  National Scholarship Portal (NSP) <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center gap-1">
                  AICTE Pragati & Saksham <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://mahadbt.maharashtra.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center gap-1">
                  MahaDBT State Portal <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a href="https://online-inspire.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-white inline-flex items-center gap-1">
                  DST INSPIRE <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

          {/* Eligibility Categories */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-3">Top Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/scholarships?category=SC" className="hover:text-white transition-colors">SC / ST Scholarships</Link></li>
              <li><Link to="/scholarships?category=OBC" className="hover:text-white transition-colors">OBC & EBC Scholarships</Link></li>
              <li><Link to="/scholarships?category=Minority" className="hover:text-white transition-colors">Minority Communities</Link></li>
              <li><Link to="/scholarships?field=Engineering" className="hover:text-white transition-colors">Engineering & STEM</Link></li>
              <li><Link to="/scholarships?field=Medical" className="hover:text-white transition-colors">Medical & MBBS</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ScholarshipHunter AI. All official scholarship data sourced from respective government and private provider portals.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/scholarships" className="hover:text-slate-300">Explore</Link>
            <Link to="/profile" className="hover:text-slate-300">My Profile</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
