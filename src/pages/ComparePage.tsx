import { Link } from 'react-router-dom'
import { brandById, productById } from '../data/catalog'
import ProductImage from '../components/ProductImage'
import Icon from '../components/Icon'
import { Breadcrumbs, Empty, Price, StockLine } from '../components/bits'
import { useStore } from '../state/store'
import { useTitle } from '../lib/useTitle'

export default function ComparePage() {
  useTitle('Vergelijken')
  const { compare, toggleCompare, add } = useStore()
  const items = compare.map((id) => productById[id]).filter(Boolean)
  if (!items.length) return <div className="wrap page"><Empty title="Nog niets om te vergelijken" text="Vink ‘Vergelijk’ aan bij maximaal 4 producten om ze naast elkaar te zetten." cta={{ label: 'Naar de winkel', to: '/' }} /></div>
  const keys = [...new Set(items.flatMap((p) => p.specs.map(([k]) => k)))].filter((k) => k !== 'Merk')
  const val = (id: string, k: string) => productById[id].specs.find(([x]) => x === k)?.[1] ?? '—'
  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Vergelijken' }]} />
      <h1>Producten vergelijken</h1>
      <div className="compare-scroll">
        <table className="compare">
          <thead>
            <tr><th />{items.map((p) => (
              <th key={p.id}>
                <button className="icon-btn cmp-x" onClick={() => toggleCompare(p.id)} aria-label="Verwijder"><Icon name="close" size={16} /></button>
                <Link to={`/product/${p.slug}`} className="cmp-art"><ProductImage p={p} size={300} /></Link>
                <Link to={`/product/${p.slug}`} className="cmp-name">{p.name}</Link>
                <Price value={p.price} old={p.oldPrice} />
                <button className="btn btn-primary btn-sm" onClick={() => add(p.id, p.variants[0].label)}>In winkelwagen</button>
              </th>))}</tr>
          </thead>
          <tbody>
            <tr><th>Merk</th>{items.map((p) => <td key={p.id}>{brandById[p.brand]?.name}</td>)}</tr>
            <tr><th>Omschrijving</th>{items.map((p) => <td key={p.id}>{p.description}</td>)}</tr>
            <tr><th>Levering</th>{items.map((p) => <td key={p.id}><StockLine p={p} /></td>)}</tr>
            <tr><th>Niveau</th>{items.map((p) => <td key={p.id}>{p.level}</td>)}</tr>
            {keys.map((k) => {
              const vals = items.map((p) => val(p.id, k))
              const differs = new Set(vals).size > 1
              return <tr key={k} className={differs ? 'diff' : ''}><th>{k}</th>{items.map((p, i) => <td key={p.id}>{vals[i]}</td>)}</tr>
            })}
          </tbody>
        </table>
      </div>
      <p className="muted small">Gemarkeerde rijen geven verschillen aan.</p>
    </div>
  )
}
