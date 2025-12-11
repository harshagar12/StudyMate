import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Term, Subject } from '../types';
import SubjectList from './SubjectList';
import ResourceList from './ResourceList';
import Chat from './Chat';
import Notes from './Notes';
import { Button } from '@headlessui/react';
import { LogOut, GraduationCap, Plus, Trash2, Layout, MessageSquare, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { signOut, session } = useAuth();
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');
  const [isCreatingTerm, setIsCreatingTerm] = useState(false);
  const [newTermTitle, setNewTermTitle] = useState('');

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      const data = await api.getTerms();
      setTerms(data || []);
      if (data && data.length > 0 && !selectedTerm) {
        setSelectedTerm(data[0]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTermTitle.trim()) return;
    try {
      const newTerm = await api.createTerm({ title: newTermTitle });
      setNewTermTitle('');
      setIsCreatingTerm(false);
      loadTerms();
      if (newTerm) setSelectedTerm(newTerm);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTerm = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this term? All subjects and notes will be lost.')) return;
    try {
      await api.deleteTerm(id);
      loadTerms();
      if (selectedTerm?.id === id) {
          setSelectedTerm(null);
          setSelectedSubject(null);
      }
    } catch (error) {
        console.error(error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="glass rounded-3xl px-6 py-5 flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-500/20 transform hover:scale-105 transition-transform duration-300">
              <GraduationCap size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight leading-none mb-0.5">Study<span className="text-primary-600">Mate</span></h1>
              <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Student Workspace</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">{session?.user?.email}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold ring-2 ring-white shadow-sm">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>
            <Button
              onClick={() => signOut()}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              <div className="flex items-center gap-2">
                <LogOut size={16} /> <span className="hidden sm:inline">Sign out</span>
              </div>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 min-h-[calc(100vh-140px)]">
          {/* Left column: Terms + Subjects */}
          <div className="col-span-12 md:col-span-3 flex flex-col gap-4 min-h-0">
            <div className="glass-panel rounded-3xl p-5 flex flex-col gap-4 min-h-[320px] transition-all duration-500">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Navigation</p>
                  <h2 className="text-base font-bold text-slate-800">Terms</h2>
                </div>
                <button
                  onClick={() => setIsCreatingTerm(true)}
                  className="text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus size={14} /> New
                </button>
              </div>

              {isCreatingTerm && (
                <form onSubmit={handleCreateTerm} className="animate-fade-in">
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Spring 2025"
                    className="w-full bg-white border border-primary-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-100 placeholder:text-slate-400 shadow-sm"
                    value={newTermTitle}
                    onChange={(e) => setNewTermTitle(e.target.value)}
                    onBlur={() => !newTermTitle && setIsCreatingTerm(false)}
                  />
                </form>
              )}

              <div className="space-y-2.5 overflow-y-auto custom-scrollbar pr-1 flex-1 animate-in slide-in-from-left-4 fade-in duration-500 delay-100">
                {terms.map((term, index) => (
                  <div
                    key={term.id}
                    onClick={() => {
                      setSelectedTerm(term);
                      setSelectedSubject(null);
                    }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden ${
                      selectedTerm?.id === term.id
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 border-transparent text-white shadow-md'
                        : 'bg-white border-slate-100 hover:border-primary-200 hover:shadow-md'
                    }`}
                  >
                     {/* Background decoration for active state */}
                     {selectedTerm?.id === term.id && (
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                     )}

                    <div className="flex items-center gap-3.5 relative z-10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          selectedTerm?.id === term.id 
                            ? 'bg-white/20 text-white'
                            : 'bg-primary-50 text-primary-600 group-hover:bg-primary-100'
                      }`}>
                        {term.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${selectedTerm?.id === term.id ? 'text-white' : 'text-slate-700'}`}>{term.title}</p>
                        <p className={`text-[10px] ${selectedTerm?.id === term.id ? 'text-white/70' : 'text-slate-400'}`}>
                            {selectedTerm?.id === term.id ? 'Active Term' : 'Click to select'}
                        </p>
                      </div>
                    </div>
                    {selectedTerm?.id === term.id && (
                      <button
                        onClick={(e) => handleDeleteTerm(term.id, e)}
                        className="opacity-60 hover:opacity-100 p-1.5 text-white hover:bg-white/20 rounded-lg transition-all relative z-10"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                {terms.length === 0 && !isCreatingTerm && (
                  <div className="text-center py-10 px-4 text-slate-500 text-sm border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="font-medium">No terms found</p>
                    <p className="text-xs mt-1 text-slate-400">Create one to get started</p>
                  </div>
                )}
              </div>
            </div>
            <div className="glass-panel rounded-3xl p-5 flex-1 min-h-[360px] overflow-hidden flex flex-col">
              {selectedTerm ? (
                <SubjectList
                  termId={selectedTerm.id}
                  selectedSubject={selectedSubject}
                  onSelectSubject={setSelectedSubject}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 text-center min-h-[300px] animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Layout size={28} className="text-slate-300" />
                  </div>
                  <div className="max-w-[180px]">
                      <p className="text-sm font-medium text-slate-600 mb-1">No Term Selected</p>
                      <p className="text-xs text-slate-400">Select a term from the list to view your subjects.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle column: Resources */}
          <div className="col-span-12 md:col-span-3 flex flex-col min-h-0">
            <div className="glass-panel rounded-3xl p-5 flex-1 min-h-[360px] overflow-hidden flex flex-col">
              {selectedSubject ? (
                <ResourceList subjectId={selectedSubject.id} />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 text-center min-h-[280px] animate-fade-in">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <Sparkles size={28} className="text-primary-300" />
                  </div>
                  <div className="max-w-[180px]">
                      <p className="text-sm font-medium text-slate-600 mb-1">No Subject Selected</p>
                      <p className="text-xs text-slate-400">Choose a subject to access its learning resources.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Chat / Notes */}
          <div className="col-span-12 md:col-span-6 flex flex-col min-h-0">
            <div className="glass rounded-3xl flex-1 overflow-hidden shadow-xl border border-white/50">
              {selectedSubject ? (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 p-4 border-b border-surface-200 bg-white/50 backdrop-blur-sm">
                    <div className="px-3 py-1 pb-1.5 rounded-lg bg-primary-100 text-primary-700 text-xs font-bold uppercase tracking-wide">
                      {selectedSubject.title}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 border-b border-surface-200 bg-white/30 backdrop-blur-md">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
                        activeTab === 'chat'
                          ? 'bg-white text-primary-700 shadow-sm border-slate-100 ring-1 ring-slate-200/50'
                          : 'text-slate-500 border-transparent hover:bg-white/50 hover:text-slate-700'
                      }`}
                    >
                      <MessageSquare size={16} className={activeTab === 'chat' ? 'text-primary-500' : ''} /> 
                      AI Tutor
                    </button>
                    <button
                      onClick={() => setActiveTab('notes')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all border ${
                        activeTab === 'notes'
                          ? 'bg-white text-emerald-700 shadow-sm border-slate-100 ring-1 ring-slate-200/50'
                          : 'text-slate-500 border-transparent hover:bg-white/50 hover:text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                         <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={activeTab === 'notes' ? 'text-emerald-500' : ''}
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Notes
                      </div>
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden relative bg-white/40">
                    {activeTab === 'chat' ? <Chat subjectId={selectedSubject.id} /> : <Notes subjectId={selectedSubject.id} />}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 relative gap-6 p-8">
                  <div className="relative">
                      <div className="absolute inset-0 bg-primary-400 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                      <div className="w-24 h-24 rounded-3xl bg-white border border-white/60 shadow-xl flex items-center justify-center relative z-10 rotate-3 transition-transform hover:rotate-6 duration-500">
                        <Layout size={40} className="text-primary-400" />
                      </div>
                  </div>
                  
                  <div className="text-center max-w-sm space-y-2">
                    <h2 className="text-2xl font-bold text-slate-800">Select a subject</h2>
                     <p className="text-slate-500 leading-relaxed">
                        Pick a term, choose a subject, then chat with the tutor or capture notes—all in one view.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-primary-600 bg-primary-50 px-4 py-2 rounded-full border border-primary-100">
                    <Sparkles className="w-3.5 h-3.5" /> Start by creating a term and subject.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
