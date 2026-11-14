import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { brandById, subById } from '../data/catalog'
import type { Product } from '../data/types'
import { money } from '../lib/format'
import Icon from './Icon'
import ProductCard from './ProductCard'

type SortKey = 'relevant' | 'price-asc' | 'price-desc' | 'new' | 'name'
const SORTS: [SortKey, string][] = [
  ['relevant', 'Meest relevant'], ['new', 'Nieuwste'], ['price-asc', 'Prijs laag – hoog'],
  ['price-desc', 'Prijs hoog – laag'], ['name', 'Naam A – Z'],
]
const PAGE = 24
const LEVELS: Product['level'][] = ['Beginner', 'Gevorderd', 'Professional']

const PRICE_BANDS: [string, number, number][] = [
  ['Tot € 25', 0, 25], ['€ 25 – 100', 25, 100], ['€ 100 – 250', 100, 250], ['€ 250 – 500', 250, 500], ['€ 500 – 1.000', 500, 1000], ['Vanaf € 1.000', 1000, Infinity],
]

function Facet({ title, children, open = true }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details className="facet" open={open}>
      <summary>{title}<Icon name="chevronDown" size={16} /></summary>
      <div className="facet-body">{children}</div>
    </details>
  )
}

export default function Listing({ items, hideFacets = [] }: { items: Product[]; hideFacets?: ('sub' | 'brand')[] }) {
  const [sp, setSp] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')

  const getList = (k: string) => (sp.get(k) ? sp.get(k)!.split(',') : [])
  const selSubs = getList('type')
  const selLeaf = getList('soort')
  const selBrands = getList('merk')
  const selLevels = getList('niveau')
  const selPrice = getList('prijs')
  const inStock = sp.get('voorraad') === '1'
  const onSale = sp.get('actie') === '1'
  const onlyNew = sp.get('nieuw') === '1'
  const minRating = Number(sp.get('score') ?? 0)
  const sort = (sp.get('sort') as SortKey) ?? 'relevant'

  const update = (k: string, v: string | null) => {
    const next = new URLSearchParams(sp)
    if (v === null || v === '') next.delete(k)
    else next.set(k, v)
    setSp(next, { replace: true })
  }
  const toggle = (k: string, v: string) => {
    const cur = getList(k)
    update(k, (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(','))
  }

  useEffect(() => { setShown(PAGE) }, [sp, items])

  const matches = (p: Product, skip?: string) =>
    (skip === 'type' || !selSubs.length || selSubs.includes(p.sub)) &&
    (skip === 'merk' || !selBrands.length || selBrands.includes(p.brand)) &&
    (skip === 'soort' || !selLeaf.length || selLeaf.includes(p.leaf)) &&
    (skip === 'niveau' || !selLevels.length || selLevels.includes(p.level)) &&
    (skip === 'prijs' || !selPrice.length || selPrice.some((b) => { const band = PRICE_BANDS[Number(b)]; return band && p.price >= band[1] && p.price < band[2] })) &&
    (!inStock || (p.stock ?? 1) > 0) && (!onSale || !!p.oldPrice) && (!onlyNew || p.isNew) && p.rating >= minRating

  const filtered = useMemo(() => {
    const out = items.filter((p) => matches(p))
    const s = [...out]
    if (sort === 'price-asc') s.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') s.sort((a, b) => b.price - a.price)
    else if (sort === 'name') s.sort((a, b) => a.name.localeCompare(b.name, 'nl'))
    else if (sort === 'new') s.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.addedAt - a.addedAt)
    else s.sort((a, b) => Number(!!b.image) - Number(!!a.image))
    return s
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sp])

  const count = (key: string, pred: (p: Product) => boolean) => items.filter((p) => matches(p, key) && pred(p)).length
  const facetValues = (key: 'sub' | 'brand') => {
    const ids = [...new Set(items.map((p) => p[key]))]
    return ids.map((id) => ({ id, label: key === 'sub' ? subById[id]?.name ?? id : brandById[id]?.name ?? id, n: count(key === 'sub' ? 'type' : 'merk', (p) => p[key] === id) }))
      .sort((a, b) => b.n - a.n)
  }

  const leafValues = [...new Set(items.map((p) => p.leaf))].map((l) => ({ id: l, n: count('soort', (p) => p.leaf === l) })).sort((a, b) => b.n - a.n)
  const hasRatings = items.some((p) => p.reviews > 0)
  const hasSale = items.some((p) => p.oldPrice)
  const hasNew = items.some((p) => p.isNew)
  const hasStock = items.some((p) => p.stock !== undefined)
  const [brandQuery, setBrandQuery] = useState('')
  const [showAllLeaf, setShowAllLeaf] = useState(false)

  const chips: { label: string; clear: () => void }[] = [
    ...selSubs.map((s) => ({ label: subById[s]?.name ?? s, clear: () => toggle('type', s) })),
    ...selBrands.map((b) => ({ label: brandById[b]?.name ?? b, clear: () => toggle('merk', b) })),
    ...selLeaf.map((l) => ({ label: l, clear: () => toggle('soort', l) })),
    ...(onlyNew ? [{ label: 'Nieuw', clear: () => update('nieuw', null) }] : []),
    ...selLevels.map((l) => ({ label: l, clear: () => toggle('niveau', l) })),
    ...selPrice.map((b) => ({ label: PRICE_BANDS[Number(b)]?.[0] ?? b, clear: () => toggle('prijs', b) })),
    ...(inStock ? [{ label: 'Op voorraad', clear: () => update('voorraad', null) }] : []),
    ...(onSale ? [{ label: 'In de aanbieding', clear: () => update('actie', null) }] : []),
    ...(minRating ? [{ label: `${minRating}+ sterren`, clear: () => update('score', null) }] : []),
  ]
  const clearAll = () => { const n = new URLSearchParams(); if (sp.get('q')) n.set('q', sp.get('q')!); setSp(n, { replace: true }) }

  const minP = filtered.length ? Math.min(...filtered.map((p) => p.price)) : 0
  const maxP = filtered.length ? Math.max(...filtered.map((p) => p.price)) : 0

  const facets = (
    <>
      {!hideFacets.includes('sub') && facetValues('sub').length > 1 && (
        <Facet title="Type">
          {facetValues('sub').map((f) => (
            <label key={f.id} className={`check ${f.n === 0 ? 'dim' : ''}`}><input type="checkbox" checked={selSubs.includes(f.id)} onChange={() => toggle('type', f.id)} /> {f.label}<small>{f.n}</small></label>
          ))}
        </Facet>
      )}
      {leafValues.length > 1 && (
        <Facet title="Soort">
          {(showAllLeaf ? leafValues : leafValues.slice(0, 10)).map((f) => (
            <label key={f.id} className={`check ${f.n === 0 ? 'dim' : ''}`}><input type="checkbox" checked={selLeaf.includes(f.id)} onChange={() => toggle('soort', f.id)} /> {f.id}<small>{f.n}</small></label>
          ))}
          {leafValues.length > 10 && <button className="link-btn" onClick={() => setShowAllLeaf((x) => !x)}>{showAllLeaf ? 'Minder tonen' : `Toon alle ${leafValues.length}`}</button>}
        </Facet>
      )}
      {!hideFacets.includes('brand') && facetValues('brand').length > 1 && (
        <Facet title="Merk">
          {facetValues('brand').length > 8 && <input className="facet-search" placeholder="Zoek merk" value={brandQuery} onChange={(e) => setBrandQuery(e.target.value)} aria-label="Zoek merk" />}
          {facetValues('brand').filter((f) => f.label.toLowerCase().includes(brandQuery.toLowerCase())).slice(0, brandQuery ? 50 : 12).map((f) => (
            <label key={f.id} className={`check ${f.n === 0 ? 'dim' : ''}`}><input type="checkbox" checked={selBrands.includes(f.id)} onChange={() => toggle('merk', f.id)} /> {f.label}<small>{f.n}</small></label>
          ))}
        </Facet>
      )}
      <Facet title="Prijs">
        {PRICE_BANDS.map(([label, lo, hi], i) => {
          const n = count('prijs', (p) => p.price >= lo && p.price < hi)
          return n || selPrice.includes(String(i)) ? (
            <label key={label} className="check"><input type="checkbox" checked={selPrice.includes(String(i))} onChange={() => toggle('prijs', String(i))} /> {label}<small>{n}</small></label>
          ) : null
        })}
      </Facet>
      <Facet title="Niveau">
        {LEVELS.map((l) => {
          const n = count('niveau', (p) => p.level === l)
          return <label key={l} className={`check ${n === 0 ? 'dim' : ''}`}><input type="checkbox" checked={selLevels.includes(l)} onChange={() => toggle('niveau', l)} /> {l}<small>{n}</small></label>
        })}
      </Facet>
      {hasRatings && <Facet title="Beoordeling">
        {[4.5, 4].map((r) => (
          <label key={r} className="check"><input type="radio" name="score" checked={minRating === r} onChange={() => update('score', String(r))} /> {r.toLocaleString('nl-NL')} sterren of meer</label>
        ))}
        {minRating > 0 && <button className="link-btn" onClick={() => update('score', null)}>Wis</button>}
      </Facet>}
      {(hasStock || hasNew || hasSale) && <Facet title="Beschikbaarheid">
        {hasStock && <label className="toggle"><input type="checkbox" checked={inStock} onChange={() => update('voorraad', inStock ? null : '1')} /><span /> Direct leverbaar</label>}
        {hasNew && <label className="toggle"><input type="checkbox" checked={onlyNew} onChange={() => update('nieuw', onlyNew ? null : '1')} /><span /> Alleen nieuw</label>}
        {hasSale && <label className="toggle"><input type="checkbox" checked={onSale} onChange={() => update('actie', onSale ? null : '1')} /><span /> In de aanbieding</label>}
      </Facet>}
    </>
  )

  return (
    <div className="listing">
      <aside className="facets" aria-label="Filters">{facets}</aside>
      <section className="results">
        <div className="toolbar">
          <button className="btn btn-ghost only-mobile" onClick={() => setMobileFilters(true)}><Icon name="filter" size={18} /> Filters {chips.length > 0 && <span className="pill pill-inline">{chips.length}</span>}</button>
          <p className="result-count"><b>{filtered.length}</b> {filtered.length === 1 ? 'product' : 'producten'}{filtered.length > 0 && <span className="muted hide-sm"> · {money(minP)} – {money(maxP)}</span>}</p>
          <div className="toolbar-right">
            <label className="sort"><span className="sr-only">Sorteer</span>
              <select value={sort} onChange={(e) => update('sort', e.target.value === 'relevant' ? null : e.target.value)}>
                {SORTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </label>
            <div className="seg hide-sm" role="group" aria-label="Weergave">
              <button className={layout === 'grid' ? 'on' : ''} onClick={() => setLayout('grid')} aria-label="Raster"><Icon name="grid" size={16} /></button>
              <button className={layout === 'list' ? 'on' : ''} onClick={() => setLayout('list')} aria-label="Lijst"><Icon name="list" size={16} /></button>
            </div>
          </div>
        </div>
        {chips.length > 0 && (
          <div className="active-chips">
            {chips.map((c) => <button key={c.label} className="chip chip-x" onClick={c.clear}>{c.label}<Icon name="close" size={12} /></button>)}
            <button className="link-btn" onClick={clearAll}>Alles wissen</button>
          </div>
        )}
        {filtered.length === 0 ? (
          <div className="empty"><h2>Geen producten gevonden</h2><p>Pas je filters aan om meer resultaten te zien.</p><button className="btn btn-primary" onClick={clearAll}>Filters wissen</button></div>
        ) : (
          <>
            <div className={layout === 'grid' ? 'grid' : 'list'}>
              {filtered.slice(0, shown).map((p) => <ProductCard key={p.id} p={p} layout={layout} />)}
            </div>
            {shown < filtered.length && (
              <div className="load-more">
                <p className="muted">Je hebt {shown} van {filtered.length} producten bekeken</p>
                <div className="ship-track"><div className="ship-fill" style={{ width: `${(shown / filtered.length) * 100}%` }} /></div>
                <button className="btn btn-ghost" onClick={() => setShown((s) => s + PAGE)}>Meer laden</button>
              </div>
            )}
          </>
        )}
      </section>

      {mobileFilters && (
        <div className="drawer-wrap" onClick={() => setMobileFilters(false)}>
          <aside className="drawer drawer-left" onClick={(e) => e.stopPropagation()} aria-label="Filters">
            <div className="drawer-head"><h2>Filters</h2><button className="icon-btn" onClick={() => setMobileFilters(false)} aria-label="Sluiten"><Icon name="close" /></button></div>
            <div className="drawer-body">{facets}</div>
            <div className="drawer-foot"><button className="btn btn-primary btn-block" onClick={() => setMobileFilters(false)}>Toon {filtered.length} producten</button></div>
          </aside>
        </div>
      )}
    </div>
  )
}
