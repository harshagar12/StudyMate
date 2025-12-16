import { useEffect, useState, useRef } from 'react';
import { api } from '../lib/api';
import { Resource } from '../types';
import { Button } from '@headlessui/react';
import { FileText, Youtube, Link as LinkIcon, Trash2, Upload, ExternalLink, Loader2, ListVideo } from 'lucide-react';

interface Props {
  subjectId: string;
}

export default function ResourceList({ subjectId }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadResources();
  }, [subjectId]);

  const loadResources = async () => {
    try {
      const data = await api.getResources(subjectId);
      setResources(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl) return;
    setUploading(true);
    try {
        await api.createResource({
            subjectId,
            title: '', // Backend will fetch title
            type: 'youtube',
            url: youtubeUrl
        });
        setYoutubeUrl('');
        setShowYoutubeInput(false);
        loadResources();
    } catch (error) {
        console.error('Failed to add video:', error);
        alert('Failed to add video. Check URL or console.');
    } finally {
        setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subjectId', subjectId);
      formData.append('title', file.name);
      
      // Determine type
      let type = 'file';
      if (file.type === 'application/pdf') {
          type = 'pdf';
      } else if (file.type.startsWith('image/')) {
          type = 'image';
      }
      formData.append('type', type);

      await api.createResource(formData);
      loadResources();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this resource?')) return;
    try {
      await api.deleteResource(id);
      loadResources();
    } catch (error) {
      console.error(error);
    }
  };

  const isPlaylist = (url: string) => url.includes('list=');

  const getIcon = (resource: Resource) => {
    switch (resource.type) {
      case 'pdf': return <FileText className="text-rose-500" size={20} />;
      case 'image': return <FileText className="text-blue-500" size={20} />; // Or Image icon if available
      case 'youtube': 
      case 'youtube_playlist':
        if (isPlaylist(resource.url)) {
            return <ListVideo className="text-red-600" size={20} />;
        }
        return <Youtube className="text-red-600" size={20} />;
      default: return <LinkIcon className="text-indigo-500" size={20} />;
    }
  };

  const getResourceTypeLabel = (resource: Resource) => {
      if (resource.type === 'youtube' || resource.type === 'youtube_playlist') {
          return isPlaylist(resource.url) ? 'Playlist' : 'Video';
      }
      return resource.type.replace('_', ' ');
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-slate-900">
      <div className="px-5 py-3 border-b border-surface-200 flex flex-nowrap gap-4 items-start justify-between sticky top-0 bg-white/50 backdrop-blur-md z-10 transition-all">
        {!showYoutubeInput ? (
          <>
            <div className="min-w-[100px] pt-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Resources</h2>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">{resources.length} items</p>
            </div>
            
            <div className="flex flex-col gap-2.5 justify-center flex-1 w-auto items-end animate-in fade-in slide-in-from-right-2 duration-300">
              <Button
                onClick={() => setShowYoutubeInput(true)}
                className="h-10 w-[130px] flex items-center justify-center gap-2 text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 px-4 rounded-xl transition-all text-xs font-bold border border-slate-200 shadow-sm hover:shadow-md active:scale-95"
              >
                <Youtube size={16} /> <span>Add Video</span>
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                // accept=".pdf" // Removed to allow all files
                onChange={handleFileUpload}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="h-10 w-[130px] flex items-center justify-center gap-2 bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800 text-xs font-bold transition-all disabled:opacity-70 shadow-lg shadow-slate-900/10 hover:shadow-xl active:scale-95 border border-transparent"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                {uploading ? 'Processing...' : 'Upload File'}
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-2 bg-white p-2 rounded-xl border border-primary-200 shadow-lg shadow-primary-500/10 w-full hover:shadow-primary-500/20 transition-all ring-4 ring-primary-50/50">
                <div className="flex items-center gap-2 w-full">
                    <div className="pl-2 text-red-600 shrink-0">
                        <Youtube size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Paste YouTube or Playlist URL..."
                      className="bg-transparent border-none focus:ring-0 text-sm flex-1 min-w-0 text-slate-900 placeholder:text-slate-400 px-2 py-1.5 font-medium"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleYoutubeSubmit()}
                      autoFocus
                    />
                </div>
                <div className="flex items-center justify-end gap-2 w-full border-t border-slate-100 pt-2">
                  <Button
                    onClick={() => { setShowYoutubeInput(false); setYoutubeUrl(''); }}
                    className="px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors font-medium text-xs hover:text-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleYoutubeSubmit}
                    disabled={uploading || !youtubeUrl}
                    className="bg-primary-600 text-white px-4 py-1.5 rounded-lg hover:bg-primary-700 transition-all shadow-sm font-bold text-xs disabled:opacity-50 disabled:hover:bg-primary-600 flex items-center gap-1.5"
                  >
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : 'Add Video'}
                  </Button>
                </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar relative">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary-400 w-8 h-8" />
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-slate-400 bg-surface-50/50 rounded-3xl border-2 border-dashed border-surface-200 m-2">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Upload size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">No resources yet</p>
            <p className="text-xs text-slate-400 mt-1">Upload a PDF or add a video to start learning</p>
          </div>
        ) : (
          resources.map((resource) => (
            <div 
              key={resource.id} 
              className="group bg-white border border-surface-200 rounded-2xl p-3.5 flex items-center justify-between hover:shadow-xl hover:shadow-slate-200/50 hover:border-primary-200 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${
                  resource.type === 'pdf' 
                    ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100 group-hover:text-rose-600' 
                    : 'bg-red-50 text-red-500 group-hover:bg-red-100 group-hover:text-red-600'
                }`}>
                  {getIcon(resource)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate mb-1 group-hover:text-primary-600 transition-colors">
                    <a href={resource.url} target="_blank" rel="noreferrer" className="outline-none focus:underline decoration-2 underline-offset-2" title={resource.title}>
                      {resource.title}
                    </a>
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="capitalize bg-surface-100 px-2 py-0.5 rounded-md text-slate-600 font-bold text-[10px] tracking-wide border border-surface-200">
                      {getResourceTypeLabel(resource)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300">
                <a 
                  href={resource.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
                  title="Open"
                >
                  <ExternalLink size={18} />
                </a>
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
