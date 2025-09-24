import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';

import songData from '../data/slipknot-wait-and-bleed.json';

function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [syncOffset, setSyncOffset] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (activeLineIndex >= 0 && lineRefs.current[activeLineIndex]) {
      lineRefs.current[activeLineIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLineIndex]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange = (event: { data: number }) => {
    setIsPlaying(event.data === 1);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const intervalId = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime();
      if (currentTime === undefined) return;

      const lookahead = syncOffset;
      let newActiveLineIndex = -1;

      for (let i = songData.lyrics.length - 1; i >= 0; i--) {
        if (currentTime + lookahead >= songData.lyrics[i].time) {
          newActiveLineIndex = i;
          break;
        }
      }
      
      setActiveLineIndex(prevIndex => prevIndex !== newActiveLineIndex ? newActiveLineIndex : prevIndex);

    }, 100);

    return () => clearInterval(intervalId);
  }, [isPlaying, syncOffset]);

  const playerOptions = { height: '390', width: '640' };

  return (
    <div className="home-page-container">
      <div className="player-area">
        <h2>{songData.artist} - {songData.title}</h2>
        <YouTube 
          videoId={songData.videoId} 
          opts={playerOptions} 
          onReady={onPlayerReady} 
          onStateChange={onPlayerStateChange} 
        />
        <div className="sync-control">
          <label htmlFor="sync-offset">Ajuste de Sincronización: {syncOffset.toFixed(2)} s</label>
          <input
            type="range"
            id="sync-offset"
            min="-1"
            max="3"
            step="0.05"
            value={syncOffset}
            onChange={(e) => setSyncOffset(parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className="lyrics-container">
        {songData.lyrics.map((line, index) => (
          <p 
            key={index} 
            ref={el => lineRefs.current[index] = el}
            className={index === activeLineIndex ? 'active' : ''}
          >
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
