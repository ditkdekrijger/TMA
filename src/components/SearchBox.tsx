import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { brands, categories, search, brandById } from '../data/catalog'
import { money } from '../lib/format'
import Icon from './Icon'
import ProductImage from './ProductImage'

const POPULAR = ['ukulele', 'klassieke gitaar', 'cajon', 'Richwood', 'saxofoon', 'snaren', 'Rotosound']

export default function SearchBox({ onDone }: { onDone?: () => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const nav = useNavigate()
  const box = useRef<HTMLDivElement>(null)

  const results = useMemo(() => (q.trim().length >= 2 ? search(q).slice(0, 6) : []), [q])
  const lower = q.trim().toLowerCase()
  const brandHits = lower.length >= 2 ? brands.filter((b) => b.name.toLowerCase().includes(lower)).slice(0, 4) : []
  const subHits = lower.length >= 2 ? categories.flatMap((c) => c.children).filter((s) => s.name.toLowerCase().includes(lower)).slice(0, 4) : []

  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const go = (to: string) => { setOpen(false); setQ(''); setActive(-1); nav(to); onDone?.() }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (active >= 0 && results[active]) return go(`/product/${results[active].slug}`)
    if (q.trim()) go(`/zoeken?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <div className="search" ref={box}>
      <form onSubmit={submit} role="search">
        <Icon name="search" size={18} className="search-icon" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)) }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(-1, a - 1)) }
            if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="Zoek op instrument, merk of artikelnummer"
          aria-label="Zoeken"
          aria-expanded={open}
          aria-controls="search-pop"
          autoComplete="off"
        />
        {q && <button type="button" className="search-clear" onClick={() => setQ('')} aria-label="Wis zoekopdracht"><Icon name="close" size={16} /></button>}
        <button className="btn btn-primary search-go" type="submit">Zoek</button>
      </form>
      {open && (
        <div className="search-pop" id="search-pop">
          {q.trim().length < 2 ? (
            <div className="search-section">
              <h4>Populair</h4>
              <div className="chips">{POPULAR.map((t) => <button key={t} className="chip" onClick={() => go(`/zoeken?q=${encodeURIComponent(t)}`)}>{t}</button>)}</div>
            </div>
          ) : (
            <>
              {(brandHits.length > 0 || subHits.length > 0) && (
                <div className="search-section">
                  <div className="chips">
                    {subHits.map((s) => <button key={s.id} className="chip" onClick={() => go(`/c/${s.parent}/${s.id}`)}>{s.name}</button>)}
                    {brandHits.map((b) => <button key={b.id} className="chip chip-brand" onClick={() => go(`/merk/${b.id}`)}>Merk: {b.name}</button>)}
                  </div>
                </div>
              )}
              {results.length > 0 ? (
                <ul className="search-results" role="listbox">
                  {results.map((p, i) => (
                    <li key={p.id} role="option" aria-selected={i === active}>
                      <button className={i === active ? 'on' : ''} onClick={() => go(`/product/${p.slug}`)} onMouseEnter={() => setActive(i)}>
                        <span className="sr-art"><ProductImage p={p} size={100} /></span>
                        <span className="sr-text"><b>{p.name}</b><small>{brandById[p.brand]?.name} · {p.leaf} · {p.sku}</small></span>
                        <span className="sr-price">{money(p.price)}</span>
                      </button>
                    </li>
                  ))}
                  <li><button className="sr-all" onClick={() => go(`/zoeken?q=${encodeURIComponent(q.trim())}`)}>Alle resultaten voor “{q.trim()}” <Icon name="chevron" size={14} /></button></li>
                </ul>
              ) : <p className="search-none">Geen producten gevonden voor “{q}”. Probeer een andere zoekterm.</p>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
