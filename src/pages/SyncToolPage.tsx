import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';
import './SyncToolPage.css';

interface SyncedLine {
  time: number;
  text: string;
}

// Estructura del archivo final
interface SongData {
  videoId: string;
  title: string;
  artist: string;
  lyrics: SyncedLine[];
}

export default function SyncToolPage() {
  // Estados para los inputs
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [rawLyrics, setRawLyrics] = useState('');

  // Estados para la lógica de sincronización
  const [lines, setLines] = useState<string[]>([]);
  const [syncedLyrics, setSyncedLyrics] = useState<SyncedLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [songData, setSongData] = useState<SongData | null>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);

  const handleLoadVideo = () => {
    try {
      const urlObject = new URL(url);
      let id = urlObject.searchParams.get('v');
      if (!id) id = urlObject.pathname.substring(1);
      setVideoId(id);
    } catch (err) {
      alert('URL de YouTube inválida.');
    }
  };

  const handleLoadLyrics = () => {
    const processedLines = rawLyrics.split('\n').filter(line => line.trim() !== '');
    setLines(processedLines);
    setCurrentIndex(0);
    setSyncedLyrics([]);
    alert(`Letra cargada con ${processedLines.length} líneas.`);
  };

  const handleCopyToClipboard = () => {
    if (!songData) return;
    navigator.clipboard.writeText(JSON.stringify(songData, null, 2));
    alert('JSON copiado al portapapeles.');
  }

  const handleMarkTime = () => {
    if (!playerRef.current || currentIndex >= lines.length) return;

    const currentTime = playerRef.current.getCurrentTime();
    const newSyncedLine: SyncedLine = {
      time: parseFloat(currentTime.toFixed(2)),
      text: lines[currentIndex],
    };

    setSyncedLyrics(prev => [...prev, newSyncedLine]);
    setCurrentIndex(prev => prev + 1);
  };

  // Generar el JSON final cuando se termina de sincronizar
  useEffect(() => {
    if (lines.length > 0 && currentIndex === lines.length) {
      const videoData = playerRef.current?.getVideoData();
      const fullTitle = videoData?.title || 'Sin Título';
      
      // Reutilizamos la lógica de parseo de títulos
      const parts = fullTitle.replace(/\s*\(.*?\)|\s*\[.*?\]/g, '').trim().split(/\s*[-–—]\s*/);
      const artist = parts.length >= 2 ? parts[0].trim() : 'Artista Desconocido';
      const title = parts.length >= 2 ? parts[1].trim() : fullTitle;

      setSongData({
        videoId: videoId || '',
        title: title,
        artist: artist,
        lyrics: syncedLyrics,
      });
    }
  }, [currentIndex, lines, syncedLyrics, videoId]);

  // Atajo de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleMarkTime();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMarkTime]);

  const playerOptions = { height: '270', width: '480' };

  return (
    <div className="sync-tool-container">
       <div className="sync-tool-left">
        <h3>1. Cargar Video</h3>
        <div className="url-input-container">
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pega la URL de YouTube" />
          <button onClick={handleLoadVideo}>Cargar Video</button>
        </div>
        {videoId && <YouTube videoId={videoId} opts={playerOptions} onReady={(e) => { playerRef.current = e.target; }} />}
        
        <h3>4. Resultado JSON</h3>
        <textarea 
          className="json-output-area"
          readOnly
          value={songData ? JSON.stringify(songData, null, 2) : 'Aquí aparecerá el JSON generado...'}
        />
        <button onClick={handleCopyToClipboard}>Copiar al Portapapeles</button>
      </div>

      <div className="sync-tool-right">
        <h3>2. Pegar Letra</h3>
        <textarea
          className="lyrics-input-area"
          value={rawLyrics}
          onChange={(e) => setRawLyrics(e.target.value)}
          placeholder="Pega aquí la letra de la canción, una línea por verso..."
        />
        <button onClick={handleLoadLyrics}>Cargar Letra</button>

        <h3>3. Sincronizar</h3>
        <button onClick={handleMarkTime}>Marcar Tiempo (Espacio)</button>
        <div className="live-preview-container">
          {lines.length === 0 && <p>La vista previa de la letra aparecerá aquí...</p>}
          {lines.map((line, index) => (
            <p key={index} className={index === currentIndex ? 'current-line' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
