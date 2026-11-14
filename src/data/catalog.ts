import { finishes, lines } from './lines'
import { brandById, catById, categories, subById } from './taxonomy'
import type { Product } from './types'

export { brands, brandById, categories, catById, subById } from './taxonomy'

/** Deterministische pseudo-random op basis van een string, zodat de catalogus stabiel is. */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0) / 4294967295
}

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

const parseSpecs = (s: string): [string, string][] =>
  s.split('|').map((p) => p.trim()).filter(Boolean).map((p) => {
    const i = p.indexOf(':')
    return [p.slice(0, i).trim(), p.slice(i + 1).trim()] as [string, string]
  })

const mergeSpecs = (base: [string, string][], extra: [string, string][]) => {
  const out = [...base]
  for (const [k, v] of extra) {
    const i = out.findIndex(([bk]) => bk === k)
    if (i >= 0) out[i] = [k, v]
    else out.push([k, v])
  }
  return out
}

const roundPrice = (p: number) => (p < 30 ? Math.round(p * 2) / 2 - 0.05 : Math.round(p) - 1)

const NOW = Date.UTC(2026, 10, 1)

export const products: Product[] = lines.flatMap((line) => {
  const brand = brandById[line.brand]
  const sub = subById[line.sub]
  if (!brand || !sub) throw new Error(`Onbekend merk/categorie in lijn ${line.series}`)
  const base = parseSpecs(line.specs)
  return line.models.map(([code, title, price, extra]) => {
    const id = slugify(`${brand.id}-${code}`)
    const r = hash(id)
    const r2 = hash(id + 'x')
    const r3 = hash(id + 'y')
    const onSale = r2 < 0.18 && price > 15
    const variants = (line.finishes ?? ['Zwart']).map((label) => ({ label, color: finishes[label] ?? '#888' }))
    const name = `${brand.name} ${code} ${title}`
    return {
      id,
      sku: `TMA-${code.replace(/[^A-Z0-9]/gi, '').toUpperCase()}-${Math.floor(r * 9000 + 1000)}`,
      slug: slugify(name),
      name,
      brand: brand.id,
      series: line.series,
      category: sub.parent,
      sub: sub.id,
      price: onSale ? roundPrice(price * (0.82 + r3 * 0.1)) : price,
      oldPrice: onSale ? price : undefined,
      rating: Math.round((3.9 + r * 1.1) * 10) / 10,
      reviews: Math.floor(r3 * 180) + 3,
      stock: r2 > 0.93 ? 0 : r2 > 0.85 ? Math.floor(r * 4) + 1 : Math.floor(r * 60) + 5,
      isNew: r3 > 0.86,
      kind: line.kind,
      variants,
      short: `${line.series} · ${title}`,
      description: line.desc,
      specs: mergeSpecs([['Merk', brand.name], ['Serie', line.series], ['Artikelnummer', code]], mergeSpecs(base, parseSpecs(extra ?? ''))),
      highlights: line.highlights,
      level: line.level,
      addedAt: NOW - Math.floor(r * 400) * 86400000,
    } satisfies Product
  })
})

export const productById: Record<string, Product> = Object.fromEntries(products.map((p) => [p.id, p]))

export const productsInCategory = (catId: string) => products.filter((p) => p.category === catId)
export const productsInSub = (subId: string) => products.filter((p) => p.sub === subId)
export const productsOfBrand = (brandId: string) => products.filter((p) => p.brand === brandId)

export function related(p: Product, n = 8): Product[] {
  return products
    .filter((q) => q.id !== p.id && (q.sub === p.sub || (q.category === p.category && q.brand === p.brand)))
    .sort((a, b) => Number(b.sub === p.sub) - Number(a.sub === p.sub) || b.rating - a.rating)
    .slice(0, n)
}

/** Slimme "vaak samen gekocht"-suggesties per categorie. */
const accessoryMap: Record<string, string[]> = {
  gitaren: ['snaren', 'gitaarbanden', 'stemapparaten', 'tassen', 'standaards', 'kabels'],
  ukuleles: ['snaren', 'tassen', 'stemapparaten'],
  drums: ['drumsticks', 'drumvellen', 'hoofdtelefoons'],
  toetsen: ['toetsen-accessoires', 'hoofdtelefoons'],
  blaas: ['standaards', 'onderhoud'],
  strijk: ['snaren', 'stemapparaten', 'standaards'],
  versterkers: ['kabels', 'pedalboards', 'effectpedalen'],
  'live-studio': ['kabels', 'standaards'],
  accessoires: ['plectrums', 'onderhoud'],
  onderdelen: ['gereedschap', 'onderhoud'],
}

export function frequentlyBoughtWith(p: Product, n = 3): Product[] {
  const subs = accessoryMap[p.category] ?? []
  const out: Product[] = []
  for (const s of subs) {
    const pick = products
      .filter((q) => q.sub === s && q.id !== p.id && q.stock > 0)
      .sort((a, b) => b.reviews - a.reviews)[0]
    if (pick) out.push(pick)
    if (out.length >= n) break
  }
  return out
}

export function search(q: string): Product[] {
  const terms = slugify(q).split('-').filter(Boolean)
  if (!terms.length) return []
  return products
    .map((p) => {
      const hay = slugify(`${p.name} ${p.series} ${brandById[p.brand].name} ${subById[p.sub].name} ${catById[p.category].name} ${p.sku} ${p.specs.map((s) => s[1]).join(' ')}`)
      let score = 0
      for (const t of terms) {
        if (!hay.includes(t)) return [p, 0] as const
        score += slugify(p.name).includes(t) ? 3 : 1
      }
      return [p, score + p.rating / 10] as const
    })
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p)
}

export const stats = {
  products: products.length,
  brands: Object.keys(brandById).length,
  categories: categories.length,
}
