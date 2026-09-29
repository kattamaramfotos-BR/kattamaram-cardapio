import { useState } from 'react'
import { Camera, FileText, Upload, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle'

export default function Entradas() {
  const [mode, setMode] = useState('manual')
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ invoice_number:'', entry_date:new Date().toISOString().slice(0,10), notes:'' })
  const [saving, setSaving] = useState(false)

  async function saveEntry(e) {
    e.preventDefault()
    if (!supabase) return setMessage('Configure o Supabase primeiro.')
    setSaving(true); setMessage('')
    let filePath = null
    if (file) {
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,'_')
      filePath = `invoices/${new Date().getFullYear()}/${Date.now()}_${safe}`
      const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file, { upsert:false })
      if (uploadError) { setSaving(false); return setMessage(uploadError.message) }
    }
    const { data, error } = await supabase.from('stock_entries').insert({
      entry_date: form.entry_date,
      invoice_number: form.invoice_number || null,
      invoice_file: filePath,
      notes: form.notes || null
    }).select('id').single()
    setSaving(false)
    if (error) setMessage(error.message)
    else setMessage(`Entrada #${data.id} criada. Agora os itens podem ser lançados na etapa de conferência.`)
  }

  return <>
    <SectionTitle title="Entradas / Nota fiscal" description="Receba mercadorias manualmente ou prepare a nota fiscal para leitura por IA." />
    <div className="mode-tabs">
      <button className={mode==='manual'?'active':''} onClick={()=>setMode('manual')}><FileText/> Entrada manual</button>
      <button className={mode==='nota'?'active':''} onClick={()=>setMode('nota')}><Camera/> Foto / PDF da nota</button>
    </div>

    {mode === 'manual' ? (
      <form className="panel form-panel" onSubmit={saveEntry}>
        <h3>Dados da entrada</h3>
        <div className="form-row">
          <label>Número da nota<input value={form.invoice_number} onChange={e=>setForm({...form,invoice_number:e.target.value})} placeholder="Ex.: 45872"/></label>
          <label>Data de entrega<input required type="date" value={form.entry_date} onChange={e=>setForm({...form,entry_date:e.target.value})}/></label>
        </div>
        <label>Observação<textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
        {message && <div className="message"><CheckCircle2 size={17}/>{message}</div>}
        <button className="btn primary" disabled={saving}><Upload size={17}/>{saving?'Salvando...':'Criar entrada'}</button>
      </form>
    ) : (
      <div className="panel invoice-panel">
        <div className="upload-icon"><Camera size={30}/></div>
        <h3>Envie a foto ou PDF da nota fiscal</h3>
        <p>O arquivo será salvo no Storage. A próxima etapa do projeto conectará uma IA para identificar os produtos e mostrar uma tela de conferência antes de alterar o estoque.</p>
        <label className="upload-box">
          <input type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files?.[0] ?? null)}/>
          <Upload size={22}/>
          <strong>{file ? file.name : 'Selecionar foto ou PDF'}</strong>
          <span>JPG, PNG ou PDF</span>
        </label>
        {file && (
          <form className="form-panel compact" onSubmit={saveEntry}>
            <label>Número da nota<input value={form.invoice_number} onChange={e=>setForm({...form,invoice_number:e.target.value})}/></label>
            <label>Data de entrega<input required type="date" value={form.entry_date} onChange={e=>setForm({...form,entry_date:e.target.value})}/></label>
            <button className="btn primary" disabled={saving}><CheckCircle2 size={17}/>{saving?'Enviando...':'Salvar nota para conferência'}</button>
            {message && <div className="message">{message}</div>}
          </form>
        )}
      </div>
    )}
  </>
}