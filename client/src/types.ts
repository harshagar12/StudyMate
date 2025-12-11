export interface Term {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  term_id: string;
  title: string;
  color: string;
  created_at: string;
  resourceCount?: number;
}

export interface Resource {
  id: string;
  subject_id: string;
  title: string;
  type: 'pdf' | 'link' | 'youtube' | 'text';
  url: string;
  content_summary: string;
  created_at: string;
}

export interface ChatSource {
  id: string;
  content: string;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}
