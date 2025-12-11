import { Response } from 'express';

import { AuthenticatedRequest } from '../middleware/auth';
import { extractTextFromPDF, chunkText, generateEmbedding } from '../utils/rag';
import { getVideoInfo, extractVideoId, extractPlaylistId, getPlaylistMetadata } from '../utils/youtube';

export const createResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let { subjectId, title, type } = req.body;
    const file = req.file;
    const userId = req.user.id;

    if (!file && type === 'pdf') {
       res.status(400).json({ error: 'File required for PDF type' });
       return;
    }

    let url = '';
    let content = '';

    // 1. Upload to Storage OR Handle YouTube
    if (type === 'pdf' && file) {
      // ... existing PDF logic ...
      const fileName = `${userId}/${Date.now()}_${file.originalname}`;
      
      const { error: uploadError } = await req.supabase!.storage
        .from('study-materials')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = req.supabase!.storage
        .from('study-materials')
        .getPublicUrl(fileName);
      
      url = publicUrl;

      // Extract text
      try {
        content = await extractTextFromPDF(file.buffer);
      } catch (e) {
          console.error('PDF Parse Error:', e);
          throw new Error('Failed to parse PDF');
      }
    } else if (type === 'youtube') {
       
       const playlistId = extractPlaylistId(req.body.url);
       const videoId = extractVideoId(req.body.url);

       if (playlistId) {
           // Handle Playlist
           console.log('Processing Playlist:', playlistId);
           const { title: playlistTitle, videos } = await getPlaylistMetadata(playlistId);
           
           if (videos.length === 0) {
               res.status(400).json({ error: 'No videos found in playlist' });
               return;
           }

           // Set top-level resource metadata
           title = playlistTitle;
           url = `https://www.youtube.com/playlist?list=${playlistId}`;
           // We won't store a single huge transcript in 'content_summary' but maybe a summary
           content = `Playlist: ${playlistTitle}\nContains ${videos.length} videos.`;

           // Create the Resource *first*
           const { data: resource, error: resourceError } = await req.supabase!
            .from('resources')
            .insert({
                subject_id: subjectId,
                title,
                type: 'youtube_playlist', // New type
                url,
                content_summary: content
            })
            .select()
            .single();

            if (resourceError) throw resourceError;

            // Process videos in background (or loop await if we want to ensure completion)
            // For MVP, loop await.
            console.log(`Fetching transcripts for ${videos.length} videos...`);
            
            const embeddingsData = [];
            
            // Limit to first 20 videos to avoid timeouts for now
            const videosToProcess = videos.slice(0, 20); 

            for (const vid of videosToProcess) {
                try {
                    const videoInfo = await getVideoInfo(vid);
                    if (videoInfo.transcript) {
                        // Chunk video transcript
                        // Prepend Context so AI knows which video this is
                        const contextPrefix = `[Video: ${videoInfo.title}] `;
                        const chunks = chunkText(videoInfo.transcript);
                        
                        for (const chunk of chunks) {
                            const embedding = await generateEmbedding(contextPrefix + chunk);
                            embeddingsData.push({
                                resource_id: resource.id,
                                content: contextPrefix + chunk,
                                embedding
                            });
                        }
                    }
                } catch (e) {
                    console.warn(`Skipping video ${vid} in playlist processing`, e);
                }
            }
            
            // Batch insert embeddings
            if (embeddingsData.length > 0) {
                 // Insert in batches of 50 to avoid request size limits?
                 // Supabase handles large inserts okay usually, but let's be safe if it's huge
                 // Simple approach first.
                 
                 const { error: embeddingError } = await req.supabase!
                    .from('embeddings')
                    .insert(embeddingsData);
                 
                 if (embeddingError) console.error('Playlist embedding error:', embeddingError);
            }

            res.status(201).json(resource);
            return; // EXIT HERE as we manually handled insertion

       } else if (videoId) {
           // Handle Single Video
           url = `https://www.youtube.com/watch?v=${videoId}`;
           
           // Process video info
           try {
               const videoInfo = await getVideoInfo(videoId);
               title = title || videoInfo.title; 
               content = `${videoInfo.title}\n\n${videoInfo.description}\n\nTranscript:\n${videoInfo.transcript}`;
           } catch (e) {
               console.error('YouTube Processing Error:', e);
               res.status(400).json({ error: 'Failed to process YouTube video' });
               return;
           }
       } else {
           res.status(400).json({ error: 'Invalid YouTube URL' });
           return;
       }

    } else {
        // Handle links or other types if implemented
        url = req.body.url || '';
        content = req.body.content || ''; // If they paste text
    }

    // 2. Insert Resource Metadata

    const { data: resource, error: resourceError } = await req.supabase!
      .from('resources')
      .insert({
        subject_id: subjectId,
        title,
        type,
        url,
        content_summary: content.substring(0, 200) + '...'
      })
      .select()
      .single();

    if (resourceError) throw resourceError;

    // 3. RAG Pipeline: Chunk & Embed
    if (content) {
      const chunks = chunkText(content);
      const embeddingsData = [];

      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        embeddingsData.push({
          resource_id: resource.id,
          content: chunk,
          embedding
        });
      }

      const { error: embeddingError } = await req.supabase!
        .from('embeddings')
        .insert(embeddingsData);

      if (embeddingError) {
          console.error('Embedding error:', embeddingError);
          // Don't fail the whole request, but warn
      }
    }

    res.status(201).json(resource);
  } catch (error: any) {
    console.error('Controller Error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getResources = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { subjectId } = req.query;

    if (!subjectId) {
        res.status(400).json({ error: 'Subject ID required' });
        return;
    }

    const { data, error } = await req.supabase!
      .from('resources')
      .select('*')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteResource = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await req.supabase!
      .from('resources')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
