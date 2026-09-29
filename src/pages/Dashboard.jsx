import { useEffect, useState } from 'react'
import { Package, Ship, AlertTriangle, Boxes, ArrowRight, Plus } from 'lucide-react'
import { getDashboardStats } from '../lib/stock'
import StatCard from '../components/StatCard'
import SectionTitle from '../components/SectionTitle'

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState({ container: 0, barco: 0, lowStock: 0, products: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(r => { setStats(r); setLoading(false) })
  }, [])

  return (
    <>
      <SectionTitle
        title="Visão geral"
        description="Acompanhe rapidamente o que está no Container e no Kattamaram II."
      />
      <div className="stats-grid">
        <StatCard icon={<Package/>} label="No Container" value={loading ? '—' : stats.container} note="quantidade total" />
        <StatCard icon={<Ship/>} label="No Barco" value={loading ? '—' : stats.barco} note="Kattamaram II" />
        <StatCard icon={<Boxes/>} label="Produtos" value={loading ? '—' : stats.products} note="cadastros ativos" />
        <StatCard icon={<AlertTriangle/>} label="Estoque baixo" value={loading ? '—' : stats.lowStock} note="itens no limite" tone="warning" />
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Fluxo do estoque</h3>
              <p>Toda mercadoria começa no Container.</p>
            </div>
          </div>
          <div className="flow">
            <div className="flow-step"><Package/><strong>Entrada</strong><span>Manual ou nota fiscal</span></div>
            <ArrowRight className="flow-arrow"/>
            <div className="flow-step"><Boxes/><strong>Container</strong><span>Estoque recebido</span></div>
            <ArrowRight className="flow-arrow"/>
            <div className="flow-step"><Ship/><strong>Barco</strong><span>Transferência</span></div>
          </div>
        </div>

        <div className="panel quick-panel">
          <h3>Rotinas rápidas</h3>
          <button type="button" className="quick-action" onClick={() => onNavigate('entradas')}><Plus/><div><strong>Nova entrada</strong><span>Adicionar mercadoria ao Container</span></div></button>
          <button type="button" className="quick-action" onClick={() => onNavigate('transferencias')}><ArrowRight/><div><strong>Nova transferência</strong><span>Enviar mercadoria ao Kattamaram II</span></div></button>
        </div>
      </div>
    </>
  )
}