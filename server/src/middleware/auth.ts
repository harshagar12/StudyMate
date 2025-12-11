import { Request, Response, NextFunction } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user?: any;
  supabase?: SupabaseClient;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
     res.status(401).json({ error: 'Missing authorization header' });
     return;
  }

  const token = authHeader.split(' ')[1];
  const supabaseUrl = process.env.SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_ANON_KEY!; // We use anon key but with user's token

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
     res.status(401).json({ error: 'Invalid token' });
     return;
  }

  (req as AuthenticatedRequest).user = user;
  (req as AuthenticatedRequest).supabase = supabase;

  next();
};
