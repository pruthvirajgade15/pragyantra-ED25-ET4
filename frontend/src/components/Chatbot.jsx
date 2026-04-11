import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react'
import { chatAPI } from '../utils/api'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([
    { role: 'model', content: "Hi there! I'm your AI Scholarship Assistant. I actively monitor all your matches. Ask me anything!" }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [history, isTyping, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!message.trim() || isTyping) return

    const userMessage = { role: 'user', content: message }

    setHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    try {

      const apiHistory = history.slice(1).map(h => ({ role: h.role, content: h.content }))
      const res = await chatAPI.ask(userMessage.content, apiHistory)
      
      setHistory(prev => [...prev, { role: 'model', content: res.data.reply }])
    } catch (err) {
      console.error(err)
      setHistory(prev => [...prev, { role: 'model', content: "Oops! I encountered an error connecting to the AI. Please try again." }])
    } finally {
      setIsTyping(false)
    }
  }

  const renderMessageContent = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-slate-800">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-sky-600 text-white shadow-lg shadow-sky-500/30 flex items-center justify-center hover:bg-sky-700 hover:scale-105 transition-all z-[99] ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {}
      <div 
        className={`fixed bottom-6 right-6 w-[calc(100vw-48px)] max-w-[360px] sm:max-w-[400px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-[100] transition-all origin-bottom-right duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: '550px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {}
        <div className="bg-sky-600 px-5 py-4 flex items-center justify-between text-white flex-shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center shadow-inner">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">Scholarship AI</h3>
              <p className="text-sky-200 text-xs font-medium mt-0.5 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-sky-200 hover:text-white hover:bg-sky-500/50 p-1.5 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 flex flex-col relative">
          {history.length === 0 && !isTyping && (
             <div className="m-auto text-center opacity-50 flex flex-col items-center">
                 <Bot size={40} className="mb-2" />
                 <p className="text-sm font-medium">Start a conversation</p>
             </div>
          )}
          {history.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-sky-100 text-sky-600 border border-sky-200/50'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`p-3 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-sky-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-slate-200/60 text-slate-600 rounded-tl-sm'
              }`}>
                {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-1 bg-sky-100 text-sky-600 shadow-sm border border-sky-200/50">
                <Bot size={14} />
              </div>
              <div className="px-4 py-3.5 rounded-2xl bg-white border border-slate-200/60 rounded-tl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-0.5" />
        </div>

        {}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-end gap-2 flex-shrink-0 relative z-20">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about your eligibility..."
            className="flex-1 bg-slate-100/50 hover:bg-slate-100 border border-transparent focus:bg-white focus:border-sky-300 focus:ring-4 focus:ring-sky-100/50 rounded-xl px-4 py-3 text-sm outline-none transition-all placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button 
            type="submit" 
            disabled={!message.trim() || isTyping}
            className="w-11 h-11 rounded-xl bg-sky-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-sky-700 disabled:opacity-50 disabled:bg-slate-300 disabled:hover:bg-slate-300 transition-all active:scale-95"
          >
            {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="ml-0.5" />}
          </button>
        </form>
      </div>
    </>
  )
}