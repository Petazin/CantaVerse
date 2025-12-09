import { BrowserRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SyncToolPage from './pages/SyncToolPage';
import PlayerPage from './pages/PlayerPage';

// Componente para el fondo ambiental dinámico
const AmbientBackground = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Lógica para extraer el ID del video según la ruta
  let videoId: string | null = null;

  // Caso 1: Player Page (/player/:songId)
  // Como useParams solo funciona dentro de <Routes>, usamos matchPath o una lógica manual simple de string
  // ya que este componente está fuera de <Routes> pero dentro de <BrowserRouter>
  const playerMatch = location.pathname.match(/\/player\/([^/]+)/);
  if (playerMatch) {
    videoId = playerMatch[1];
  }

  // Caso 2: Sync Tool (/sync-tool?videoId=...)
  if (location.pathname === '/sync-tool') {
    videoId = searchParams.get('videoId');
  }

  if (!videoId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(80px) saturate(200%) brightness(0.4)',
        zIndex: -1,
        transition: 'background-image 1s ease-in-out',
        opacity: 0.6
      }}
    />
  );
};

function App() {
  return (
    <BrowserRouter>
      <AmbientBackground />
      <div className="App">
        <header className="App-header">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="logo">CantaVerse</h1>
          </Link>
          <nav>
            <Link to="/" className="button-secondary" style={{ padding: '8px 16px', borderRadius: '20px', textDecoration: 'none', marginRight: '10px' }}>Canciones</Link>
            <Link to="/sync-tool" className="button-primary" style={{ padding: '8px 16px', borderRadius: '20px', textDecoration: 'none' }}>Herramienta de Sincronización</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sync-tool" element={<SyncToolPage />} />
            <Route path="/player/:songId" element={<PlayerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;