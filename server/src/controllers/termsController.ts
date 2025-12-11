import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';

export const createTerm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;

    const { data, error } = await req.supabase!
      .from('terms')
      .insert({ title, description, user_id: userId })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTerms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const { data, error } = await req.supabase!
      .from('terms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTerm = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { error } = await req.supabase!
      .from('terms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
