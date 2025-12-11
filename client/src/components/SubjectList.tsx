import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Subject } from '../types';
import { Plus, Trash2, Folder, ChevronRight, BookOpen, Loader2 } from 'lucide-react';

interface Props {
  termId: string;
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject) => void;
}

export default function SubjectList({ termId, selectedSubject, onSelectSubject }: Props) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    if (termId) loadSubjects();
  }, [termId]);

  const loadSubjects = async () => {
    try {
      const data = await api.getSubjects(termId);
      setSubjects(data || []);
      // Optional: Auto-select first subject? Maybe not.
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      // Pick a random refined color
      const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#10b981', '#3b82f6'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newSub = await api.createSubject({ termId, title: newTitle, color: randomColor });
      setNewTitle('');
      setIsCreating(false);
      loadSubjects();
      // Auto select new subject
      if (newSub) onSelectSubject(newSub);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this subject?')) return;
    try {
      await api.deleteSubject(id);
      loadSubjects();
      if (selectedSubject?.id === id) {
          onSelectSubject(null as any); // Clear selection
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-full text-slate-400">
        <Loader2 className="animate-spin text-primary-400 w-6 h-6" />
      </div>
    );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-0.5">Subjects</p>
          <h2 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-500" />
            Topics in this term
          </h2>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="text-slate-500 hover:text-white hover:bg-primary-500 p-2 rounded-xl transition-all border border-slate-200 hover:border-primary-500 shadow-sm hover:shadow-md active:scale-95"
          title="Add Subject"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 custom-scrollbar">
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-2 animate-fade-in">
            <input
              autoFocus
              type="text"
              placeholder="Subject Name..."
              className="w-full px-4 py-3 rounded-xl bg-white border border-primary-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 outline-none text-sm font-medium transition-all text-slate-900 placeholder:text-slate-400 shadow-sm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={() => !newTitle && setIsCreating(false)}
            />
          </form>
        )}

        {subjects.map((subject) => (
          <div
            key={subject.id}
            onClick={() => onSelectSubject(subject)}
            className={`group cursor-pointer p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
              selectedSubject?.id === subject.id
                ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-500/20'
                : 'bg-white border-surface-200 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 hover:-translate-y-0.5'
            }`}
          >
            {selectedSubject?.id === subject.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l-xl"></div>
            )}
            <div className="flex items-center justify-between pl-2">
                <div className="flex items-center gap-3.5">
                    <div 
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${selectedSubject?.id === subject.id ? 'shadow-glow' : ''}`}
                        style={{ backgroundColor: subject.color || '#8b5cf6' }}
                    >
                        <Folder size={18} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm transition-colors ${selectedSubject?.id === subject.id ? 'text-primary-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                            {subject.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5 group-hover:text-slate-500 transition-colors">
                            {subject.resourceCount || 0} resources
                        </p>
                    </div>
                </div>
                
                {selectedSubject?.id === subject.id ? (
                    <ChevronRight size={16} className="text-primary-500 animate-in slide-in-from-left-2" />
                ) : (
                    <button
                        onClick={(e) => handleDelete(subject.id, e)}
                        className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-rose-50 rounded-lg"
                    >
                        <Trash2 size={15} />
                    </button>
                )}
            </div>
          </div>
        ))}

        {subjects.length === 0 && !isCreating && (
          <div className="text-center py-12 px-4 bg-surface-50/50 border-2 border-dashed border-surface-200 rounded-2xl flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
              <Folder size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">No subjects yet.</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-primary-600 text-xs font-bold hover:text-primary-700 hover:underline transition-all"
            >
              Create your first subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
