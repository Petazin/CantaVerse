import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import YouTube from 'react-youtube';

// Tipos de datos según la respuesta de la API
interface LyricLine {
  time: number;
  text: string; // El backend devuelve 'text' para las líneas traducidas
}

interface SongData {
  id: number;
  youtubeId: string;
  title: string;
  artist: string;
  lyrics: { time: number; original: string }[]; // La letra original tiene una estructura ligeramente diferente
  translatedLyrics: LyricLine[] | null;
}

function PlayerPage() {
  const { songId } = useParams<{ songId: string }>();

  // Estados para los datos de la canción, carga y error
  const [songData, setSongData] = useState<SongData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para la reproducción y sincronización
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const [syncOffset, setSyncOffset] = useState(0.3);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef<any | null>(null);
  const originalLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const translatedLineRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  // Efecto para obtener los datos de la canción desde la API
  useEffect(() => {
    if (!songId) {
      setError('No se proporcionó un ID de canción.');
      setIsLoading(false);
      return;
    }

    const fetchSongData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/songs/${songId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error al cargar la canción: ${response.statusText}`);
        }
        const data: SongData = await response.json();
        setSongData(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [songId]);

  // Efecto para el auto-scroll de las letras
  useEffect(() => {
    if (activeLineIndex < 0) return;
    const scrollOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'center' };
    originalLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
    if (songData?.translatedLyrics) {
      translatedLineRefs.current[activeLineIndex]?.scrollIntoView(scrollOptions);
    }
  }, [activeLineIndex, songData]);

  const onPlayerReady = (event: { target: any }) => { playerRef.current = event.target; };
  const onPlayerStateChange = (event: { data: number }) => { setIsPlaying(event.data === 1); };

  // Efecto para la sincronización de las letras con el tiempo del video
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

  if (isLoading) return <div>Cargando canción...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!songData) return <div>Canción no encontrada.</div>;

  const playerOptions = { height: '390', width: '640' };

  return (
    <div className="page-container">
      <div className="player-area">
        <h2>{songData.artist} - {songData.title}</h2>
        <YouTube videoId={songData.youtubeId} opts={playerOptions} onReady={onPlayerReady} onStateChange={onPlayerStateChange} />
        <div className="sync-control">
          <label htmlFor="sync-offset">Ajuste de Sincronización: {syncOffset.toFixed(2)} s</label>
          <input type="range" id="sync-offset" min="-1" max="3" step="0.05" value={syncOffset} onChange={(e) => setSyncOffset(parseFloat(e.target.value))} />
        </div>
      </div>
      <div className="lyrics-display" style={{ gridTemplateColumns: songData.translatedLyrics ? '1fr 1fr' : '1fr' }}>
        <div className="lyrics-column">
          <h3>Original</h3>
          {songData.lyrics.map((line, index) => (
            <p key={index} ref={el => { originalLineRefs.current[index] = el; }} className={index === activeLineIndex ? 'active' : ''}>
              {line.original}
            </p>
          ))}
        </div>
        {songData.translatedLyrics && (
          <div className="lyrics-column">
            <h3>Traducción</h3>
            {songData.translatedLyrics.map((line, index) => (
              <p key={index} ref={el => { translatedLineRefs.current[index] = el; }} className={index === activeLineIndex ? 'active' : ''}>
                {line.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayerPage;