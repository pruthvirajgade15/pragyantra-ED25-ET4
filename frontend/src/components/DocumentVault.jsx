import { useState, useCallback } from 'react'
import { Upload, X, File as FileIcon, ExternalLink, CheckCircle } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function DocumentVault({ documents, fetchDocuments }) {
  const [isUploading, setIsUploading] = useState(false)
  const [docType, setDocType] = useState('Income Certificate')

  const [file, setFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      // Attempt to show preview if it's an image
      if (selectedFile.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(selectedFile))
      } else {
        setFilePreview(null) // Not an image, no preview
      }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a file')
    const formData = new FormData()
    formData.append('file', file)
    formData.append('doc_type', docType)

    try {
      setIsUploading(true)
      const promise = api.post('/documents/upload', formData)
      
      toast.promise(promise, {
        loading: 'Uploading and analyzing with AI...',
        success: 'Your document is uploaded successfully',
        error: 'Upload failed'
      })
      
      await promise
      
      setFile(null)
      setFilePreview(null)
      // reset file input
      const fileInput = document.getElementById('file-upload');
      if (fileInput) fileInput.value = '';
      
      fetchDocuments()
    } catch (error) {
      console.error(error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this document?')) return
    try {
      await api.delete(`/documents/${id}`)
      toast.success('Document deleted')
      fetchDocuments()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Upload New Document</h2>
        <form onSubmit={handleUpload} className="grid sm:grid-cols-[1fr_2fr_auto] gap-4 items-end">
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Document Type</label>
            <select 
              value={docType} onChange={e => setDocType(e.target.value)} disabled={isUploading}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all disabled:opacity-50"
            >
              <option>Income Certificate</option>
              <option>10th Marksheet</option>
              <option>12th Marksheet</option>
              <option>Caste Certificate</option>
              <option>Disability Certificate</option>
              <option>Aadhar Card</option>
            </select>
          </div>

          <div className="space-y-1.5 flex flex-col">
            <label className="text-sm font-semibold text-slate-700">Select File</label>
            <div className="flex items-center gap-3 w-full">
              <div className="relative flex-grow">
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
                  className={`flex items-center gap-3 w-full bg-slate-50 border border-slate-200 border-dashed rounded-xl px-4 py-2.5 font-medium transition-all ${
                    file ? 'border-sky-300 bg-sky-50' : 'hover:bg-slate-100 hover:border-sky-300'
                  } cursor-pointer`}
                >
                  <Upload size={18} className={file ? "text-sky-500" : "text-slate-400"} />
                  <span className={`truncate ${file ? "text-sky-700" : "text-slate-500"}`}>
                    {file ? file.name : "Click to select file..."}
                  </span>
                </label>
              </div>
              
              {/* Image Preview Thumbnail beside the input */}
              {filePreview && (
                <div className="w-11 h-11 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0 shadow-sm bg-slate-100">
                  <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={!file || isUploading}
            className="btn-primary py-2.5 h-[46px] w-full sm:w-auto px-6 whitespace-nowrap"
          >
            {isUploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Document List */}
      <div className="grid md:grid-cols-2 gap-4">
        {documents.length === 0 && (
          <div className="md:col-span-2 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <FileIcon size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No documents stored yet.</p>
          </div>
        )}
        
        {documents.map(doc => (
          <div key={doc.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 group flex flex-col h-full">
            <div className="flex justify-between flex-shrink-0 items-start mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-500">
                  <FileIcon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{doc.doc_type}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(doc.id)}
                className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                title="Delete document"
              >
                <X size={16} />
              </button>
            </div>
            
            {Object.keys(doc.parsed_data).length > 0 && (
              <div className="flex-grow bg-slate-50 rounded-xl p-4 text-sm font-mono text-slate-700 overflow-y-auto max-h-40 border border-slate-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-sky-600 block mb-2 uppercase tracking-tight">AI Extracted Data:</span>
                  {Object.entries(doc.parsed_data).map(([k, v]) => (
                    <div key={k} className="flex flex-col sm:flex-row gap-1 border-b border-slate-100 pb-1 mb-1 last:border-0">
                      <span className="font-semibold text-slate-500 min-w-[120px]">{k}:</span>
                      <span className="text-slate-800 break-words">{typeof v === 'object' ? JSON.stringify(v) : v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-medium gap-2 font-display">
              <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle size={14}/> Ready for Auto-fill</span>
              {doc.file_url && (
                <div className="flex items-center gap-3">
                  <a download href={doc.file_url} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 hover:underline">
                    Download
                  </a>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sky-600 hover:text-sky-700 hover:underline">
                    <ExternalLink size={14} /> View
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
