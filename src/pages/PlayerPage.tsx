import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player';
import { songLibrary } from '../data';

// Tipos de datos
interface LyricLine {
  time: number;
  original: string;
}
interface Song {
  videoId: string;
  title: string;
  artist: string;
  lyrics: LyricLine[];
}

function PlayerPage() {
  const { songId } = useParams<{ songId: string }>();
  const songData = songLibrary.find(song => song.videoId === songId) as Song | undefined;

  // Estados
  const [translatedLines, setTranslatedLines] = useState<string[] | null>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [syncOffset, setSyncOffset] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  const originalLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const translatedLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Efecto para traducir la letra
  useEffect(() => {
    if (!songData) return;

    const translate = async () => {
      setIsLoadingTranslation(true);
      setTranslationError(null);
      try {
        const originalLines = songData.lyrics.map(line => line.original);
        
        console.log('%c[DEBUG] 1. Preparando para enviar:', 'color: yellow;', { lines: originalLines });

        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lines: originalLines, targetLang: 'es' }),
        });

        console.log('%c[DEBUG] 2. Respuesta recibida del servidor:', 'color: cyan;', response);
        console.log(`%c[DEBUG] 2a. Estado de la respuesta: ${response.status} ${response.statusText}`, 'color: cyan;');

        if (!response.ok) {
          console.error('[DEBUG] 2b. La respuesta no fue exitosa (no es status 2xx).');
          // Intentamos leer el cuerpo como texto para ver el error real
          const errorText = await response.text();
          console.error(`[DEBUG] 2c. Cuerpo del error (texto):`, errorText);
          throw new Error(errorText || 'La traducción falló');
        }

        const data = await response.json();
        
        console.log('%c[DEBUG] 3. Datos JSON parseados exitosamente:', 'color: lightgreen;', data);

        setTranslatedLines(data.translatedLines);
      } catch (error) {
        console.error('%c[DEBUG] 4. Ocurrió un error en el bloque try/catch:', 'color: red;', error);
        setTranslationError((error as Error).message);
        setTranslatedLines(null); // No mostrar nada si falla
      } finally {
        setIsLoadingTranslation(false);
      }
    };
    translate();
  }, [songData]);

  // ... (Lógica de auto-scroll y sincronización sin cambios) ...
  useEffect(() => {
    if (activeLineIndex < 0) return;
    const scrollOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };
    originalLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
    translatedLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
  }, [activeLineIndex]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => { playerRef.current = event.target; };
  const onPlayerStateChange = (event: { data: number }) => { setIsPlaying(event.data === 1); };

  useEffect(() => {
    if (!isPlaying || !songData) return;
    const intervalId = setInterval(() => {
      const currentTime = playerRef.current?.getCurrentTime();
      if (currentTime === undefined) return;
      let newActiveLineIndex = -1;
      for (let i = songData.lyrics.length - 1; i >= 0; i--) {
        if (currentTime + syncOffset >= songData.lyrics[i].time) {
          newActiveLineIndex = i;
          break;
        }
      }
      setActiveLineIndex(prev => prev !== newActiveLineIndex ? newActiveLineIndex : prev);
    }, 100);
    return () => clearInterval(intervalId);
  }, [isPlaying, syncOffset, songData]);

  if (!songData) return <div>Canción no encontrada.</div>;

  const playerOptions = { height: '390', width: '640' };

  return (
    <div className="page-container">
      <div className="player-area">
        <h2>{songData.artist} - {songData.title}</h2>
        <YouTube videoId={songData.videoId} opts={playerOptions} onReady={onPlayerReady} onStateChange={onPlayerStateChange} />
        <div className="sync-control">
          <label htmlFor="sync-offset">Ajuste: {syncOffset.toFixed(2)} s</label>
          <input type="range" id="sync-offset" min="-1" max="3" step="0.05" value={syncOffset} onChange={(e) => setSyncOffset(parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="lyrics-display">
        <div className="lyrics-column">
          <h3>Original</h3>
          {songData.lyrics.map((line, index) => (
            <p key={index} ref={el => originalLineRefs.current[index] = el} className={index === activeLineIndex ? 'active' : ''}>
              {line.original}
            </p>
          ))}
        </div>
        <div className="lyrics-column">
          <h3>Traducción {isLoadingTranslation ? '(Cargando...)' : ''}</h3>
          {translationError && <p className="error-message">Error: {translationError}</p>}
          {translatedLines && !translationError && songData.lyrics.map((line, index) => (
            <p key={index} ref={el => translatedLineRefs.current[index] = el} className={index === activeLineIndex ? 'active' : ''}>
              {translatedLines[index] || ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;