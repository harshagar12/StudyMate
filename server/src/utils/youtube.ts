import { Innertube } from 'youtubei.js';

let youtube: Innertube | null = null;

const getYoutubeClient = async () => {
  if (!youtube) {
    youtube = await Innertube.create();
  }
  return youtube;
};

export interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  transcript?: string;
}

const { YoutubeTranscript } = require('youtube-transcript');

export const getVideoInfo = async (videoId: string): Promise<VideoMetadata> => {
  try {
    const yt = await getYoutubeClient();
    const info = await yt.getInfo(videoId);
    
    let transcriptText = '';
    
    // Attempt 1: Innertube
    try {
      const transcriptData = await info.getTranscript();
      if (transcriptData && transcriptData.transcript) {
         const segments = transcriptData.transcript.content?.body?.initial_segments || [];
         transcriptText = segments.map((seg: any) => seg.snippet.text).join(' ');
      }
    } catch (e) {
      // console.warn(`Innertube transcript failed for ${videoId}, trying fallback...`);
      // Attempt 2: youtube-transcript (Fallback)
      try {
          const fallbackTranscript = await YoutubeTranscript.fetchTranscript(videoId);
          if (fallbackTranscript && fallbackTranscript.length > 0) {
              transcriptText = fallbackTranscript.map((t: any) => t.text).join(' ');
              // console.log(`Fallback transcript success for ${videoId}`);
          }
      } catch (fallbackError) {
          console.warn(`All transcript fetch attempts failed for ${videoId}:`, fallbackError);
      }
    }

    return {
      videoId,
      title: info.basic_info.title || 'Unknown Title',
      description: info.basic_info.short_description || '',
      transcript: transcriptText
    };

  } catch (error) {
    console.error('YouTube Info Fetch Error:', error);
    throw new Error('Failed to fetch video info');
  }
};

export const extractVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const extractPlaylistId = (url: string): string | null => {
    const regExp = /[?&]list=([^#\&\?]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
};

export const getPlaylistMetadata = async (playlistId: string): Promise<{ title: string; videos: string[] }> => {
    try {
        const yt = await getYoutubeClient();
        const playlist = await yt.getPlaylist(playlistId);
        
        const videos = playlist.items
            .map((item: any) => item.id)
            .filter((id: any) => typeof id === 'string');

        return {
            title: playlist.info.title || 'Unknown Playlist',
            videos
        };
    } catch (error) {
        console.warn('Failed to fetch playlist items:', error);
        return { title: 'Unknown Playlist', videos: [] };
    }
};
