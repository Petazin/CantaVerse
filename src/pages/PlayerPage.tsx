import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';
import { songLibrary } from '../data';

// Tipos de datos
interface LyricLine {
  time: number;
  text: string;
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
  const [translatedLyrics, setTranslatedLyrics] = useState<string[] | null>(null);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [syncOffset, setSyncOffset] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<YouTubePlayer | null>(null);
  // Dos juegos de referencias, uno para cada columna
  const originalLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const translatedLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Efecto para traducir la letra
  useEffect(() => {
    if (!songData) return;
    const translate = async () => {
      setIsLoadingTranslation(true);
      try {
        const originalLines = songData.lyrics.map(line => line.text);
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lines: originalLines, targetLang: 'es' }),
        });
        if (!response.ok) throw new Error('La traducción falló');
        const data = await response.json();
        setTranslatedLyrics(data.translatedLines);
      } catch (error) {
        console.error(error);
        setTranslatedLyrics(null);
      } finally {
        setIsLoadingTranslation(false);
      }
    };
    translate();
  }, [songData]);

  // Efecto para el auto-scroll sincronizado
  useEffect(() => {
    if (activeLineIndex < 0) return;
    const scrollOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };
    originalLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
    translatedLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
  }, [activeLineIndex]);

  const onPlayerReady = (event: { target: YouTubePlayer }) => { playerRef.current = event.target; };
  const onPlayerStateChange = (event: { data: number }) => { setIsPlaying(event.data === 1); };

  // Efecto para la lógica de sincronización
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

  if (!songData) {
    // TODO: Implementar la lógica de búsqueda en API para canciones no locales
    return <div>Canción no encontrada en la librería local.</div>;
  }

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
              {line.text}
            </p>
          ))}
        </div>
        <div className="lyrics-column">
          <h3>Traducción {isLoadingTranslation ? '(Cargando...)' : ''}</h3>
          {translatedLyrics && songData.lyrics.map((line, index) => (
            <p key={index} ref={el => translatedLineRefs.current[index] = el} className={index === activeLineIndex ? 'active' : ''}>
              {translatedLyrics[index] || ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerPage;