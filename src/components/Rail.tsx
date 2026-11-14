import { useRef } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../data/types'
import Icon from './Icon'
import ProductCard from './ProductCard'

export default function Rail({ title, items, more }: { title: string; items: Product[]; more?: { label: string; to: string } }) {
  const ref = useRef<HTMLDivElement>(null)
  if (!items.length) return null
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <section className="rail">
      <div className="rail-head">
        <h2>{title}</h2>
        <div className="rail-ctrl">
          {more && <Link to={more.to} className="link">{more.label}</Link>}
          <button className="icon-btn round hide-sm" onClick={() => scroll(-1)} aria-label="Vorige"><Icon name="chevron" size={18} className="flip" /></button>
          <button className="icon-btn round hide-sm" onClick={() => scroll(1)} aria-label="Volgende"><Icon name="chevron" size={18} /></button>
        </div>
      </div>
      <div className="rail-track" ref={ref}>
        {items.map((p) => <div className="rail-item" key={p.id}><ProductCard p={p} /></div>)}
      </div>
    </section>
  )
}
