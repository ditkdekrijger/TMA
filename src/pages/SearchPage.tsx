import { useSearchParams } from 'react-router-dom'
import { products, search } from '../data/catalog'
import Listing from '../components/Listing'
import { Breadcrumbs } from '../components/bits'
import { useTitle } from '../lib/useTitle'
import { useMemo } from 'react'

export default function SearchPage() {
  const [sp] = useSearchParams()
  const q = sp.get('q') ?? ''
  useTitle(q ? `Zoeken: ${q}` : 'Alle producten')
  const items = useMemo(() => (q.trim() ? search(q) : products), [q])
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: q ? `Zoeken naar “${q}”` : 'Alle producten' }]} />
      <header className="page-head"><div><h1>{q ? <>Resultaten voor “{q}”</> : 'Alle producten'}</h1><p>{items.length} producten gevonden</p></div></header>
      <Listing key={q} items={items} />
    </div>
  )
}
