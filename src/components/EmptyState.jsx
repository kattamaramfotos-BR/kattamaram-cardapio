export default function EmptyState({ title='Nenhum registro', text='Não há dados para mostrar ainda.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">📦</div>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  )
}