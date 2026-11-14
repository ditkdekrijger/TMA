import { useState } from 'react'
import { Link } from 'react-router-dom'
import { frequentlyBoughtWith, productById } from '../data/catalog'
import ProductArt from '../components/ProductArt'
import Icon from '../components/Icon'
import Rail from '../components/Rail'
import { Breadcrumbs, Empty, FreeShippingBar, StockLine } from '../components/bits'
import { QtyStepper } from '../components/CartDrawer'
import { useStore } from '../state/store'
import { money } from '../lib/format'
import { useTitle } from '../lib/useTitle'

export function Summary({ children }: { children?: React.ReactNode }) {
  const { subtotal, shipping, discount, coupon, total, applyCoupon } = useStore()
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  return (
    <aside className="summary">
      <h2>Overzicht</h2>
      <div className="row-between"><span>Subtotaal</span><span>{money(subtotal)}</span></div>
      {discount > 0 && <div className="row-between good"><span>Korting ({coupon})</span><span>− {money(discount)}</span></div>}
      <div className="row-between"><span>Verzending</span><span>{shipping === 0 ? <b className="good">Gratis</b> : money(shipping)}</span></div>
      <div className="row-between total"><span>Totaal <small>incl. btw</small></span><b>{money(total)}</b></div>
      {!coupon && (
        <form className="coupon" onSubmit={(e) => { e.preventDefault(); setErr(applyCoupon(code) ? '' : 'Deze code is niet geldig') }}>
          <label className="sr-only" htmlFor="coupon">Kortingscode</label>
          <input id="coupon" placeholder="Kortingscode" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn btn-ghost">Toepassen</button>
          {err && <p className="err">{err}</p>}
        </form>
      )}
      {children}
      <p className="muted small"><Icon name="lock" size={14} /> Veilig betalen met iDEAL, Bancontact, creditcard, PayPal of Klarna.</p>
    </aside>
  )
}

export default function CartPage() {
  useTitle('Winkelwagen')
  const { cart, setQty, remove, subtotal, toggleWish } = useStore()
  if (!cart.length) return <div className="wrap page"><Empty title="Je winkelwagen is leeg" text="Ontdek ons assortiment van duizenden instrumenten en accessoires." cta={{ label: 'Begin met winkelen', to: '/' }} /></div>
  const suggestions = [...new Map(cart.flatMap((l) => frequentlyBoughtWith(productById[l.id], 4)).filter((p) => !cart.some((l) => l.id === p.id)).map((p) => [p.id, p])).values()]
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Winkelwagen' }]} />
      <h1>Winkelwagen</h1>
      <div className="checkout-grid">
        <div>
          <FreeShippingBar subtotal={subtotal} />
          <ul className="cart-lines">
            {cart.map((l) => {
              const p = productById[l.id]
              const v = p.variants.find((x) => x.label === l.variant) ?? p.variants[0]
              return (
                <li key={l.id + l.variant} className="cart-line">
                  <Link to={`/product/${p.slug}`} className="cl-art" style={{ ['--tint' as string]: v.color }}><ProductArt kind={p.kind} color={v.color} /></Link>
                  <div className="cl-info">
                    <Link to={`/product/${p.slug}`} className="cl-name">{p.name}</Link>
                    <span className="muted">Afwerking: {v.label} · {money(p.price)} per stuk</span>
                    <StockLine p={p} />
                    <div className="cl-actions">
                      <button className="link-btn" onClick={() => { toggleWish(p.id); remove(l.id, l.variant) }}>Naar verlanglijst</button>
                      <button className="link-btn" onClick={() => remove(l.id, l.variant)}>Verwijderen</button>
                    </div>
                  </div>
                  <QtyStepper value={l.qty} onChange={(n) => setQty(l.id, l.variant, n)} label={p.name} />
                  <b className="cl-total">{money(p.price * l.qty)}</b>
                </li>
              )
            })}
          </ul>
        </div>
        <Summary><Link to="/afrekenen" className="btn btn-primary btn-block btn-lg"><Icon name="lock" size={18} /> Verder naar afrekenen</Link></Summary>
      </div>
      <Rail title="Vergeet je deze niet?" items={suggestions} />
    </div>
  )
}
