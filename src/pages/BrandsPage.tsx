import { Link } from 'react-router-dom'
import { brands, productsOfBrand } from '../data/catalog'
import { Breadcrumbs } from '../components/bits'
import { useTitle } from '../lib/useTitle'

export default function BrandsPage() {
  useTitle('Merken')
  const sorted = [...brands].sort((a, b) => a.name.localeCompare(b.name))
  const letters = [...new Set(sorted.map((b) => b.name[0].toUpperCase()))]
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Merken' }]} />
      <header className="page-head"><div><h1>Onze merken</h1><p>{brands.length} merken uit het assortiment van The Music Alliance — de grootste distributiecoöperatie voor muziekinstrumenten in Europa.</p></div></header>
      <nav className="az" aria-label="Alfabet">{letters.map((l) => <a key={l} href={`#letter-${l}`}>{l}</a>)}</nav>
      <div className="brand-grid">
        {sorted.map((b, i) => (
          <Link key={b.id} id={i === sorted.findIndex((x) => x.name[0] === b.name[0]) ? `letter-${b.name[0].toUpperCase()}` : undefined}
            to={`/merk/${b.id}`} className="brand-card" style={{ ['--bc' as string]: b.color }}>
            <span className="bc-logo">{b.name}</span>
            <span className="bc-tag">{b.tagline}</span>
            <span className="bc-foot">{productsOfBrand(b.id).length} artikelen {b.house && <span className="badge badge-house">Huismerk</span>}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
