
export interface VideoMetadata {
    title: string;
    artist: string;
    songName: string;
}

export async function fetchVideoMetadata(youtubeId: string): Promise<VideoMetadata | null> {
    try {
        const response = await fetch(`https://www.youtube.com/watch?v=${youtubeId}`);
        if (!response.ok) return null;

        const text = await response.text();

        // Extract title tag
        const titleMatch = text.match(/<title>(.*?)<\/title>/);
        let fullTitle = titleMatch ? titleMatch[1] : '';

        // Remove " - YouTube" suffix
        fullTitle = fullTitle.replace(' - YouTube', '').trim();

        if (!fullTitle) return null;

        // Heuristics to split Artist - Song
        // Most music videos follow "Artist - SongName" or "Artist - SongName (Official Video)"
        let artist = 'Desconocido';
        let songName = fullTitle;

        // Remove common suffixes like (Official Video), [Official Audio], etc.
        const cleanTitle = fullTitle.replace(/\s*[\(\[]\s*(Official|Video|Audio|Lyric|Cover|HD|4K).*?[\)\]]/gi, '').trim();

        const parts = cleanTitle.split(/\s*[-–—]\s*/); // Split by hyphen, en-dash, em-dash
        if (parts.length >= 2) {
            artist = parts[0].trim();
            songName = parts.slice(1).join(' - ').trim(); // Join the rest in case song name has hyphens
        } else {
            // FALLBACK: Try to find Channel Name from HTML
            // Look for <link itemprop="name" content="..."> or similar
            const channelMatch = text.match(/"author":"(.*?)"/) || text.match(/<link itemprop="name" content="(.*?)">/);
            if (channelMatch && channelMatch[1]) {
                // Remove " - Topic" suffix that YouTube auto-generates for artist channels
                artist = channelMatch[1].replace(' - Topic', '').trim();

                // If artist is found, songName is likely the full title (cleaned)
                songName = cleanTitle;
                console.log(`[metadata] Artist infered from Channel Name: ${artist}`);
            }
        }

        return {
            title: fullTitle,
            artist,
            songName
        };

    } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
        return null;
    }
}
