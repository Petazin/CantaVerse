import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';

// --- Tipos de Datos ---
interface SyncedLine {
  time: number;
  original: string;
  translated: string;
}
interface SongData {
  videoId: string;
  title: string;
  artist: string;
  lyrics: SyncedLine[];
}

export default function SyncToolPage() {
  const [searchParams] = useSearchParams();
  const [videoId, setVideoId] = useState<string | null>(searchParams.get('videoId'));

  // Estados de Texto
  const [rawLyrics, setRawLyrics] = useState('');
  const [originalLines, setOriginalLines] = useState<string[]>([]);
  const [translatedLines, setTranslatedLines] = useState<string[]>([]);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  // Estados de Sincronización
  const [syncedLyrics, setSyncedLyrics] = useState<SyncedLine[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [finalJson, setFinalJson] = useState<SongData | null>(null);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const previewLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // --- Lógica de Carga y Traducción ---
  const handleProcessOriginalLyrics = () => {
    const processed = rawLyrics.split('\n').filter(line => line.trim() !== '');
    setOriginalLines(processed);
    setTranslatedLines([]);
    setCurrentIndex(0);
    setSyncedLyrics([]);
    setFinalJson(null);
  };

  const handleFetchTranslation = async () => {
    if (originalLines.length === 0) return alert('Primero carga la letra original.');
    setIsLoadingTranslation(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lines: originalLines, targetLang: 'es' }),
      });
      if (!response.ok) throw new Error('La traducción de la API falló.');
      const data = await response.json();
      setTranslatedLines(data.translatedLines);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoadingTranslation(false);
    }
  };

  // --- Lógica de Sincronización ---
  const handleMarkTime = () => {
    if (!playerRef.current || currentIndex >= originalLines.length) return;
    const currentTime = playerRef.current.getCurrentTime();
    const newSyncedLine = {
      time: parseFloat(currentTime.toFixed(2)),
      original: originalLines[currentIndex],
      translated: translatedLines[currentIndex] || originalLines[currentIndex],
    };
    setSyncedLyrics(prev => [...prev, newSyncedLine]);
    setCurrentIndex(prev => prev + 1);
  };

  useEffect(() => {
    if (originalLines.length > 0 && currentIndex === originalLines.length) {
      const videoData = playerRef.current?.getVideoData();
      const fullTitle = videoData?.title || 'Sin Título';
      const parts = fullTitle.replace(/\s*\(.*?\)|\s*\[.*?\]/g, '').trim().split(/\s*[-–—]\s*/);
      const artist = parts.length >= 2 ? parts[0].trim() : 'Artista Desconocido';
      const title = parts.length >= 2 ? parts[1].trim() : fullTitle;
      setFinalJson({ videoId: videoId || '', title, artist, lyrics: syncedLyrics });
    }
  }, [currentIndex, originalLines, syncedLyrics, videoId]);

  // Auto-scroll para la vista previa
  useEffect(() => {
    if (currentIndex >= 0 && previewLineRefs.current[currentIndex]) {
      previewLineRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentIndex]);

  // Atajo de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); handleMarkTime(); } };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMarkTime]);

  const playerOptions = { height: '390', width: '640' };

  return (
    <div className="page-container">
      <div className="player-area">
        <h2>Herramienta de Sincronización</h2>
        {videoId && <YouTube videoId={videoId} opts={playerOptions} onReady={(e) => { playerRef.current = e.target; }} />}
        <h3>Controles</h3>
        <div className="controls-grid">
          <textarea value={rawLyrics} onChange={(e) => setRawLyrics(e.target.value)} placeholder="1. Pega la letra original aquí..." />
          <button onClick={handleProcessOriginalLyrics}>Cargar Letra</button>
          <button onClick={handleFetchTranslation} disabled={isLoadingTranslation}>{isLoadingTranslation ? 'Traduciendo...' : 'Buscar Traducción'}</button>
          <button onClick={handleMarkTime}>Marcar Tiempo (Espacio)</button>
        </div>
        <h3>Resultado JSON</h3>
        <textarea readOnly value={finalJson ? JSON.stringify(finalJson, null, 2) : ''} />
        <button onClick={() => navigator.clipboard.writeText(JSON.stringify(finalJson, null, 2))} disabled={!finalJson}>Copiar</button>
      </div>
      <div className="lyrics-display">
        <div className="lyrics-column">
          <h3>Original</h3>
          {originalLines.map((line, index) => (
            <p key={index} ref={el => previewLineRefs.current[index] = el} className={index === currentIndex ? 'active' : ''}>{line}</p>
          ))}
        </div>
        <div className="lyrics-column">
          <h3>Traducción</h3>
          {translatedLines.map((line, index) => (
            <p key={index} className={index === currentIndex ? 'active' : ''}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
