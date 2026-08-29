import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react'
import { chatAPI } from '../utils/api'

const STARTER_PROMPTS = [
  'What scholarships am I eligible for?',
  'Which scholarships close this month?',
  'Documents needed for NSP application',
  'How to apply for AICTE Pragati?',
]

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([
    { 
      role: 'model', 
      content: "Hello! I'm your AI Scholarship Advisor. Ask me anything about eligibility, government portals (NSP, AICTE, State schemes), or required documents." 
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [history, isTyping, isOpen])

  const handleSend = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : message
    if (!query.trim() || isTyping) return

    const userMessage = { role: 'user', content: query.trim() }

    setHistory(prev => [...prev, userMessage])
    setMessage('')
    setIsTyping(true)

    try {
      const apiHistory = history.slice(1).map(h => ({ role: h.role, content: h.content }))
      const res = await chatAPI.ask(userMessage.content, apiHistory)
      const replyText = res.data?.reply || "I couldn't process that query. Please try asking about scholarships or documents."
      setHistory(prev => [...prev, { role: 'model', content: replyText }])
    } catch (err) {
      console.error(err)
      const errorDetail = err.response?.data?.detail
      setHistory(prev => [...prev, { 
        role: 'model', 
        content: errorDetail || "I'm analyzing your scholarship profile. You can apply for central schemes like the NSP Post-Matric Scholarship or state schemes. Please check your Dashboard for personalized matches." 
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const renderFormattedText = (text) => {
    // Render bold markdown segments cleanly
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
      }
      return <span key={i}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all z-40 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
        aria-label="Open AI Advisor"
      >
        <MessageSquare size={22} />
      </button>

      {/* Floating Assistant Modal */}
      <div 
        className={`fixed bottom-3 right-3 sm:bottom-6 sm:right-6 w-[calc(100vw-24px)] sm:w-[410px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50 transition-all origin-bottom-right duration-250 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
        style={{ height: 'min(500px, calc(100vh - 40px))' }}
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between text-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Bot size={17} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm font-display leading-tight">AI Scholarship Advisor</h3>
              <p className="text-emerald-400 text-[10px] sm:text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50 text-xs sm:text-sm min-h-0">
          {history.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs mt-0.5">
                  <Bot size={14} />
                </div>
              )}

              <div 
                className={`p-2.5 sm:p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-xs' 
                    : 'bg-white text-slate-700 border border-slate-200/80 rounded-bl-xs shadow-xs'
                }`}
              >
                {renderFormattedText(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-8">
              <Loader2 size={13} className="animate-spin text-blue-600" />
              <span>Checking verified scholarship criteria...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Chips */}
        {history.length <= 2 && (
          <div className="px-3 py-1.5 bg-slate-100/90 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px] flex-shrink-0">
            {STARTER_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 whitespace-nowrap transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-2.5 sm:p-3 bg-white border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
          <input 
            type="text" 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about scholarships, documents, eligibility..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
          />
          <button 
            type="submit" 
            disabled={!message.trim() || isTyping}
            className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </>
  )
}