import { useEffect, useState } from 'react'
import { RefreshCw, Search } from 'lucide-react'
import { getInventory } from '../lib/stock'
import SectionTitle from '../components/SectionTitle'
import EmptyState from '../components/EmptyState'

export default function Container() {
  const [rows, setRows] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const result = await getInventory('Container')
    setRows(result.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = rows.filter(r => r.products?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <SectionTitle
        title="Estoque do Container"
        description="Mercadorias recebidas e ainda não transferidas para o barco."
        action={<button className="btn secondary" onClick={load}><RefreshCw size={16}/> Atualizar</button>}
      />
      <div className="toolbar">
        <div className="search"><Search size={17}/><input placeholder="Pesquisar produto..." value={search} onChange={e => setSearch(e.target.value)}/></div>
      </div>
      <div className="panel table-panel">
        {loading ? <div className="loading">Carregando estoque...</div> :
          filtered.length === 0 ? <EmptyState title="Container vazio" text="As entradas de mercadoria aparecerão aqui."/> :
          <table><thead><tr><th>Produto</th><th>Categoria</th><th>Quantidade</th><th>Unidade</th><th>Atualizado</th></tr></thead>
          <tbody>{filtered.map(r => <tr key={r.id}><td><strong>{r.products?.name}</strong></td><td>{r.products?.categories?.name ?? '—'}</td><td className="qty">{r.quantity}</td><td>{r.products?.unit ?? '—'}</td><td>{new Date(r.updated_at).toLocaleDateString('pt-BR')}</td></tr>)}</tbody></table>
        }
      </div>
    </>
  )
}