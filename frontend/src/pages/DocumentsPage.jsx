import { useState, useEffect, useCallback } from 'react'
import { FolderUp, ShieldCheck } from 'lucide-react'
import DocumentVault from '../components/DocumentVault'
import api from '../utils/api'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await api.get('/documents')
      setDocuments(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="page-enter min-h-screen bg-gradient-to-b from-slate-50/50 to-white pb-20 pt-8 selection:bg-sky-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-xs tracking-wide uppercase font-display border border-emerald-200">
              <ShieldCheck size={14} /> Encrypted Vault
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3 font-display">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-lg flex-shrink-0">
                <FolderUp size={24} className="text-white" />
              </div>
              My Documents
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl text-base leading-relaxed">
              Upload your certificates and marksheets once. Our AI extracts your details to auto-fill applications and find higher-accuracy matches.
            </p>
          </div>
        </div>

        {/* Component */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="w-14 h-14 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin" />
              <FolderUp size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-500" />
            </div>
            <p className="text-slate-400 text-sm animate-pulse">Loading your documents...</p>
          </div>
        ) : (
          <DocumentVault documents={documents} fetchDocuments={fetchDocuments} />
        )}

      </div>
    </div>
  )
}
