import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { brandById, catById, frequentlyBoughtWith, productById, productBySlug, related, subById } from '../data/catalog'
import ProductImage from '../components/ProductImage'
import Rail from '../components/Rail'
import Icon from '../components/Icon'
import { Breadcrumbs, Price, Stars, StockLine } from '../components/bits'
import { QtyStepper } from '../components/CartDrawer'
import { useStore } from '../state/store'
import { money } from '../lib/format'
import { shop } from '../lib/config'
import { useTitle } from '../lib/useTitle'
import NotFound from './NotFound'

export default function ProductPage() {
  const { slug } = useParams()
  const p = productBySlug[slug ?? '']
  const { add, toggleWish, wishlist, toggleCompare, compare, viewed, recent } = useStore()
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [bundleSel, setBundleSel] = useState<Record<string, boolean>>({})
  useTitle(p?.name)

  useEffect(() => { if (p) { viewed(p.id); setImg(0); setQty(1); setTab('desc'); setBundleSel({}); window.scrollTo(0, 0) } }, [p, viewed])

  if (!p) return <NotFound />
  const b = brandById[p.brand]
  const c = catById[p.category]
  const s = subById[p.sub]
  const variant = p.variants[0]
  const wished = wishlist.includes(p.id)
  const gallery = p.images?.length ? p.images : p.image ? [p.image] : []
  const fbt = frequentlyBoughtWith(p, 3)
  const bundleItems = [p, ...fbt.filter((x) => bundleSel[x.id] !== false)]
  const bundleTotal = bundleItems.reduce((sum, x) => sum + x.price, 0)

  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, ...(p.ean ? { gtin13: p.ean } : {}),
    brand: { '@type': 'Brand', name: b?.name }, description: p.description, category: `${c.name} > ${s?.name} > ${p.leaf}`,
    offers: { '@type': 'Offer', priceCurrency: 'EUR', price: p.price, availability: 'https://schema.org/InStock' },
  }

  return (
    <div className="wrap page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: c.name, to: `/c/${c.id}` }, ...(s ? [{ label: s.name, to: `/c/${c.id}/${s.id}` }] : []), { label: p.name }]} />

      <div className="pdp">
        <div className="pdp-gallery">
          <div className="pdp-main" style={{ ['--tint' as string]: variant.color }}>
            <div className="card-badges">
              {p.isNew && <span className="badge badge-new">Nieuw</span>}
              {b?.house && <span className="badge badge-house">TMA-huismerk</span>}
            </div>
            <ProductImage p={p} path={gallery[img]} size={900} />
          </div>
          {gallery.length > 1 && (
            <div className="pdp-thumbs">
              {gallery.map((g, i) => (
                <button key={g} className={i === img ? 'on' : ''} onClick={() => setImg(i)} aria-label={`Afbeelding ${i + 1}`}>
                  <ProductImage p={p} path={g} size={160} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <Link to={`/merk/${p.brand}`} className="pdp-brand">{b?.name}{p.series && <span className="muted"> · {p.series}</span>}</Link>
          <h1>{p.name}</h1>
          <div className="pdp-rating">
            {p.reviews > 0 && <Stars value={p.rating} size={16} />}
            <span className="muted">Art.nr. {p.sku}</span>
            {p.ean && <span className="muted">EAN {p.ean}</span>}
          </div>
          <p className="pdp-desc">{p.description}</p>
          {p.highlights.length > 0 && <ul className="pdp-highlights">{p.highlights.map((h) => <li key={h}><Icon name="check" size={16} /> {h}</li>)}</ul>}

          <div className="buy-box">
            <div className="buy-price">
              <Price value={p.price} old={p.oldPrice} size="lg" />
              {p.priceEstimated && <span className="price-note">Richtprijs</span>}
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
              <li><Icon name="shield" size={18} /> 2 jaar garantie</li>
              <li><Icon name="gift" size={18} /> Achteraf betalen of in 3 termijnen met Klarna</li>
            </ul>
          </div>
          <div className="level-note">Productgroep: <Link to={`/c/${c.id}/${s?.id ?? ''}?soort=${encodeURIComponent(p.leaf)}`}>{p.leaf}</Link> · <Link to="/keuzehulp">Hulp nodig bij kiezen?</Link></div>
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
                  <span className="bundle-art"><ProductImage p={x} size={200} /></span>
                  <span className="bundle-name">{i === 0 ? 'Dit product' : <Link to={`/product/${x.slug}`}>{x.name}</Link>}</span>
                  <b>{money(x.price)}</b>
                </label>
              </div>
            ))}
            <div className="bundle-total">
              <span>Totaal voor {bundleItems.length} artikelen</span>
              <b>{money(bundleTotal)}</b>
              <button className="btn btn-accent" onClick={() => bundleItems.forEach((x) => add(x.id, x.variants[0].label))}>Alles in winkelwagen</button>
            </div>
          </div>
        </section>
      )}

      <section className="tabs" id="tabs">
        <div className="tab-bar" role="tablist">
          {([['desc', 'Omschrijving'], ['specs', 'Specificaties'], ['reviews', 'Reviews']] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>
        <div className="tab-panel" role="tabpanel">
          {tab === 'desc' && (
            <div className="desc">
              <div>
                <h3>{p.name}</h3>
                <p>{p.description}.</p>
                {p.features?.length ? <><h4>Kenmerken</h4><ul className="pdp-features">{p.features.map((f) => <li key={f}>{f}</li>)}</ul></> : null}
                {b && <p>{b.story}</p>}
              </div>
              <aside className="desc-aside">
                <h4>In het kort</h4>
                <dl>{p.specs.map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>
              </aside>
            </div>
          )}
          {tab === 'specs' && (
            <table className="spec-table"><tbody>
              {p.specs.map(([k, val]) => <tr key={k}><th>{k}</th><td>{val}</td></tr>)}
              <tr><th>Categorie</th><td>{c.name} › {s?.name} › {p.leaf}</td></tr>
              {p.description.split(',').slice(1).map((d, i) => <tr key={i}><th>{i === 0 ? 'Eigenschappen' : ''}</th><td>{d.trim()}</td></tr>)}
            </tbody></table>
          )}
          {tab === 'reviews' && (
            <div className="empty small">
              <h3>Nog geen reviews</h3>
              <p>Heb je dit product gekocht? Laat anderen weten wat je ervan vindt.</p>
              <button className="btn btn-ghost">Schrijf een review</button>
            </div>
          )}
        </div>
      </section>

      <Rail title="Vergelijkbare producten" items={related(p)} more={s ? { label: `Alles in ${s.name.toLowerCase()}`, to: `/c/${c.id}/${s.id}` } : undefined} />
      <Rail title="Recent bekeken" items={recent.filter((id) => id !== p.id).map((id) => productById[id]).filter(Boolean)} />

      <div className="sticky-buy only-mobile">
        <div><b>{money(p.price)}</b><small>Art.nr. {p.sku}</small></div>
        <button className="btn btn-primary" onClick={() => add(p.id, variant.label, qty)}><Icon name="cart" size={18} /> In winkelwagen</button>
      </div>
    </div>
  )
}
