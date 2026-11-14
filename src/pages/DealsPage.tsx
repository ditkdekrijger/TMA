import { products } from '../data/catalog'
import Listing from '../components/Listing'
import { Breadcrumbs } from '../components/bits'
import { useTitle } from '../lib/useTitle'

const deals = products.filter((p) => p.oldPrice)

export default function DealsPage() {
  useTitle('Aanbiedingen')
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Aanbiedingen' }]} />
      <header className="page-head deals-head"><div><p className="eyebrow">Zolang de voorraad strekt</p><h1>Aanbiedingen</h1><p>{deals.length} instrumenten en accessoires met korting tot {Math.max(...deals.map((p) => Math.round((1 - p.price / p.oldPrice!) * 100)))}%.</p></div></header>
      <Listing items={deals} />
    </div>
  )
}
