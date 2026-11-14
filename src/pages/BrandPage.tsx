import { useParams } from 'react-router-dom'
import { brandById, productsOfBrand } from '../data/catalog'
import Listing from '../components/Listing'
import { Breadcrumbs } from '../components/bits'
import NotFound from './NotFound'
import { useTitle } from '../lib/useTitle'

export default function BrandPage() {
  const { brand } = useParams()
  const b = brandById[brand ?? '']
  useTitle(b?.name)
  if (!b) return <NotFound />
  const items = productsOfBrand(b.id)
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Merken', to: '/merken' }, { label: b.name }]} />
      <header className="brand-hero" style={{ ['--bc' as string]: b.color }}>
        <div>
          <p className="eyebrow">{b.house ? 'Huismerk van The Music Alliance' : 'Exclusief via The Music Alliance'}</p>
          <h1>{b.name}</h1>
          <p className="lead">{b.tagline}</p>
          <p>{b.story}</p>
        </div>
        <div className="brand-hero-stat"><b>{items.length}</b><span>producten</span></div>
      </header>
      <Listing key={b.id} items={items} hideFacets={['brand']} />
    </div>
  )
}
