export type ArtKind =
  | 'acoustic' | 'classical' | 'electric' | 'bass' | 'resonator' | 'ukulele'
  | 'drumkit' | 'edrum' | 'snare' | 'cymbal' | 'cajon' | 'djembe' | 'sticks' | 'drumhead'
  | 'piano' | 'keyboard' | 'organ' | 'stand'
  | 'sax' | 'trumpet' | 'trombone' | 'flute' | 'clarinet' | 'recorder' | 'harmonica'
  | 'violin' | 'cello'
  | 'amp' | 'pedal' | 'multifx' | 'pedalboard' | 'wireless'
  | 'mic' | 'mixer' | 'speaker' | 'headphones' | 'interface' | 'cable'
  | 'strings' | 'picks' | 'strap' | 'bag' | 'case' | 'tuner' | 'capo' | 'care'
  | 'pickup' | 'tuners' | 'bridge' | 'tool' | 'electronics' | 'metronome'

export interface Category {
  id: string
  name: string
  tagline: string
  icon: ArtKind
  hue: number
  children: SubCategory[]
}

export interface SubCategory {
  id: string
  name: string
  parent: string
}

export interface Brand {
  id: string
  name: string
  count: number
  house: boolean
  since?: string
  tagline: string
  story: string
  color: string
}

export interface Variant {
  label: string
  color: string
}

export interface Product {
  id: string
  /** Pad naar de TMA-productfoto (relatief aan imageBase) */
  image?: string
  images?: string[]
  ean?: string
  features?: string[]
  /** Diepste TMA-categorie, bv. "Akoestische drumkits" */
  leaf: string
  /** true = richtprijs (geen dealerprijs bekend) */
  priceEstimated: boolean
  /** TMA-product-URL */
  sourceUrl?: string
  sku: string
  slug: string
  name: string
  brand: string
  series: string
  category: string
  sub: string
  price: number
  oldPrice?: number
  rating: number
  reviews: number
  /** undefined = voorraad onbekend (geen dealerfeed) */
  stock?: number
  isNew: boolean
  kind: ArtKind
  variants: Variant[]
  short: string
  description: string
  specs: [string, string][]
  highlights: string[]
  level: 'Beginner' | 'Gevorderd' | 'Professional'
  addedAt: number
}
