import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('No active session');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    // 'Content-Type': 'application/json', // Don't set functionality globally, some requests are FormData
  };
  
  // Set Content-Type to json if not FormData
  if (!(options.body instanceof FormData)) {
      (headers as any)['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed: ${response.statusText}`);
  }
  
  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
}

export const api = {
  // Terms
  getTerms: () => fetchWithAuth('/terms'),
  createTerm: (data: { title: string; description?: string }) => 
    fetchWithAuth('/terms', { method: 'POST', body: JSON.stringify(data) }),
  deleteTerm: (id: string) => fetchWithAuth(`/terms/${id}`, { method: 'DELETE' }),

  // Subjects
  getSubjects: (termId: string) => fetchWithAuth(`/subjects?termId=${termId}`),
  createSubject: (data: { termId: string; title: string; color?: string }) => 
    fetchWithAuth('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  deleteSubject: (id: string) => fetchWithAuth(`/subjects/${id}`, { method: 'DELETE' }),

  // Resources
  getResources: (subjectId: string) => fetchWithAuth(`/resources?subjectId=${subjectId}`),
  createResource: (data: FormData | any) => 
    fetchWithAuth('/resources', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  deleteResource: (id: string) => fetchWithAuth(`/resources/${id}`, { method: 'DELETE' }),

  // Chat
  chat: (data: { message: string; subjectId: string }) => 
    fetchWithAuth('/chat', { method: 'POST', body: JSON.stringify(data) }),

  // Notes
  getNote: (subjectId: string) => fetchWithAuth(`/notes?subjectId=${subjectId}`),
  updateNote: (data: { subjectId: string; content: string }) => 
    fetchWithAuth('/notes', { method: 'POST', body: JSON.stringify(data) }),
};
