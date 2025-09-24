import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';

// El JSON generado solo necesita esta estructura simple
interface FinalLyricLine {
  time: number;
  original: string;
}

export default function SyncToolPage() {
  const [searchParams] = useSearchParams();
  const [videoId, setVideoId] = useState<string | null>(searchParams.get('videoId'));

  const [rawLyrics, setRawLyrics] = useState('');
  const [lines, setLines] = useState<string[]>([]);
  const [syncedLyrics, setSyncedLyrics] = useState<FinalLyricLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const previewLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  const handleLoadLyrics = () => {
    const processed = rawLyrics.split('\n').filter(line => line.trim() !== '');
    setLines(processed);
    setCurrentIndex(0);
    setSyncedLyrics([]);
  };

  const handleMarkTime = () => {
    if (!playerRef.current || currentIndex >= lines.length) return;
    const currentTime = playerRef.current.getCurrentTime();
    const newSyncedLine = {
      time: parseFloat(currentTime.toFixed(2)),
      original: lines[currentIndex],
    };
    setSyncedLyrics(prev => [...prev, newSyncedLine]);
    setCurrentIndex(prev => prev + 1);
  };

  // ... (Efectos de teclado y scroll sin cambios) ...
  useEffect(() => {
    if (currentIndex >= 0 && previewLineRefs.current[currentIndex]) {
      previewLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleMarkTime(); } };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMarkTime]);

  const playerOptions = { height: '390', width: '640' };

  const getFinalJson = () => {
    if (!videoId || syncedLyrics.length !== lines.length || lines.length === 0) return null;
    const videoData = playerRef.current?.getVideoData();
    const fullTitle = videoData?.title || 'Sin Título';
    const parts = fullTitle.replace(/\s*\(.*?\)|\s*\[.*?\]/g, '').trim().split(/\s*[-–—]\s*/);
    const artist = parts.length >= 2 ? parts[0].trim() : 'Artista Desconocido';
    const title = parts.length >= 2 ? parts[1].trim() : fullTitle;
    return { videoId, title, artist, lyrics: syncedLyrics };
  };

  const finalJson = getFinalJson();

  return (
    <div className="page-container">
      <div className="player-area">
        <h2>Herramienta de Sincronización</h2>
        {videoId && <YouTube videoId={videoId} opts={playerOptions} onReady={(e) => { playerRef.current = e.target; }} />}
        <h3>Letra Original</h3>
        <textarea value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} placeholder="Pega aquí la letra original..." />
        <button onClick={handleLoadLyrics}>Cargar Letra</button>
        <button onClick={handleMarkTime}>Marcar Tiempo (Espacio)</button>
      </div>
      <div className="lyrics-display">
        <div className="lyrics-column">
          <h3>Vista Previa</h3>
          {lines.map((line, index) => (
            <p key={index} ref={el => previewLineRefs.current[index] = el} className={index === currentIndex ? 'active' : ''}>{line}</p>
          ))}
        </div>
        <div className="lyrics-column">
          <h3>Resultado JSON</h3>
          <textarea readOnly value={finalJson ? JSON.stringify(finalJson, null, 2) : ''} style={{height: '100%'}}/>
          <button onClick={() => finalJson && navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2))} disabled={!finalJson}>Copiar</button>
        </div>
      </div>
    </div>
  );
}