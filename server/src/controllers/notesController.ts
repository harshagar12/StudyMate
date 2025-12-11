import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';

export const getNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { subjectId } = req.query;

        if (!subjectId) {
            res.status(400).json({ error: 'Subject ID is required' });
            return;
        }

        const { data, error } = await req.supabase!
            .from('notes')
            .select('*')
            .eq('subject_id', subjectId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
             throw error;
        }

        // If no note exists, return empty content (or create one on the fly? Let's return null/empty)
        if (!data) {
            res.json({ content: '' });
            return;
        }

        res.json(data);
    } catch (error) {
        console.error('Get Note Error:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
};

export const updateNote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { subjectId, content } = req.body;

        if (!subjectId) {
            res.status(400).json({ error: 'Subject ID is required' });
            return;
        }
        
        // Upsert logic
        // We need to find if it exists, or verify ownership via RLS policy on Insert/Update
        
        const { data, error } = await req.supabase!
            .from('notes')
            .upsert({ 
                subject_id: subjectId, 
                content,
                updated_at: new Date().toISOString()
            }, { onConflict: 'subject_id' })
            .select()
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Update Note Error:', error);
        res.status(500).json({ error: 'Failed to save note' });
    }
};
