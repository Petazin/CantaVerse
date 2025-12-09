import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  const [searchTerm, setSearchTerm] = useState('');

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
        navigate(`/player/${videoId}`);
      } else {
        navigate(`/sync-tool?videoId=${videoId}`);
      }

    } catch (error) {
      alert("URL de YouTube inválida.");
    }
  };

  const handleDelete = async (youtubeId: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar "${title}"?\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/songs/${youtubeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Eliminar de la lista localmente
        setSongs(prev => prev.filter(s => s.youtubeId !== youtubeId));
      } else {
        alert('Error al eliminar la canción.');
      }
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Error de conexión al intentar eliminar.');
    }
  };

  // Filtrado de canciones
  const filteredSongs = songs.filter(song => {
    const term = searchTerm.toLowerCase();
    return song.title.toLowerCase().includes(term) || song.artist.toLowerCase().includes(term);
  });

  return (
    <div className="page-container" style={{ flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Sección Superior: Carga via URL */}
      <div className="url-loader-section glass-panel" style={{ width: '100%', marginBottom: '30px', textAlign: 'center', borderRadius: 'var(--radius-card)', padding: '30px' }}>
        <h2>🎵 Cargar Nueva Canción</h2>
        <div className="url-input-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega una URL de YouTube..."
            style={{ width: 'auto', flex: 1 }} // Override width 100% from CSS if needed, but flex 1 handles it
          />
          <button onClick={handleLoadFromUrl} className="button-primary">
            Cargar / Sincronizar
          </button>
        </div>
      </div>

      <hr style={{ width: '100%', borderColor: 'var(--border-light)', marginBottom: '30px' }} />

      {/* Sección Principal: Biblioteca */}
      <div className="song-list-container no-scrollbar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'sticky', top: 0, backgroundColor: 'rgba(15,15,19,0.95)', backdropFilter: 'blur(10px)', zIndex: 10, padding: '15px 0', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ margin: 0 }}>📚 Tu Biblioteca ({filteredSongs.length})</h2>

          {/* Buscador */}
          <input
            type="text"
            placeholder="🔍 Buscar por artista o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px' }}
          />
        </div>

        {isLoading && <p style={{ textAlign: 'center', color: 'var(--accent-primary)' }}>Cargando biblioteca...</p>}
        {error && <p className="error-message" style={{ textAlign: 'center' }}>{error}</p>}

        {!isLoading && !error && filteredSongs.length === 0 && (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '50px', borderRadius: 'var(--radius-card)', borderStyle: 'dashed' }}>
            <p style={{ fontSize: '1.2em', color: 'var(--text-secondary)' }}>
              {songs.length === 0 ? "No tienes canciones guardadas aún." : "No se encontraron resultados para tu búsqueda."}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredSongs.length > 0 && (
          <div className="song-grid">
            {filteredSongs.map(song => (
              <div key={song.youtubeId} className="song-card">
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <img
                    src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                    alt={song.title}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                    pointerEvents: 'none'
                  }}></div>
                </div>

                {/* Info */}
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={song.title}>
                    {song.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9em', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    {song.artist}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => navigate(`/player/${song.youtubeId}`)}
                      className="button-primary"
                      style={{ flex: 1, borderRadius: 'var(--radius-sm)' }}
                    >
                      ▶ Reproducir
                    </button>
                    <button
                      onClick={() => navigate(`/sync-tool?videoId=${song.youtubeId}`)}
                      title="Editar Sincronización"
                      className="button-secondary"
                      style={{ borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(song.youtubeId, song.title)}
                      title="Eliminar Canción"
                      className="button-icon"
                      style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)', color: '#ff4444' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
