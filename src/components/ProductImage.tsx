import { useState } from 'react'
import { imageUrl } from '../data/catalog'
import type { Product } from '../data/types'
import ProductArt from './ProductArt'

export default function ProductImage({ p, path, size = 600, color, className }: { p: Product; path?: string; size?: number; color?: string; className?: string }) {
  const src = path ?? p.image
  const [failed, setFailed] = useState(false)
  if (!src || failed) return <ProductArt kind={p.kind} color={color ?? p.variants[0].color} title={p.name} className={className} />
  return (
    <img className={`pimg ${className ?? ''}`} src={imageUrl(src, size)} alt={p.name} loading="lazy" decoding="async"
      onError={() => setFailed(true)} />
  )
}
