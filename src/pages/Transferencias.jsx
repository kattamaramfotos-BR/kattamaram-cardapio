import { useEffect, useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle'

export default function Transferencias() {
  const [products, setProducts] = useState([])
  const [stock, setStock] = useState({})
  const [form, setForm] = useState({ product_id:'', quantity:'', notes:'' })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!supabase) return
    const [{ data: p }, { data: i }] = await Promise.all([
      supabase.from('products').select('id,name,unit').eq('active',true).order('name'),
      supabase.from('inventory').select('product_id,quantity,locations(name)').eq('locations.name','Container')
    ])
    setProducts(p ?? [])
    const map = {}
    ;(i ?? []).forEach(x => map[x.product_id] = Number(x.quantity))
    setStock(map)
  }
  useEffect(()=>{ load() },[])

  async function submit(e) {
    e.preventDefault()
    if (!supabase) return setMessage('Configure o Supabase primeiro.')
    setSaving(true); setMessage('')
    const { data, error } = await supabase.rpc('transfer_container_to_boat', {
      p_product_id: form.product_id,
      p_quantity: Number(form.quantity),
      p_notes: form.notes || null
    })
    setSaving(false)
    if (error) setMessage(error.message)
    else { setMessage(`Transferência #${data} realizada com sucesso.`); setForm({product_id:'',quantity:'',notes:''}); load() }
  }

  const selected = products.find(p=>p.id===form.product_id)
  const available = form.product_id ? (stock[form.product_id] ?? 0) : 0

  return <>
    <SectionTitle title="Transferências" description="Retire mercadorias do Container e envie para o Kattamaram II." />
    <div className="transfer-banner"><div><strong>Container</strong><span>Estoque de origem</span></div><ArrowRight/><div><strong>Kattamaram II</strong><span>Destino</span></div></div>
    <form className="panel form-panel narrow" onSubmit={submit}>
      <h3>Nova transferência</h3>
      <label>Produto<select required value={form.product_id} onChange={e=>setForm({...form,product_id:e.target.value})}><option value="">Selecione...</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      <div className="available">Disponível no Container: <strong>{available} {selected?.unit ?? ''}</strong></div>
      <label>Quantidade<input required type="number" min="0.001" step="0.001" max={available} value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label>
      <label>Observação<textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Ex.: reposição de bebidas"/></label>
      {message && <div className="message"><CheckCircle2 size={17}/>{message}</div>}
      <button className="btn primary" disabled={saving || !form.product_id}><ArrowRight size={17}/>{saving?'Transferindo...':'Confirmar transferência'}</button>
    </form>
  </>
}