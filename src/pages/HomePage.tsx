import { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import type { YouTubePlayer } from 'youtube-player/dist/types';

// Importamos directamente el archivo JSON con la canción sincronizada
import songData from '../data/slipknot-wait-and-bleed.json';

function HomePage() {
  const [activeLineIndex, setActiveLineIndex] = useState(-1);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<number | null>(null);

  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
  };

  const onPlayerStateChange = (event: { data: number }) => {
    // data === 1 significa que el video se está reproduciendo
    if (event.data === 1) {
      // Iniciar el intervalo para verificar el tiempo
      intervalRef.current = window.setInterval(() => {
        const currentTime = playerRef.current?.getCurrentTime();
        if (currentTime === undefined) return;

        // Encontrar la última línea cuya marca de tiempo ya pasamos
        let newActiveLineIndex = -1;
        for (let i = 0; i < songData.lyrics.length; i++) {
          if (currentTime >= songData.lyrics[i].time) {
            newActiveLineIndex = i;
          } else {
            break; // Las líneas están ordenadas, así que podemos parar
          }
        }
        
        setActiveLineIndex(newActiveLineIndex);

      }, 250); // Verificar 4 veces por segundo
    } else {
      // Si el video se pausa, se detiene, etc., limpiamos el intervalo
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // Limpiar el intervalo si el componente se desmonta
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const playerOptions = {
    height: '390',
    width: '640',
  };

  return (
    <div>
      <h2>{songData.artist} - {songData.title}</h2>
      <main>
        <YouTube 
          videoId={songData.videoId} 
          opts={playerOptions} 
          onReady={onPlayerReady} 
          onStateChange={onPlayerStateChange} 
        />
        <div className="lyrics-container">
          {songData.lyrics.map((line, index) => (
            <p key={index} className={index === activeLineIndex ? 'active' : ''}>
              {line.text}
            </p>
          ))}
        </div>
      </main>
    </div>
  );
}

export default HomePage;
