import raw from './generated/catalog.json'
import { brandById, catById, categories, subById } from './taxonomy'
import type { ArtKind, Product, SubCategory } from './types'

export { brands, brandById, categories, catById, subById } from './taxonomy'

interface RawProduct {
  i: string; s: string; n: string; b: string; se: string; c: string; u: string; l: string; d: string; k: string
  p: number; pe: boolean; st?: number; co?: [string, string]; im?: string; ims?: string[]; e?: string; f?: string[]; nw?: 1
}
interface RawCatalog { source: string; scrapedAt: string; imageBase: string; pricesFromFeed: boolean; products: RawProduct[] }
const data = raw as unknown as RawCatalog

export const catalogMeta = { source: data.source, scrapedAt: data.scrapedAt, pricesFromFeed: data.pricesFromFeed }
export const imageUrl = (path: string, size = 600) => `${data.imageBase}${path}?width=${size}&height=${size}`

export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const subKey = (s: SubCategory) => `${s.parent}/${s.id}`

const level = (price: number): Product['level'] => (price < 150 ? 'Beginner' : price < 600 ? 'Gevorderd' : 'Professional')

const maxId = Math.max(...data.products.map((p) => Number(p.i)))

export const products: Product[] = data.products.map((r) => {
  const brand = brandById[r.b]
  const descParts = r.d.split(',').map((x) => x.trim()).filter(Boolean)
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1)
  const specs: [string, string][] = [
    ['Merk', brand?.name ?? r.b],
    ...(r.se ? [['Serie', r.se] as [string, string]] : []),
    ['Artikelnummer', r.s],
    ...(r.e ? [['EAN', r.e] as [string, string]] : []),
    ['Productgroep', r.l],
  ]
  return {
    id: r.i,
    sku: r.s,
    slug: `${slugify(r.n)}-${r.i}`,
    name: r.n.replace(/\s+/g, ' ').trim(),
    brand: r.b,
    series: r.se,
    category: r.c,
    sub: `${r.c}/${r.u}`,
    leaf: r.l,
    price: r.p,
    priceEstimated: r.pe,
    rating: 0,
    reviews: 0,
    stock: r.st,
    isNew: !!r.nw,
    kind: r.k as ArtKind,
    variants: [{ label: r.co?.[1] || 'Standaard', color: r.co?.[0] ?? `hsl(${(catById[r.c]?.hue ?? 30)} 45% 48%)` }],
    image: r.im,
    images: r.ims,
    ean: r.e,
    features: r.f,
    short: r.se || r.l,
    description: cap(r.d || r.n),
    specs,
    highlights: (r.f?.length ? r.f : descParts.slice(1)).slice(0, 4).map(cap),
    level: level(r.p),
    addedAt: Number(r.i) / maxId,
  } satisfies Product
})

export const productById: Record<string, Product> = Object.fromEntries(products.map((p) => [p.id, p]))
export const productBySlug: Record<string, Product> = Object.fromEntries(products.map((p) => [p.slug, p]))

const byCat = new Map<string, Product[]>()
const bySub = new Map<string, Product[]>()
const byBrand = new Map<string, Product[]>()
for (const p of products) {
  for (const [m, k] of [[byCat, p.category], [bySub, p.sub], [byBrand, p.brand]] as const) {
    if (!m.has(k)) m.set(k, [])
    m.get(k)!.push(p)
  }
}
export const productsInCategory = (catId: string) => byCat.get(catId) ?? []
export const productsInSub = (key: string) => bySub.get(key) ?? []
export const productsOfBrand = (brandId: string) => byBrand.get(brandId) ?? []

export function related(p: Product, n = 8): Product[] {
  const sameLeaf = productsInSub(p.sub).filter((q) => q.id !== p.id && q.leaf === p.leaf)
  const pool = sameLeaf.length >= n ? sameLeaf : [...sameLeaf, ...productsInSub(p.sub).filter((q) => q.id !== p.id && q.leaf !== p.leaf)]
  return pool
    .map((q) => [q, Math.abs(Math.log(q.price / p.price)) + (q.brand === p.brand ? -0.3 : 0)] as const)
    .sort((a, b) => a[1] - b[1])
    .slice(0, n)
    .map(([q]) => q)
}

/** "Vaak samen gekocht": bijpassende accessoiregroepen per instrumenttype (op trefwoord in productgroep). */
const accessoryHints: [RegExp, string[]][] = [
  [/gitaren|resonator|banjo|mandoline/i, ['Snaren', 'Riemen', 'Stemapparaten', 'Tassen', 'Statieven']],
  [/ukulele/i, ['Snaren', 'Tassen', 'Stemapparaten']],
  [/drum|snare|percussie|cajon|bongo|conga/i, ['Stokken', 'Drumvellen', 'Hoezen']],
  [/sax|klarinet|fluit|trompet|trombone|hoorn|bugel|eufon/i, ['Rieten', 'Mondstukken', 'Onderhoud', 'Statieven']],
  [/viol|cello|contrabas/i, ['snaren', 'Hars', 'Schoudersteunen', 'Stemapparaten']],
  [/versterker|effect/i, ['Kabels', 'Voedingen']],
  [/microfoon/i, ['Kabels', 'Statieven']],
  [/accordeon/i, ['Riemen', 'Tassen']],
]

export function frequentlyBoughtWith(p: Product, n = 3): Product[] {
  const hint = accessoryHints.find(([re]) => re.test(`${p.leaf} ${catById[p.category]?.name}`))
  if (!hint) return []
  const out: Product[] = []
  for (const word of hint[1]) {
    const w = word.toLowerCase()
    const pick = products.find((q) =>
      q.sub !== p.sub && !out.includes(q) && q.image &&
      (q.leaf.toLowerCase().includes(w) || (subById[q.sub]?.name.toLowerCase().includes(w) ?? false)))
    if (pick) out.push(pick)
    if (out.length >= n) break
  }
  return out
}

const haystack = new Map<string, string>()
export function search(q: string): Product[] {
  const terms = slugify(q).split('-').filter(Boolean)
  if (!terms.length) return []
  const scored: [Product, number][] = []
  for (const p of products) {
    let hay = haystack.get(p.id)
    if (!hay) {
      hay = slugify(`${p.name} ${p.series} ${brandById[p.brand]?.name} ${p.leaf} ${subById[p.sub]?.name} ${catById[p.category]?.name} ${p.sku} ${p.ean ?? ''} ${p.description}`)
      haystack.set(p.id, hay)
    }
    let score = 0
    let ok = true
    const nm = slugify(p.name)
    for (const t of terms) {
      if (!hay.includes(t)) { ok = false; break }
      score += nm.includes(t) ? 3 : 1
      if (slugify(p.sku) === t) score += 20
    }
    if (ok) scored.push([p, score])
  }
  return scored.sort((a, b) => b[1] - a[1]).map(([p]) => p)
}

export const stats = {
  products: products.length,
  brands: Object.keys(brandById).length,
  categories: categories.length,
}
