import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brandById } from '../data/catalog'
import type { Product } from '../data/types'
import { useStore } from '../state/store'
import Icon from './Icon'
import ProductImage from './ProductImage'
import { Price, Stars, StockLine } from './bits'

export default function ProductCard({ p, layout = 'grid' }: { p: Product; layout?: 'grid' | 'list' }) {
  const { add, toggleWish, wishlist, toggleCompare, compare } = useStore()
  const [v, setV] = useState(0)
  const variant = p.variants[v]
  const wished = wishlist.includes(p.id)
  const comparing = compare.includes(p.id)
  const pct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
  return (
    <article className={`card card-${layout}`}>
      <div className="card-media">
        <Link to={`/product/${p.slug}`} aria-label={p.name} className="card-art" style={{ ['--tint' as string]: variant.color }}>
          <ProductImage p={p} size={400} color={variant.color} />
        </Link>
        <div className="card-badges">
          {pct > 0 && <span className="badge badge-sale">-{pct}%</span>}
          {p.isNew && <span className="badge badge-new">Nieuw</span>}
          {brandById[p.brand]?.house && <span className="badge badge-house">TMA-huismerk</span>}
        </div>
        <button className={`icon-btn wish ${wished ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label={wished ? 'Verwijder van verlanglijst' : 'Zet op verlanglijst'}>
          <Icon name="heart" size={18} fill={wished} />
        </button>
      </div>
      <div className="card-body">
        <div className="card-meta"><span className="card-brand">{brandById[p.brand]?.name}</span><span className="card-sub">{p.leaf}</span></div>
        <h3 className="card-title"><Link to={`/product/${p.slug}`}>{p.name}</Link></h3>
        {p.reviews > 0 && <Stars value={p.rating} count={p.reviews} />}
        <span className="card-sku" title={p.description}>{p.description} · {p.sku}</span>
        {p.variants.length > 1 && (
          <div className="swatches" role="radiogroup" aria-label="Afwerking">
            {p.variants.slice(0, 6).map((x, i) => (
              <button key={x.label} role="radio" aria-checked={i === v} title={x.label} aria-label={x.label}
                className={`swatch ${i === v ? 'on' : ''}`} style={{ background: x.color }} onClick={() => setV(i)} />
            ))}
          </div>
        )}
        {layout === 'list' && <p className="card-desc">{p.description}</p>}
        <div className="card-foot">
          <div>
            <Price value={p.price} old={p.oldPrice} />
            <StockLine p={p} />
          </div>
          <button className="btn btn-primary btn-cart" onClick={() => add(p.id, variant.label)} aria-label={`${p.name} in winkelwagen`}>
            <Icon name="cart" size={18} /><span className="btn-cart-label">In winkelwagen</span>
          </button>
        </div>
        <label className="compare-check">
          <input type="checkbox" checked={comparing} onChange={() => toggleCompare(p.id)} /> Vergelijk
        </label>
      </div>
    </article>
  )
}
