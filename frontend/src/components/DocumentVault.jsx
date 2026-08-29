import { useState } from 'react'
import { Upload, X, File as FileIcon, ExternalLink, CheckCircle, Trash2, ShieldCheck, Download, Sparkles } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const DOC_TYPES = [
  'Income Certificate',
  '10th Marksheet',
  '12th Marksheet',
  'Caste Certificate',
  'Disability Certificate',
  'Aadhar Card',
  'College Fee Receipt'
]

export default function DocumentVault({ documents, fetchDocuments, isLoading }) {
  const [isUploading, setIsUploading] = useState(false)
  const [docType, setDocType] = useState('Income Certificate')
  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File exceeds maximum size of 10MB')
        return
      }
      setFile(selectedFile)
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile))
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a certificate file to upload')
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)

    try {
      setIsUploading(true)
      const promise = api.post('/documents/upload', formData)
      
      toast.promise(promise, {
        loading: 'Uploading and analyzing document with AI...',
        success: 'Document uploaded and analyzed successfully! ✨',
        error: (err) => err.response?.data?.detail || 'Upload failed'
      })
      
      await promise
      setFile(null)
      setFilePreview(null)

      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
      
      fetchDocuments()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from your vault?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document removed')
      fetchDocuments()
    } catch (err) {
      toast.error('Failed to delete document')
    }
  }

  return (
    <div className="space-y-6">

      {/* Upload Zone Card */}
      <div className="surface-card p-6 sm:p-8 bg-white space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <Upload size={18} className="text-blue-600" /> Upload Document or Certificate
          </h2>
          <span className="text-xs text-slate-400 font-medium">JPG, PNG, PDF up to 10MB</span>
        </div>

        <form onSubmit={handleUpload} className="grid sm:grid-cols-12 gap-4 items-end">
          
          {/* Doc Type Selector (4 cols) */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Document Type
            </label>
            <select 
              value={docType} 
              onChange={e => setDocType(e.target.value)} 
              disabled={isUploading}
              className="input-field text-sm"
            >
              {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* File Picker (5 cols) */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Select File
            </label>
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                id="file-upload" 
                className="hidden" 
                disabled={isUploading}
              />
              <label 
                htmlFor="file-upload" 
                className={`flex-1 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-dashed text-sm font-medium transition-all cursor-pointer truncate ${
                  file ? 'border-blue-400 bg-blue-50/60 text-blue-700 font-semibold' : 'border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-400'
                }`}
              >
                <Upload size={16} className={file ? "text-blue-600 flex-shrink-0" : "text-slate-400 flex-shrink-0"} />
                <span className="truncate">{file ? file.name : "Choose file..."}</span>
              </label>

              {filePreview && (
                <div className="w-10 h-10 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 bg-slate-100 shadow-xs">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Upload CTA (3 cols) */}
          <div className="sm:col-span-3">
            <button 
              type="submit" 
              disabled={!file || isUploading}
              className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Analyzing...' : 'Upload & Scan'}
            </button>
          </div>

        </form>
      </div>

      {/* Stored Documents Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 font-display">
          Stored Certificates ({documents.length})
        </h3>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="surface-card p-5 space-y-3">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-4 w-1/2" />
                <div className="skeleton h-16 w-full" />
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="surface-card p-12 text-center space-y-3 bg-slate-50/50">
            <FileIcon size={36} className="mx-auto text-slate-300" />
            <h4 className="text-base font-bold text-slate-800">No documents stored yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload your marksheet or income certificate above to unlock instant AI application auto-fill.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {documents.map(doc => {
              const hasParsedData = doc.parsed_data && Object.keys(doc.parsed_data).length > 0

              return (
                <div key={doc.id} className="surface-card p-5 space-y-4 flex flex-col justify-between group">
                  
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileIcon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm font-display">{doc.doc_type}</h4>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* AI Extracted Structured Data Box */}
                  {hasParsedData && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                        <Sparkles size={11} /> AI Extracted Data
                      </span>
                      <div className="space-y-1 pt-1 font-mono text-slate-700 max-h-32 overflow-y-auto">
                        {Object.entries(doc.parsed_data).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-slate-200/60 pb-1 last:border-0">
                            <span className="text-slate-500">{k}:</span>
                            <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      <CheckCircle size={13} /> Verified for Auto-fill
                    </span>

                    {doc.file_url && (
                      <div className="flex items-center gap-3">
                        <a 
                          href={doc.file_url} 
                          download
                          className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                        >
                          <Download size={13} /> Download
                        </a>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <ExternalLink size={13} /> View
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}