import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Check, Loader2 } from 'lucide-react';

interface Props {
  subjectId: string;
}

export default function Notes({ subjectId }: Props) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);



  useEffect(() => {
    loadNote();
  }, [subjectId]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const data = await api.getNote(subjectId);
      setContent(data.content || '');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newContent: string) => {
    setSaving(true);
    try {
      await api.updateNote({ subjectId, content: newContent });
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    
    // Debounce save (2 seconds)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => handleSave(val), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] md:min-h-0 bg-transparent relative">
      <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-b border-surface-200 flex items-center justify-between sticky top-0 z-10 transition-all">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Study Notes</h2>
          {saving ? (
            <span className="text-[10px] text-slate-400 flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
              <Loader2 size={10} className="animate-spin" /> Saving...
            </span>
          ) : lastSaved ? (
            <span className="text-[10px] text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 animate-in fade-in">
              <Check size={10} /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
        </div>

        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-400"></span>
            {content.trim() ? content.trim().split(/\s+/).length : 0} words
          </p>
        </div>
      </div>

      <div className="flex-1 p-6 relative bg-white/30">
        {loading ? (
          <div className="flex justify-center pt-20">
            <Loader2 className="animate-spin text-primary-400 w-8 h-8" />
          </div>
        ) : (
          <textarea
            ref={textAreaRef}
            className="w-full h-full bg-transparent resize-none focus:outline-none text-slate-700 leading-relaxed placeholder:text-slate-400 font-medium text-sm p-2"
            placeholder="Start typing your notes here..."
            value={content}
            onChange={handleChange}
            spellCheck={false}
          />
        )}
        
        {/* Paper lines background effect - subtle */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_27px,#000_28px)] bg-[length:100%_28px] mt-[88px] ml-8 mr-8 h-[calc(100%-88px)] mix-blend-multiply" />
      </div>
    </div>
  );
}
