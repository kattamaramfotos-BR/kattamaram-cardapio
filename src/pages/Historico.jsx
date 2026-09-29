import { useEffect, useState } from 'react'
import { RefreshCw, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle'
import EmptyState from '../components/EmptyState'

const labels = {
  ENTRY: ['Entrada', 'in'],
  TRANSFER_OUT: ['Saída do Container', 'out'],
  TRANSFER_IN: ['Entrada no Barco', 'in'],
  ADJUSTMENT: ['Ajuste', 'adjust'],
  CONSUMPTION: ['Consumo', 'out'],
  LOSS: ['Perda', 'out'],
}

export default function Historico() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase.from('stock_movements')
      .select('id,product_id,location_id,movement_type,quantity,notes,created_at,products(name,unit),locations(name)')
      .order('created_at',{ascending:false}).limit(100)
    setRows(data ?? [])
    setLoading(false)
  }
  useEffect(()=>{ load() },[])

  return <>
    <SectionTitle title="Histórico" description="Rastro das entradas, transferências e ajustes de estoque."
      action={<button className="btn secondary" onClick={load}><RefreshCw size={16}/> Atualizar</button>} />
    <div className="panel table-panel">
      {loading ? <div className="loading">Carregando...</div> : rows.length===0 ? <EmptyState title="Nenhuma movimentação" text="As movimentações aparecerão aqui conforme o estoque for utilizado."/> :
      <table><thead><tr><th>Data</th><th>Produto</th><th>Movimento</th><th>Quantidade</th><th>Local</th><th>Observação</th></tr></thead>
      <tbody>{rows.map(r=>{
        const [label, type] = labels[r.movement_type] ?? [r.movement_type,'adjust']
        return <tr key={r.id}><td>{new Date(r.created_at).toLocaleString('pt-BR')}</td><td><strong>{r.products?.name}</strong></td><td><span className={`movement ${type}`}>{type==='in'?<ArrowDownToLine size={14}/>:<ArrowUpFromLine size={14}/>} {label}</span></td><td className="qty">{r.quantity} {r.products?.unit}</td><td>{r.locations?.name}</td><td>{r.notes ?? '—'}</td></tr>
      })}</tbody></table>}
    </div>
  </>
}