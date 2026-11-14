import type { Brand, Category, SubCategory } from './types'

import raw from './generated/catalog.json'

interface RawCatalog {
  categories: Category[]
  brands: { id: string; name: string; count: number }[]
}
const data = raw as unknown as RawCatalog

export const categories: Category[] = data.categories

export const subById: Record<string, SubCategory> = Object.fromEntries(
  categories.flatMap((c) => c.children).map((s) => [`${s.parent}/${s.id}`, s]),
)
export const catById: Record<string, Category> = Object.fromEntries(categories.map((c) => [c.id, c]))

/** Redactionele merkinformatie; merken zonder entry krijgen een generieke beschrijving. */
const curated: Omit<Brand, 'count'>[] = [
  { id: 'boston', name: 'Boston', house: true, tagline: 'De complete basis voor elke muzikant',
    story: 'Boston Musical Products is het brede huismerk van The Music Alliance: van stemapparaten en standaards tot studie-instrumenten en onderdelen. Betrouwbare kwaliteit voor een eerlijke prijs, ontwikkeld met feedback van duizenden dealers.',
    color: '#1d4e89' },
  { id: 'richwood', name: 'Richwood', house: true, tagline: 'Vintage karakter, moderne bespeelbaarheid',
    story: 'Richwood bouwt gitaren, resonators en ukuleles met een knipoog naar de klassieke Amerikaanse traditie. Massief hout, traditionele lakken en een speelgevoel dat direct vertrouwd aanvoelt.',
    color: '#7a3e1d' },
  { id: 'korala', name: 'Korala', house: true, tagline: "Ukulele's met een glimlach",
    story: "Korala maakt ukulele's in alle maten en kleuren. Perfect voor de eerste stappen, in de klas en onderweg — goed afgesteld uit de doos.",
    color: '#e0712c' },
  { id: 'salvador-cortez', name: 'Salvador Cortez', house: true, tagline: 'Spaanse traditie, eerlijk geprijsd',
    story: "Salvador Cortez bouwt klassieke en flamencogitaren volgens Spaanse bouwprincipes. Van 1/4-studiemodellen tot massieve concertgitaren — favoriet bij muziekscholen in heel Europa.",
    color: '#9b2335' },
  { id: 'mayson', name: 'Mayson', house: true, tagline: 'Massief hout, warme klank',
    story: 'Mayson richt zich op akoestische gitaren met massieve bovenbladen en zorgvuldig geselecteerde tonewoods, met een warme en open klank.',
    color: '#5b3a29' },
  { id: 'gaucho', name: 'Gaucho', house: true, tagline: 'Banden en tassen met karakter',
    story: 'Gaucho ontwerpt gitaarbanden, gigbags en accessoires van leer, katoen en webbing. Comfortabel, stevig en met oog voor detail.',
    color: '#8c5a2b' },
  { id: 'hayman', name: 'Hayman', house: true, tagline: 'Drums zonder concessies',
    story: 'Hayman is een legendarische drumnaam die opnieuw tot leven is gebracht: complete drumstellen, snares en hardware voor beginners tot gigging drummers.',
    color: '#2b2b2b' },
  { id: 'stewart-ellis', name: 'Stewart Ellis', house: true, tagline: 'Blaasinstrumenten voor elke stap',
    story: 'Stewart Ellis levert saxofoons, trompetten, trombones, fluiten en klarinetten — afgesteld voor leerlingen en harmonieën, met solide mechaniek en een mooie intonatie.',
    color: '#b08d2c' },
  { id: 'nux', name: 'NUX', house: false, tagline: 'Slimme digitale gear',
    story: 'NUX is exclusief verkrijgbaar via The Music Alliance en ontwikkelt effectpedalen, modeling-versterkers, draadloze systemen en elektronische drums met een uitzonderlijke prijs-kwaliteitverhouding.',
    color: '#d1202f' },
  { id: 'medeli', name: 'Medeli', house: false, tagline: 'Toetsen en e-drums voor thuis en podium',
    story: "Medeli bouwt digitale piano's, keyboards en elektronische drumstellen. Exclusief via The Music Alliance, met een groot assortiment voor elk budget.",
    color: '#0f6e7a' },
  { id: 'crumar', name: 'Crumar', house: false, tagline: 'Italiaans design sinds 1970',
    story: "Crumar staat voor stage piano's en drawbar-orgels met een herkenbare Italiaanse signatuur — compact, licht en gemaakt voor het podium.",
    color: '#c43c2a' },
  { id: 'agner', name: 'Agner', house: false, tagline: 'Zwitserse precisie in drumsticks',
    story: 'Agner maakt drumsticks in Zwitserland van zorgvuldig gematchte hickory en esdoorn. Consistent gewicht, perfecte balans.',
    color: '#4a6b2a' },
  { id: 'gatt-audio', name: 'Gatt Audio', house: true, tagline: 'Live geluid dat gewoon werkt',
    story: 'Gatt Audio levert PA-speakers, mengpanelen en microfoons voor bands, scholen, kerken en verhuurders. Robuust, eenvoudig te bedienen en eerlijk geprijsd.',
    color: '#1b1f3b' },
  { id: 'glx', name: 'GLX', house: true, tagline: 'Bescherming voor je instrument',
    story: 'GLX maakt koffers en hardcases die je instrument veilig houden op reis, in de bus en in de bandruimte.',
    color: '#3c3f44' },
  { id: 'rotosound', name: 'Rotosound', house: false, tagline: 'Britse snaren sinds 1958',
    story: 'Rotosound produceert sinds 1958 snaren in Engeland en is via The Music Alliance exclusief verkrijgbaar in de Benelux. De Swing Bass-snaar werd een klassieker.',
    color: '#0a3d91' },
  { id: 'hosco', name: 'Hosco', house: false, tagline: 'Japans luthiergereedschap',
    story: 'Hosco Japan levert precisiegereedschap voor gitaarbouwers en reparateurs: fretvijlen, radiusblokken, meetinstrumenten en meer.',
    color: '#24563f' },
]

const curatedById = Object.fromEntries(curated.map((b) => [b.id, b]))
const palette = ['#1d4e89', '#7a3e1d', '#2f6b47', '#9b2335', '#5b3a29', '#24563f', '#3c3f44', '#0f6e7a', '#8c5a2b', '#4a3b7a']

export const brands: Brand[] = data.brands.map((b, i) => {
  const c = curatedById[b.id]
  return c
    ? { ...c, name: b.name, count: b.count }
    : { id: b.id, name: b.name, count: b.count, house: false, color: palette[i % palette.length],
        tagline: `${b.count} artikelen in het TMA-assortiment`,
        story: `${b.name} is verkrijgbaar via het Europese distributienetwerk van The Music Alliance.` }
})

export const brandById: Record<string, Brand> = Object.fromEntries(brands.map((b) => [b.id, b]))
