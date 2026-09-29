import { useState } from 'react'
import {
  LayoutDashboard, Package, Ship, ArrowLeftRight, FilePlus2,
  History, Boxes, Menu, X, Settings, AlertTriangle
} from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Container from './pages/Container'
import Barco from './pages/Barco'
import Transferencias from './pages/Transferencias'
import Entradas from './pages/Entradas'
import Historico from './pages/Historico'
import Produtos from './pages/Produtos'

const nav = [
  ['dashboard', 'Painel geral', LayoutDashboard],
  ['container', 'Container', Package],
  ['barco', 'Barco', Ship],
  ['transferencias', 'Transferências', ArrowLeftRight],
  ['entradas', 'Entradas / NF', FilePlus2],
  ['historico', 'Histórico', History],
  ['produtos', 'Produtos', Boxes],
]

function App() {
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  const current = nav.find(([id]) => id === page)?.[1] ?? 'Painel geral'

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">⚓</div>
          <div>
            <strong>KATTAMARAM</strong>
            <span>Controle de Estoque</span>
          </div>
          <button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)}><X size={20}/></button>
        </div>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => { setPage(id); setMobileOpen(false) }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Settings size={16}/>
          <span>Uso livre • sem login</span>
        </div>
      </aside>

      {mobileOpen && <div className="backdrop" onClick={() => setMobileOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button>
          <div>
            <div className="eyebrow">KATTAMARAM II</div>
            <h1>{current}</h1>
          </div>
          <div className="status-pill"><span className="dot"/> Estoque operacional</div>
        </header>

        {!import.meta.env.VITE_SUPABASE_URL && (
          <div className="setup-warning">
            <AlertTriangle size={18}/>
            <div>
              <strong>Supabase ainda não configurado.</strong>
              <span>Copie <code>.env.example</code> para <code>.env</code>, preencha as chaves e reinicie o Vite.</span>
            </div>
          </div>
        )}

        <section className="content">
          {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
          {page === 'container' && <Container />}
          {page === 'barco' && <Barco />}
          {page === 'transferencias' && <Transferencias />}
          {page === 'entradas' && <Entradas />}
          {page === 'historico' && <Historico />}
          {page === 'produtos' && <Produtos />}
        </section>
      </main>
    </div>
  )
}

export default App
