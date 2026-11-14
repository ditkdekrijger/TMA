import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { frequentlyBoughtWith, productById } from '../data/catalog'
import { money } from '../lib/format'
import { useStore } from '../state/store'
import Icon from './Icon'
import ProductArt from './ProductArt'
import { FreeShippingBar } from './bits'

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="qty" role="group" aria-label={`Aantal ${label}`}>
      <button onClick={() => onChange(value - 1)} aria-label="Minder"><Icon name={value === 1 ? 'trash' : 'minus'} size={14} /></button>
      <input value={value} inputMode="numeric" aria-label="Aantal" onChange={(e) => { const n = parseInt(e.target.value, 10); if (!Number.isNaN(n)) onChange(n) }} />
      <button onClick={() => onChange(value + 1)} aria-label="Meer"><Icon name="plus" size={14} /></button>
    </div>
  )
}

export default function CartDrawer() {
  const { drawer, setDrawer, cart, setQty, subtotal, count, add } = useStore()
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [setDrawer])
  if (!drawer) return null
  const last = cart[cart.length - 1]
  const upsell = last ? frequentlyBoughtWith(productById[last.id], 3).filter((p) => !cart.some((l) => l.id === p.id)) : []
  return (
    <div className="drawer-wrap" onClick={() => setDrawer(false)}>
      <aside className="drawer drawer-right" onClick={(e) => e.stopPropagation()} aria-label="Winkelwagen" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <h2>Winkelwagen <small>({count})</small></h2>
          <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Sluiten"><Icon name="close" /></button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="empty small"><p>Je winkelwagen is nog leeg.</p><button className="btn btn-primary" onClick={() => setDrawer(false)}>Verder winkelen</button></div>
          ) : (
            <>
              <FreeShippingBar subtotal={subtotal} />
              <ul className="mini-cart">
                {cart.map((l) => {
                  const p = productById[l.id]
                  const v = p.variants.find((x) => x.label === l.variant) ?? p.variants[0]
                  return (
                    <li key={l.id + l.variant}>
                      <Link to={`/product/${p.slug}`} onClick={() => setDrawer(false)} className="mc-art"><ProductArt kind={p.kind} color={v.color} /></Link>
                      <div className="mc-info">
                        <Link to={`/product/${p.slug}`} onClick={() => setDrawer(false)}>{p.name}</Link>
                        <small>{v.label}</small>
                        <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, l.variant, n)} label={p.name} />
                      </div>
                      <b>{money(p.price * l.qty)}</b>
                    </li>
                  )
                })}
              </ul>
              {upsell.length > 0 && (
                <div className="upsell">
                  <h3>Maak het compleet</h3>
                  {upsell.map((p) => (
                    <div key={p.id} className="upsell-item">
                      <span className="mc-art"><ProductArt kind={p.kind} color={p.variants[0].color} /></span>
                      <span className="upsell-name">{p.name}<small>{money(p.price)}</small></span>
                      <button className="btn btn-ghost btn-sm" onClick={() => add(p.id, p.variants[0].label)} aria-label={`Voeg ${p.name} toe`}><Icon name="plus" size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="row-between"><span>Subtotaal</span><b>{money(subtotal)}</b></div>
            <Link className="btn btn-primary btn-block btn-lg" to="/afrekenen" onClick={() => setDrawer(false)}><Icon name="lock" size={18} /> Veilig afrekenen</Link>
            <Link className="btn btn-ghost btn-block" to="/winkelwagen" onClick={() => setDrawer(false)}>Bekijk winkelwagen</Link>
          </div>
        )}
      </aside>
    </div>
  )
}
