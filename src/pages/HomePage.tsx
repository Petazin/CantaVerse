import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { songLibrary } from '../data';

function HomePage() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleLoadFromUrl = () => {
    try {
      const urlObject = new URL(url);
      const videoId = urlObject.searchParams.get('v') || urlObject.pathname.substring(1);
      
      if (!videoId) {
        alert("No se pudo encontrar un ID de video en la URL.");
        return;
      }

      // Comprobar si la canción ya existe en la librería local
      const existingSong = songLibrary.find(song => song.videoId === videoId);

      if (existingSong) {
        // Si existe, ir directamente al reproductor
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
    <div className="page-container" style={{flexDirection: 'column', alignItems: 'center'}}>
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
        <ul>
          {songLibrary.map(song => (
            <li key={song.videoId}>
              <Link to={`/player/${song.videoId}`}>
                {song.artist} - {song.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
