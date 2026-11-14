import { Link } from 'react-router-dom'
import { priceParts } from '../lib/format'
import Icon from './Icon'
import type { Product } from '../data/types'
import { shop } from '../lib/config'
import { deliveryEstimate } from '../lib/format'

export function Stars({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="stars" aria-label={`${value.toLocaleString('nl-NL')} van 5 sterren${count ? `, ${count} reviews` : ''}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className="star" style={{ width: size, height: size }}>
          <Icon name="star" size={size} className="star-bg" fill />
          <span className="star-fill" style={{ width: `${Math.max(0, Math.min(1, value - i + 1)) * 100}%` }}>
            <Icon name="star" size={size} fill />
          </span>
        </span>
      ))}
      {count !== undefined && <span className="stars-count">({count})</span>}
    </span>
  )
}

export function Price({ value, old, size = 'md' }: { value: number; old?: number; size?: 'sm' | 'md' | 'lg' }) {
  const { whole, cents } = priceParts(value)
  return (
    <span className={`price price-${size}`}>
      {old && <s className="price-old">€ {priceParts(old).whole},{priceParts(old).cents}</s>}
      <span className={old ? 'price-now sale' : 'price-now'}>
        <span className="price-whole">{whole},</span><sup>{cents}</sup>
      </span>
    </span>
  )
}

export function StockLine({ p }: { p: Product }) {
  const d = deliveryEstimate(p.stock > 0, new Date(), shop.cutoffHour)
  if (p.stock === 0) return <span className="stock out">Nabestelbaar · levering {d.label}</span>
  if (p.stock <= 4) return <span className="stock low">Nog {p.stock} op voorraad · {d.label} in huis</span>
  return <span className="stock in">Op voorraad · {d.label} in huis</span>
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav className="crumbs" aria-label="Kruimelpad">
      <Link to="/">Home</Link>
      {items.map((it, i) => (
        <span key={i}>
          <Icon name="chevron" size={12} />
          {it.to ? <Link to={it.to}>{it.label}</Link> : <span aria-current="page">{it.label}</span>}
        </span>
      ))}
    </nav>
  )
}

export function FreeShippingBar({ subtotal }: { subtotal: number }) {
  const left = shop.freeShippingFrom - subtotal
  const pct = Math.min(100, (subtotal / shop.freeShippingFrom) * 100)
  return (
    <div className="ship-bar">
      <p>{left > 0 ? <>Nog <b>€ {left.toFixed(2).replace('.', ',')}</b> tot gratis verzending</> : <><Icon name="check" size={16} /> Je bestelling wordt <b>gratis verzonden</b></>}</p>
      <div className="ship-track"><div className="ship-fill" style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

export function Empty({ title, text, cta }: { title: string; text: string; cta?: { label: string; to: string } }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{text}</p>
      {cta && <Link className="btn btn-primary" to={cta.to}>{cta.label}</Link>}
    </div>
  )
}
