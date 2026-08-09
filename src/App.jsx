import { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import OperacionesPage from './pages/OperacionesPage';
import OperacionDetallePage from './pages/OperacionDetallePage';
import TimeframesPage from './pages/TimeframesPage';
import SesionesPage from './pages/SesionesPage';
import ParesPage from './pages/ParesPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Control Trading</h1>
          <button className="sidebar-toggle" type="button" onClick={() => setSidebarOpen((prev) => !prev)} aria-label="Alternar menú">
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link className="sidebar-link" to="/">
            <span>📊</span>
            <span>Operaciones</span>
          </Link>
          <Link className="sidebar-link" to="/?new=true">
            <span>＋</span>
            <span>Nueva operación</span>
          </Link>
          <Link className="sidebar-link" to="/timeframes">
            <span>⏱️</span>
            <span>Timeframes</span>
          </Link>
          <Link className="sidebar-link" to="/sesiones">
            <span>🗓️</span>
            <span>Sesiones</span>
          </Link>
          <Link className="sidebar-link" to="/pares">
            <span>💱</span>
            <span>Pares</span>
          </Link>
        </nav>
      </aside>

      <div className="main-area">

        <main>
          <Routes>
            <Route path="/" element={<OperacionesPage />} />
            <Route path="/operaciones/:id" element={<OperacionDetallePage />} />
            <Route path="/timeframes" element={<TimeframesPage />} />
            <Route path="/sesiones" element={<SesionesPage />} />
            <Route path="/pares" element={<ParesPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
