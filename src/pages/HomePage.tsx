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
      <div className="url-loader-section" style={{ width: '100%', marginBottom: '30px', textAlign: 'center' }}>
        <h2>🎵 Cargar Nueva Canción</h2>
        <div className="url-input-container" style={{ display: 'flex', gap: '10px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Pega una URL de YouTube..."
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#222', color: 'white' }}
          />
          <button onClick={handleLoadFromUrl} style={{ padding: '10px 20px', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Cargar / Sincronizar
          </button>
        </div>
      </div>

      <hr style={{ width: '100%', borderColor: '#333', marginBottom: '30px' }} />

      {/* Sección Principal: Biblioteca */}
      <div className="song-list-container" style={{ width: '100%', flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', position: 'sticky', top: 0, backgroundColor: '#121212', zIndex: 10, padding: '10px 0', borderBottom: '1px solid #333' }}>
          <h2 style={{ margin: 0 }}>📚 Tu Biblioteca ({filteredSongs.length})</h2>

          {/* Buscador */}
          <input
            type="text"
            placeholder="🔍 Buscar por artista o título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid #444',
              backgroundColor: '#1a1a1a',
              color: 'white',
              width: '300px'
            }}
          />
        </div>

        {isLoading && <p style={{ textAlign: 'center', color: '#ffc107' }}>Cargando biblioteca...</p>}
        {error && <p style={{ color: '#ff4444', textAlign: 'center' }}>{error}</p>}

        {!isLoading && !error && filteredSongs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px dashed #444' }}>
            <p style={{ fontSize: '1.2em', color: '#888' }}>
              {songs.length === 0 ? "No tienes canciones guardadas aún." : "No se encontraron resultados para tu búsqueda."}
            </p>
          </div>
        )}

        {!isLoading && !error && filteredSongs.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
            width: '100%'
          }}>
            {filteredSongs.map(song => (
              <div key={song.youtubeId} style={{
                backgroundColor: '#1e1e1e',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #333',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = '#555'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#333'; }}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
                  <img
                    src={`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`}
                    alt={song.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
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
                <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={song.title}>
                    {song.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.9em', color: '#aaa', marginBottom: '15px' }}>
                    {song.artist}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => navigate(`/player/${song.youtubeId}`)}
                      style={{ flex: 1, padding: '8px', backgroundColor: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'black' }}
                    >
                      ▶ Reproducir
                    </button>
                    <button
                      onClick={() => navigate(`/sync-tool?videoId=${song.youtubeId}`)}
                      title="Editar Sincronización"
                      style={{ padding: '8px 12px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '4px', cursor: 'pointer', color: 'white' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(song.youtubeId, song.title)}
                      title="Eliminar Canción"
                      style={{ padding: '8px 12px', backgroundColor: '#330000', border: '1px solid #550000', borderRadius: '4px', cursor: 'pointer', color: '#ff4444' }}
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
