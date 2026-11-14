import { Link } from 'react-router-dom'
import { useStore } from '../state/store'
import Icon from './Icon'

export default function Toasts() {
  const { toasts } = useStore()
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}><Icon name="check" size={16} /> {t.text}{t.action && <Link to={t.action.to}>{t.action.label}</Link>}</div>
      ))}
    </div>
  )
}
