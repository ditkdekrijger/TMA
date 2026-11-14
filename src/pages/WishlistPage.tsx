import { productById } from '../data/catalog'
import ProductCard from '../components/ProductCard'
import { Breadcrumbs, Empty } from '../components/bits'
import { useStore } from '../state/store'
import { money } from '../lib/format'
import { useTitle } from '../lib/useTitle'

export default function WishlistPage() {
  useTitle('Verlanglijst')
  const { wishlist, add, toast } = useStore()
  const items = wishlist.map((id) => productById[id]).filter(Boolean)
  const share = async () => {
    const url = `${location.origin}${location.pathname}#/verlanglijst`
    try { await navigator.clipboard.writeText(url); toast('Link gekopieerd — deel hem met familie of vrienden') } catch { toast('Kopiëren lukte niet') }
  }
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Verlanglijst' }]} />
      <header className="page-head"><div><h1>Mijn verlanglijst</h1><p>{items.length} producten · totaal {money(items.reduce((s, p) => s + p.price, 0))}</p></div>
        {items.length > 0 && <div className="row-gap"><button className="btn btn-ghost" onClick={share}>Deel lijst</button><button className="btn btn-primary" onClick={() => items.forEach((p) => (p.stock ?? 1) > 0 && add(p.id, p.variants[0].label))}>Alles in winkelwagen</button></div>}
      </header>
      {items.length ? <div className="grid">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        : <Empty title="Je verlanglijst is nog leeg" text="Klik op het hartje bij een product om het te bewaren voor later — handig voor je verjaardag of Sinterklaas!" cta={{ label: 'Ontdek producten', to: '/' }} />}
    </div>
  )
}
