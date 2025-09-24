import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SyncToolPage from './pages/SyncToolPage';
import PlayerPage from './pages/PlayerPage'; // Importamos la nueva página

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>CantaVerse</h1>
          <nav>
            <Link to="/">Canciones</Link> {/* Cambiado de Reproductor a Canciones */}
            <Link to="/sync-tool">Herramienta de Sincronización</Link>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sync-tool" element={<SyncToolPage />} />
            {/* Nueva ruta dinámica para el reproductor */}
            <Route path="/player/:songId" element={<PlayerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;