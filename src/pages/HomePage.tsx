import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Interfaz para la canción, coincidiendo con lo que devuelve la API de lista
interface Song {
  id: number;
  youtubeId: string;
  title: string;
  artist: string;
}

function HomePage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  // Estados para la lista de canciones, carga y error
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Efecto para cargar las canciones desde la API
  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/songs');
        if (!response.ok) {
          throw new Error('No se pudieron cargar las canciones. Asegúrate de que el servidor API esté corriendo.');
        }
        const data: Song[] = await response.json();
        setSongs(data);
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  const handleLoadFromUrl = () => {
    try {
      const urlObject = new URL(url);
      const videoId = urlObject.searchParams.get('v') || urlObject.pathname.substring(1);

      if (!videoId) {
        alert("No se pudo encontrar un ID de video en la URL.");
        return;
      }

      // Comprobar si la canción ya existe en la lista de la API
      const existingSong = songs.find(song => song.youtubeId === videoId);

      if (existingSong) {
        // Si existe, ir directamente al reproductor usando el ID de la canción (youtubeId)
        navigate(`/player/${videoId}`);
      } else {
        // Si es nueva, ir a la herramienta de sincronización con el video precargado
        navigate(`/sync-tool?videoId=${videoId}`);
      }

    } catch (error) {
      alert("URL de YouTube inválida.");
    }
  };

  return (
    <div className="page-container" style={{ flexDirection: 'column', alignItems: 'center' }}>
      <div className="url-loader-section">
        <h2>Cargar Nueva Canción</h2>
        <div className="url-input-container">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega una URL de YouTube"
          />
          <button onClick={handleLoadFromUrl}>Cargar</button>
        </div>
      </div>
      <div className="song-list-container">
        <h2>Canciones Guardadas</h2>
        {isLoading && <p>Cargando canciones...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && songs.length === 0 && (
          <p>No hay canciones guardadas aún.</p>
        )}
        {!isLoading && !error && songs.length > 0 && (
          <ul>
            {songs.map(song => (
              <li key={song.youtubeId}>
                {/* El enlace ahora apunta al player usando el youtubeId */}
                <Link to={`/player/${song.youtubeId}`}>
                  {song.artist} - {song.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default HomePage;
