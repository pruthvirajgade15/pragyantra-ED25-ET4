import { useState, useEffect, useCallback } from 'react'
import { FolderUp, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react'
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
    <div className="page-enter max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
            <ShieldCheck size={13} /> Encrypted Student Document Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            My Documents & Certificates
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Upload your certificates once. Our AI extracts structured details to auto-verify criteria and prepare applications.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            {documents.length} Stored Documents
          </span>
        </div>
      </div>

      {/* Main Vault Component */}
      <DocumentVault documents={documents} fetchDocuments={fetchDocuments} isLoading={isLoading} />

    </div>
  )
}