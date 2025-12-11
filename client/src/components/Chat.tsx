import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { ChatResponse } from '../types';
import { Send, Bot, User, Sparkles, Loader2, StopCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  subjectId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

export default function Chat({ subjectId }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi there! I've studied all the materials in this subject. Ask me anything!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const quickPrompts = [
    'Summarize the key ideas so far',
    'Quiz me with 3 questions',
    'Explain this like I am 12',
    'Give me flashcards for this topic'
  ];
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset chat when subject changes? Optional.
    // setMessages([{ role: 'assistant', content: 'Ready to help!' }]);
  }, [subjectId]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const data: ChatResponse = await api.chat({ message: userMsg, subjectId });
      
      const sourceTitles = data.sources?.map((s: any) => {
          return s.content.substring(0, 60) + '...'; 
      }) || [];

      setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.answer,
          sources: sourceTitles
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I ran into an issue while thinking. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] md:min-h-0 bg-transparent relative">
      <div className="px-5 py-4 bg-white/50 backdrop-blur-md border-b border-surface-200 flex items-center justify-between sticky top-0 z-10 transition-all">
         <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-primary-100 to-primary-50 p-2.5 rounded-xl text-primary-600 shadow-sm border border-primary-100/50">
                 <Bot className="w-5 h-5" />
             </div>
             <div>
                <h2 className="font-bold text-slate-800 text-sm tracking-tight">AI Tutor</h2>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">Online</p>
                </div>
             </div>
         </div>
      </div>

      <div className="px-5 pt-4 flex flex-wrap gap-2 bg-gradient-to-b from-white/50 to-transparent">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setInput(prompt)}
            className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full hover:border-primary-300 hover:text-primary-700 hover:shadow-sm hover:-translate-y-0.5 transition-all active:scale-95"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300 group`}>
            
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                msg.role === 'user' 
                ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-primary-500/20' 
                : 'bg-white border border-slate-100 text-primary-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
            </div>

            <div className={`max-w-[85%] space-y-2`}>
               <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed border ${
                   msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-sm shadow-md shadow-primary-500/10 border-transparent' 
                    : 'bg-white border-surface-200 text-slate-700 rounded-tl-sm shadow-sm'
               }`}>
                   <ReactMarkdown 
                        className={`prose prose-sm max-w-none prose-p:my-1 ${msg.role === 'user' ? 'text-white prose-p:text-white prose-headings:text-white prose-strong:text-white prose-a:text-white' : 'text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-a:text-primary-600'}`}
                        components={{
                            // Override styling for specific elements if needed
                        }}
                   >
                      {msg.content}
                   </ReactMarkdown>
               </div>
               
               {msg.sources && msg.sources.length > 0 && (
                    <div className="text-xs ml-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Bot size={10} /> Context Used
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {msg.sources.map((s, idx) => (
                                <span key={idx} className="bg-white/80 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md shadow-sm max-w-[220px] truncate block text-[10px] font-medium hover:border-primary-200 transition-colors cursor-help" title={s}>
                                    {s}
                                </span>
                            ))}
                        </div>
                   </div>
               )}
            </div>
          </div>
        ))}
        
        {loading && (
            <div className="flex gap-4 opacity-70">
                 <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 text-primary-500 shadow-sm">
                    <Loader2 size={16} className="animate-spin" />
                 </div>
                 <div className="bg-white border border-surface-200 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-1.5 w-16">
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                 </div>
            </div>
        )}
      </div>

      <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-surface-200">
        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center group">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask questions about your notes..."
                className="w-full pl-5 pr-14 py-4 bg-white border border-surface-200 text-slate-900 rounded-2xl focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none text-sm shadow-sm group-hover:shadow-md"
                disabled={loading}
            />
            <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 transition-all shadow-md shadow-primary-500/20 active:scale-95 disabled:active:scale-100"
            >
                {loading ? <StopCircle size={18} /> : <Send size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
