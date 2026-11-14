import { products } from '../data/catalog'
import Listing from '../components/Listing'
import { Breadcrumbs } from '../components/bits'
import { useTitle } from '../lib/useTitle'

const fresh = products.filter((p) => p.isNew)

export default function NewPage() {
  useTitle('Nieuw binnen')
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Nieuw binnen' }]} />
      <header className="page-head deals-head"><div><p className="eyebrow">Vers uit de TMA-catalogus</p><h1>Nieuw binnen</h1><p>{fresh.length.toLocaleString('nl-NL')} nieuwe instrumenten, accessoires en onderdelen.</p></div></header>
      <Listing items={fresh} />
    </div>
  )
}
