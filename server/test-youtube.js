const { Innertube } = require('youtubei.js');

async function test() {
    const videoId = 'C_78DM8OBG8'; // Apple M1 Explained

    console.log('Fetching transcript with Innertube for:', videoId);
    try {
        const youtube = await Innertube.create();
        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();

        if (transcriptData && transcriptData.transcript) {
            console.log('Transcript found!');
            // transcriptData.transcript.content.body.initial_segments 
            // The structure is complex, let's print a bit
             const lines = transcriptData.transcript.content.body.initial_segments.map(seg => seg.snippet.text);
             console.log('Lines found:', lines.length);
             console.log('First 3 lines:', lines.slice(0, 3));
             console.log('Full Text Preview:', lines.join(' ').substring(0, 100));
        } else {
            console.log('No transcript found.');
        }

    } catch (e) {
        console.error('Error fetching transcript:', e);
    }
}

test();

