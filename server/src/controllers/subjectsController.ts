import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';

export const createSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { termId, title, color } = req.body;
    
    // AuthRequest check in SQL policy handles user mapping via term
    // But we should verify termId ownership if we want to be strict here or rely on RLS on insert?
    // The RLS policy for 'subjects' checks: exists (select 1 from terms where terms.id = subjects.term_id and terms.user_id = auth.uid())
    // So if the user tries to insert a subject for a term they don't own, the DB rejects it.

    const { data, error } = await req.supabase!
      .from('subjects')
      .insert({ term_id: termId, title, color })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getSubjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { termId } = req.query;

    if (!termId) {
       res.status(400).json({ error: 'Term ID required' });
       return;
    }

    const { data, error } = await req.supabase!
      .from('subjects')
      .select('*, resources(count)')
      .eq('term_id', termId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    console.log('Raw subjects data:', JSON.stringify(data, null, 2));

    // Transform data to include resourceCount
    const subjects = data.map((sub: any) => ({
        ...sub,
        resourceCount: sub.resources?.[0]?.count || 0,
        resources: undefined // Remove the nested resources array
    }));

    res.status(200).json(subjects);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase!
      .from('subjects')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
