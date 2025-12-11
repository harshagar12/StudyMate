const { Innertube } = require('youtubei.js');

async function test() {
    const playlistId = 'PL5-TkQxhcWH_74Y66qjF5qdacR7sJbXvK'; // Some public playlist ID (e.g. Google Search Central)
    // URL: https://www.youtube.com/playlist?list=PL5-TkQxhcWH_74Y66qjF5qdacR7sJbXvK
    
    console.log('Fetching playlist:', playlistId);
    try {
        const youtube = await Innertube.create();
        const playlist = await youtube.getPlaylist(playlistId);
        
        console.log('Playlist Title:', playlist.info.title);
        console.log('Video Count:', playlist.info.total_items);
        
        // Items are usually in playlist.items or playlist.videos
        console.log('Videos found in initial fetch:', playlist.items.length);
        
        if (playlist.items.length > 0) {
            const firstVideo = playlist.items[0];
            console.log('First Video ID:', firstVideo.id);
            console.log('First Video Title:', firstVideo.title.text);
        }

    } catch (e) {
        console.error('Error fetching playlist:', e);
    }
}

test();
