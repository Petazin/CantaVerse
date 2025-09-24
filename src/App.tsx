import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SyncToolPage from './pages/SyncToolPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header className="App-header">
          <h1>CantaVerse</h1>
          <nav>
            <Link to="/">Reproductor</Link>
            <Link to="/sync-tool">Herramienta de Sincronización</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sync-tool" element={<SyncToolPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
