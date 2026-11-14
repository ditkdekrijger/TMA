import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { money } from '../lib/format'
import { useTitle } from '../lib/useTitle'

export default function ThanksPage() {
  useTitle('Bedankt voor je bestelling')
  let o: { nr: string; total: number; email: string; name: string; eta: string } | null = null
  try { o = JSON.parse(sessionStorage.getItem('kh.lastOrder') ?? 'null') } catch { /* */ }
  return (
    <div className="wrap page thanks">
      <div className="thanks-icon"><Icon name="check" size={40} /></div>
      <h1>Bedankt{o?.name ? `, ${o.name}` : ''}!</h1>
      {o ? (
        <>
          <p className="lead">Je bestelling <b>{o.nr}</b> ({money(o.total)}) is ontvangen. We verwachten hem <b>{o.eta}</b> te bezorgen.</p>
          <p className="muted">Een bevestiging is verstuurd naar {o.email}. Je ontvangt een track & trace-code zodra je pakket onderweg is.</p>
        </>
      ) : <p className="lead">Je bestelling is ontvangen.</p>}
      <div className="hero-cta center"><Link className="btn btn-primary" to="/">Verder winkelen</Link><Link className="btn btn-ghost" to="/service">Klantenservice</Link></div>
    </div>
  )
}
