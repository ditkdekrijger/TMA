import { Link, useParams } from 'react-router-dom'
import { catById, productsInCategory, productsInSub, subById, subKey } from '../data/catalog'
import Listing from '../components/Listing'
import { Breadcrumbs } from '../components/bits'
import NotFound from './NotFound'
import ProductArt from '../components/ProductArt'
import ProductImage from '../components/ProductImage'
import { useTitle } from '../lib/useTitle'

export default function CategoryPage() {
  const { cat, sub } = useParams()
  const c = catById[cat ?? '']
  const s = sub ? subById[`${cat}/${sub}`] : undefined
  useTitle(s?.name ?? c?.name)
  if (!c || (sub && (!s || s.parent !== c.id))) return <NotFound />
  const items = s ? productsInSub(subKey(s)) : productsInCategory(c.id)
  const cover = items.find((p) => p.image)
  return (
    <div className="wrap page">
      <Breadcrumbs items={s ? [{ label: c.name, to: `/c/${c.id}` }, { label: s.name }] : [{ label: c.name }]} />
      <header className="page-head cat-head" style={{ ['--h' as string]: c.hue }}>
        <div>
          <h1>{s ? s.name : c.name}</h1>
          <p>{s ? `${items.length.toLocaleString('nl-NL')} artikelen in ${s.name.toLowerCase()}.` : `${c.tagline}. Ontdek ${items.length.toLocaleString('nl-NL')} artikelen van ${new Set(items.map((p) => p.brand)).size} merken.`}</p>
        </div>
        <span className="cat-head-art">{cover ? <ProductImage p={cover} size={300} /> : <ProductArt kind={c.icon} color={`hsl(${c.hue} 52% 46%)`} />}</span>
      </header>
      <nav className="sub-chips" aria-label="Subcategorieën">
        <Link to={`/c/${c.id}`} className={`chip ${!s ? 'chip-on' : ''}`}>Alles</Link>
        {c.children.map((x) => <Link key={x.id} to={`/c/${c.id}/${x.id}`} className={`chip ${s?.id === x.id ? 'chip-on' : ''}`}>{x.name} <small>{productsInSub(subKey(x)).length}</small></Link>)}
      </nav>
      <Listing key={s?.id ?? c.id} items={items} hideFacets={s ? ['sub'] : []} />
    </div>
  )
}
