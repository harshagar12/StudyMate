import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { Save, Check, Loader2, Bold, Italic, List } from 'lucide-react';

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

  const insertFormat = (startTag: string, endTag: string) => {
    const textarea = textAreaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = `${before}${startTag}${selection}${endTag}${after}`;
    setContent(newContent);
    handleSave(newContent); // Auto-save on format

    // Restore cursor / selection
    // We want to select the text inside the tags if there was a selection, 
    // or place cursor between tags if empty
    setTimeout(() => {
        textarea.focus();
        if (selection) {
            textarea.setSelectionRange(start + startTag.length, end + startTag.length);
        } else {
            textarea.setSelectionRange(start + startTag.length, start + startTag.length);
        }
    }, 0);
  };

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
    <div className="flex flex-col h-full bg-transparent relative">
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

        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => insertFormat('**', '**')}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-primary-600 rounded-lg transition-all" 
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button 
            onClick={() => insertFormat('_', '_')}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-primary-600 rounded-lg transition-all" 
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button 
            onClick={() => insertFormat('- ', '')}
            className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-primary-600 rounded-lg transition-all" 
            title="List"
          >
            <List size={16} />
          </button>
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
