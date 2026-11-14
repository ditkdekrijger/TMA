import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { brandById, catById, frequentlyBoughtWith, productById, products, related, subById } from '../data/catalog'
import type { Product } from '../data/types'
import ProductArt from '../components/ProductArt'
import Rail from '../components/Rail'
import Icon from '../components/Icon'
import { Breadcrumbs, Price, Stars, StockLine } from '../components/bits'
import { QtyStepper } from '../components/CartDrawer'
import { useStore } from '../state/store'
import { money } from '../lib/format'
import { shop } from '../lib/config'
import { useTitle } from '../lib/useTitle'
import NotFound from './NotFound'

const NAMES = ['Sanne', 'Jeroen', 'Fatima', 'Tom', 'Lotte', 'Bram', 'Noor', 'Daan', 'Eva', 'Mehmet', 'Iris', 'Pieter', 'Yara', 'Koen', 'Anouk', 'Wout']
const PLACES = ['Utrecht', 'Gent', 'Rotterdam', 'Antwerpen', 'Groningen', 'Eindhoven', 'Leuven', 'Zwolle', 'Haarlem', 'Brugge']
const TITLES: Record<string, string[]> = {
  hi: ['Fantastische prijs-kwaliteit', 'Overtrof mijn verwachtingen', 'Direct speelklaar', 'Echt een aanrader', 'Prachtig afgewerkt'],
  mid: ['Prima voor het geld', 'Goed, met een kleine kanttekening', 'Doet wat het moet doen'],
}
const BODIES: Record<string, string[]> = {
  hi: [
    'Netjes verpakt en de volgende dag al in huis. De afwerking is beter dan ik voor deze prijs had verwacht en het klinkt geweldig.',
    'Ik speel nu een paar weken en ben echt blij. Mijn leraar was ook positief verrast over de kwaliteit.',
    'Gekocht voor mijn dochter, die er sindsdien elke dag mee bezig is. Goed afgesteld uit de doos.',
    'Super advies gekregen via de chat. Precies wat ik zocht, en het verschil met mijn vorige instrument is enorm.',
    'Solide bouwkwaliteit en een mooie, warme klank. Neem ik zonder twijfel mee naar het podium.',
  ],
  mid: [
    'Goede kwaliteit voor de prijs. Ik heb zelf nog wat kleine afstellingen gedaan, daarna perfect.',
    'Klinkt goed en ziet er mooi uit. De meegeleverde tas had iets steviger gemogen.',
    'Prima instrument om mee te beginnen. Voor de prijs kun je weinig beters vinden.',
  ],
}

function reviewsFor(p: Product) {
  const n = Math.min(5, p.reviews)
  const seed = p.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  return Array.from({ length: n }).map((_, i) => {
    const k = (seed + i * 7) % 100
    const stars = p.rating >= 4.5 ? (k % 5 === 0 ? 4 : 5) : k % 3 === 0 ? 3 : k % 2 ? 4 : 5
    const tier = stars >= 4 ? 'hi' : 'mid'
    const d = new Date(2026, 10, 10 - ((seed + i * 13) % 200))
    return {
      name: NAMES[(seed + i * 3) % NAMES.length], place: PLACES[(seed + i) % PLACES.length], stars,
      title: TITLES[tier][(seed + i) % TITLES[tier].length], body: BODIES[tier][(seed + i * 5) % BODIES[tier].length],
      date: d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }), verified: k % 4 !== 0,
    }
  })
}

export default function ProductPage() {
  const { slug } = useParams()
  const p = useMemo(() => products.find((x) => x.slug === slug), [slug])
  const { add, toggleWish, wishlist, toggleCompare, compare, viewed, recent } = useStore()
  const [v, setV] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [bundleSel, setBundleSel] = useState<Record<string, boolean>>({})
  useTitle(p?.name)

  useEffect(() => { if (p) { viewed(p.id); setV(0); setQty(1); setTab('desc'); setBundleSel({}); window.scrollTo(0, 0) } }, [p, viewed])

  if (!p) return <NotFound />
  const b = brandById[p.brand]
  const c = catById[p.category]
  const s = subById[p.sub]
  const variant = p.variants[v]
  const wished = wishlist.includes(p.id)
  const reviews = reviewsFor(p)
  const fbt = frequentlyBoughtWith(p, 3)
  const bundleItems = [p, ...fbt.filter((x) => bundleSel[x.id] !== false)]
  const bundleTotal = bundleItems.reduce((sum, x) => sum + x.price, 0)
  const pct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
  const dist = [5, 4, 3, 2, 1].map((st) => {
    const center = p.rating
    const w = Math.max(0.02, 1 - Math.abs(st - center) / 1.6)
    return [st, w] as const
  })
  const distTotal = dist.reduce((s2, [, w]) => s2 + w, 0)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, brand: { '@type': 'Brand', name: b.name },
    description: p.description, category: `${c.name} > ${s.name}`,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: { '@type': 'Offer', priceCurrency: 'EUR', price: p.price, availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder' },
  }

  return (
    <div className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: c.name, to: `/c/${c.id}` }, { label: s.name, to: `/c/${c.id}/${s.id}` }, { label: p.name }]} />

      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main" style={{ ['--tint' as string]: variant.color }}>
            <div className="card-badges">
              {pct > 0 && <span className="badge badge-sale">-{pct}%</span>}
              {p.isNew && <span className="badge badge-new">Nieuw</span>}
            </div>
            <ProductArt kind={p.kind} color={variant.color} title={`${p.name} in ${variant.label}`} />
          </div>
          {p.variants.length > 1 && (
            <div className="pdp-thumbs">
              {p.variants.map((x, i) => (
                <button key={x.label} className={i === v ? 'on' : ''} onClick={() => setV(i)} aria-label={x.label}>
                  <ProductArt kind={p.kind} color={x.color} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <Link to={`/merk/${b.id}`} className="pdp-brand">{b.name}</Link>
          <h1>{p.name}</h1>
          <div className="pdp-rating">
            <Stars value={p.rating} size={16} />
            <button className="link-btn" onClick={() => { setTab('reviews'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }) }}>
              {p.rating.toLocaleString('nl-NL')} · {p.reviews} reviews
            </button>
            <span className="muted">Art.nr. {p.sku}</span>
          </div>
          <ul className="pdp-highlights">{p.highlights.map((h) => <li key={h}><Icon name="check" size={16} /> {h}</li>)}</ul>

          {p.variants.length > 1 && (
            <div className="pdp-variants">
              <p>Afwerking: <b>{variant.label}</b></p>
              <div className="swatches lg" role="radiogroup" aria-label="Afwerking">
                {p.variants.map((x, i) => (
                  <button key={x.label} role="radio" aria-checked={i === v} title={x.label} aria-label={x.label} className={`swatch ${i === v ? 'on' : ''}`} style={{ background: x.color }} onClick={() => setV(i)} />
                ))}
              </div>
            </div>
          )}

          <div className="buy-box">
            <div className="buy-price">
              <Price value={p.price} old={p.oldPrice} size="lg" />
              {p.oldPrice && <span className="save">Je bespaart {money(p.oldPrice - p.price)}</span>}
            </div>
            <StockLine p={p} />
            <div className="buy-row">
              <QtyStepper value={qty} onChange={(n) => setQty(Math.max(1, n))} label={p.name} />
              <button className="btn btn-primary btn-lg grow" onClick={() => add(p.id, variant.label, qty)}><Icon name="cart" size={20} /> In winkelwagen</button>
              <button className={`icon-btn square ${wished ? 'on' : ''}`} onClick={() => toggleWish(p.id)} aria-pressed={wished} aria-label="Verlanglijst"><Icon name="heart" fill={wished} /></button>
            </div>
            <label className="compare-check"><input type="checkbox" checked={compare.includes(p.id)} onChange={() => toggleCompare(p.id)} /> Vergelijk met andere producten</label>
            <ul className="buy-usps">
              <li><Icon name="truck" size={18} /> {p.price >= shop.freeShippingFrom ? 'Gratis verzending' : `Gratis verzending vanaf € ${shop.freeShippingFrom}`}</li>
              <li><Icon name="return" size={18} /> {shop.returnDays} dagen bedenktijd, gratis retour</li>
              <li><Icon name="shield" size={18} /> 2 jaar garantie{p.level !== 'Beginner' ? ' · gratis afstelservice' : ''}</li>
              <li><Icon name="gift" size={18} /> Achteraf betalen of in 3 termijnen met Klarna</li>
            </ul>
          </div>
          <div className="level-note"><b>Niveau:</b> {p.level} · <Link to="/keuzehulp">Niet zeker? Doe de keuzehulp</Link></div>
        </div>
      </div>

      {fbt.length > 0 && (
        <section className="bundle">
          <h2>Vaak samen gekocht</h2>
          <div className="bundle-row">
            {[p, ...fbt].map((x, i) => (
              <div key={x.id} className="bundle-item-wrap">
                {i > 0 && <span className="bundle-plus"><Icon name="plus" size={18} /></span>}
                <label className={`bundle-item ${i > 0 && bundleSel[x.id] === false ? 'off' : ''}`}>
                  {i > 0 && <input type="checkbox" checked={bundleSel[x.id] !== false} onChange={(e) => setBundleSel((s2) => ({ ...s2, [x.id]: e.target.checked }))} />}
                  <span className="bundle-art"><ProductArt kind={x.kind} color={i === 0 ? variant.color : x.variants[0].color} /></span>
                  <span className="bundle-name">{i === 0 ? 'Dit product' : <Link to={`/product/${x.slug}`}>{x.name}</Link>}</span>
                  <b>{money(x.price)}</b>
                </label>
              </div>
            ))}
            <div className="bundle-total">
              <span>Totaal voor {bundleItems.length} artikelen</span>
              <b>{money(bundleTotal)}</b>
              <button className="btn btn-accent" onClick={() => bundleItems.forEach((x) => add(x.id, x.id === p.id ? variant.label : x.variants[0].label))}>Alles in winkelwagen</button>
            </div>
          </div>
        </section>
      )}

      <section className="tabs" id="tabs">
        <div className="tab-bar" role="tablist">
          {([['desc', 'Omschrijving'], ['specs', 'Specificaties'], ['reviews', `Reviews (${p.reviews})`]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="tab-panel" role="tabpanel">
          {tab === 'desc' && (
            <div className="desc">
              <div>
                <h3>Over de {p.name}</h3>
                <p>{p.description}</p>
                <p>De {b.name} {p.series}-serie is onderdeel van het assortiment van The Music Alliance. {b.story}</p>
              </div>
              <aside className="desc-aside">
                <h4>In het kort</h4>
                <dl>{p.specs.slice(3, 8).map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>
              </aside>
            </div>
          )}
          {tab === 'specs' && (
            <table className="spec-table"><tbody>
              {p.specs.map(([k, val]) => <tr key={k}><th>{k}</th><td>{val}</td></tr>)}
              <tr><th>Categorie</th><td>{c.name} › {s.name}</td></tr>
              <tr><th>Niveau</th><td>{p.level}</td></tr>
              <tr><th>Afwerkingen</th><td>{p.variants.map((x) => x.label).join(', ')}</td></tr>
            </tbody></table>
          )}
          {tab === 'reviews' && (
            <div className="reviews">
              <div className="rev-summary">
                <b className="rev-score">{p.rating.toLocaleString('nl-NL')}</b>
                <Stars value={p.rating} size={18} />
                <p className="muted">Gebaseerd op {p.reviews} reviews</p>
                <ul className="rev-dist">
                  {dist.map(([st, w]) => (
                    <li key={st}><span>{st} ★</span><span className="ship-track"><span className="ship-fill" style={{ width: `${(w / distTotal) * 100}%` }} /></span><span>{Math.round((w / distTotal) * p.reviews)}</span></li>
                  ))}
                </ul>
              </div>
              <ul className="rev-list">
                {reviews.map((r, i) => (
                  <li key={i}>
                    <div className="rev-head"><Stars value={r.stars} /><b>{r.title}</b></div>
                    <p>{r.body}</p>
                    <small className="muted">{r.name} uit {r.place} · {r.date}{r.verified && <> · <span className="verified"><Icon name="check" size={12} /> Geverifieerde aankoop</span></>}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <Rail title="Vergelijkbare producten" items={related(p)} more={{ label: `Alle ${s.name.toLowerCase()}`, to: `/c/${c.id}/${s.id}` }} />
      <Rail title="Recent bekeken" items={recent.filter((id) => id !== p.id).map((id) => productById[id]).filter(Boolean)} />

      <div className="sticky-buy only-mobile">
        <div><b>{money(p.price)}</b><small>{variant.label}</small></div>
        <button className="btn btn-primary" onClick={() => add(p.id, variant.label, qty)}><Icon name="cart" size={18} /> In winkelwagen</button>
      </div>
    </div>
  )
}
