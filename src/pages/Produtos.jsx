import { useEffect, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle'
import EmptyState from '../components/EmptyState'

export default function Produtos() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ name:'', category_id:'', unit:'UN', minimum_stock:0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function load() {
    if (!supabase) { setLoading(false); return }
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('products').select('id,name,unit,minimum_stock,active,categories(id,name)').eq('active', true).order('name'),
      supabase.from('categories').select('id,name').order('name')
    ])
    setProducts(p ?? []); setCategories(c ?? []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function save(e) {
    e.preventDefault()
    if (!supabase) return setMessage('Configure o Supabase primeiro.')
    setSaving(true); setMessage('')
    const { error } = await supabase.from('products').insert({
      name: form.name.trim(), category_id: form.category_id || null,
      unit: form.unit, minimum_stock: Number(form.minimum_stock) || 0
    })
    setSaving(false)
    if (error) setMessage(error.message)
    else { setMessage('Produto cadastrado.'); setForm({ name:'', category_id:'', unit:'UN', minimum_stock:0 }); load() }
  }

  return <>
    <SectionTitle title="Produtos" description="Cadastre os produtos que podem entrar no Container." />
    <div className="two-col">
      <form className="panel form-panel" onSubmit={save}>
        <h3>Novo produto</h3>
        <label>Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Ex.: Whisky Johnnie Walker"/></label>
        <label>Categoria<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Sem categoria</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <div className="form-row">
          <label>Unidade<select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}>{['UN','KG','G','L','ML','CX','FD','PCT'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Estoque mínimo<input type="number" min="0" value={form.minimum_stock} onChange={e=>setForm({...form,minimum_stock:e.target.value})}/></label>
        </div>
        {message && <div className="message">{message}</div>}
        <button className="btn primary" disabled={saving}><Plus size={17}/>{saving ? 'Salvando...' : 'Cadastrar produto'}</button>
      </form>
      <div className="panel table-panel">
        <div className="panel-head"><div><h3>Produtos cadastrados</h3><p>{products.length} produto(s)</p></div><button className="icon-btn" onClick={load}><RefreshCw size={17}/></button></div>
        {loading ? <div className="loading">Carregando...</div> : products.length===0 ? <EmptyState/> :
          <table><thead><tr><th>Produto</th><th>Categoria</th><th>Un.</th><th>Mínimo</th></tr></thead>
          <tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.categories?.name ?? '—'}</td><td>{p.unit}</td><td>{p.minimum_stock}</td></tr>)}</tbody></table>}
      </div>
    </div>
  </>
}