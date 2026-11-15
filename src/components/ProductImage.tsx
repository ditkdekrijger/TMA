import { useState } from 'react'
import { imageUrl } from '../data/catalog'
import sprites from '../data/generated/sprites.json'
import type { Product } from '../data/types'
import ProductArt from './ProductArt'

/**
 * Productfoto. Twee bronnen:
 * - 'remote' (standaard): losse foto's van de TMA-server
 * - 'sprites' (artifact-build, `vite build --mode single`): gebundelde sprite sheets die met de pagina
 *   worden meegepubliceerd, omdat een artifact geen afbeeldingen van andere servers mag laden.
 */
const MODE: 'remote' | 'sprites' = import.meta.env.MODE === 'single' || import.meta.env.VITE_IMAGES === 'sprites' ? 'sprites' : 'remote'
const spriteMap = (sprites as unknown as { cell: number; grid: number; map: Record<string, [number, number]> })

export default function ProductImage({ p, path, size = 600, color, className }: { p: Product; path?: string; size?: number; color?: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const fallback = <ProductArt kind={p.kind} color={color ?? p.variants[0].color} title={p.name} className={className} />

  if (MODE === 'sprites') {
    const hit = (!path || path === p.image) ? spriteMap.map[p.id] : undefined
    if (!hit) return fallback
    const [sheet, i] = hit
    const g = spriteMap.grid
    const col = i % g
    const row = Math.floor(i / g)
    return (
      <span role="img" aria-label={p.name} className={`pimg sprite ${className ?? ''}`}
        style={{
          backgroundImage: `url(sprites/s${sheet}.jpg)`,
          backgroundSize: `${g * 100}% ${g * 100}%`,
          backgroundPosition: `${(col / (g - 1)) * 100}% ${(row / (g - 1)) * 100}%`,
        }} />
    )
  }

  const src = path ?? p.image
  if (!src || failed) return fallback
  return (
    <img className={`pimg ${className ?? ''}`} src={imageUrl(src, size)} alt={p.name} loading="lazy" decoding="async"
      onError={() => setFailed(true)} />
  )
}
