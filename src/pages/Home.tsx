import { Link } from 'react-router-dom'
import { brands, catalogMeta, categories, productById, products, productsInCategory, productsOfBrand, stats } from '../data/catalog'
import ProductArt from '../components/ProductArt'
import ProductImage from '../components/ProductImage'
import Rail from '../components/Rail'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { shop } from '../lib/config'

const withImg = (list: typeof products) => list.filter((p) => p.image)
const spread = (list: typeof products, n: number, key: (p: (typeof products)[number]) => string = (p) => p.leaf) => {
  // verspreid over productgroepen voor een gevarieerde rail
  const seen = new Set<string>(); const out: typeof products = []
  for (const p of list) { const k = key(p); if (!seen.has(k)) { seen.add(k); out.push(p) } if (out.length >= n) break }
  return out.length >= n ? out : [...out, ...list.filter((p) => !out.includes(p))].slice(0, n)
}

export default function Home() {
  const { recent } = useStore()
  const fresh = spread(withImg(products.filter((p) => p.isNew)).sort((a, b) => b.addedAt - a.addedAt), 12)
  const instruments = spread(withImg(['gitaren', 'folk', 'blaas', 'strijk', 'drums'].flatMap((c) => productsInCategory(c)))
    .filter((p) => p.price > 120 && !/onderdelen|koffers|tassen|accessoires/i.test(p.sub)).sort((a, b) => b.addedAt - a.addedAt), 12, (p) => `${p.category}:${p.leaf.replace(/^\d\/\d\s*/, '')}`)
  const accessories = spread(withImg(productsInCategory('accessoires')).sort((a, b) => b.addedAt - a.addedAt), 12)
  const recentItems = recent.map((id) => productById[id]).filter(Boolean)
  const house = brands.filter((b) => b.house && b.count > 0)
  const topBrands = brands.filter((b) => !b.house).slice(0, 12)
  const cover = (catId: string) => withImg(productsInCategory(catId)).sort((a, b) => b.price - a.price)[0]

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{shop.tagline}</p>
            <h1>Vind het instrument dat bij <em>jou</em> past.</h1>
            <p className="lead">{stats.products.toLocaleString('nl-NL')} instrumenten, accessoires en onderdelen van {stats.brands} merken — rechtstreeks uit de catalogus van The Music Alliance. Vandaag besteld, snel in huis.</p>
            <div className="hero-cta">
              <Link to="/keuzehulp" className="btn btn-accent btn-lg"><Icon name="spark" size={18} /> Start de keuzehulp</Link>
              <Link to="/nieuw" className="btn btn-light btn-lg">Nieuw binnen</Link>
            </div>
            <ul className="hero-trust">
              <li><b>{stats.products.toLocaleString('nl-NL')}</b> artikelen</li>
              <li><b>{stats.brands}</b> merken</li>
              <li><b>{shop.returnDays} dagen</b> bedenktijd</li>
            </ul>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="ha ha-1"><ProductArt kind="acoustic" color="#d9a66b" /></div>
            <div className="ha ha-2"><ProductArt kind="ukulele" color="#2bb3b1" /></div>
            <div className="ha ha-3"><ProductArt kind="sax" color="#c9a23b" /></div>
            <div className="ha ha-4"><ProductArt kind="pedal" color="#d1202f" /></div>
          </div>
        </div>
      </section>

      <div className="wrap">
        <section className="cat-tiles" aria-label="Categorieën">
          {categories.map((c) => {
            const p = cover(c.id)
            return (
              <Link key={c.id} to={`/c/${c.id}`} className="cat-tile" style={{ ['--h' as string]: c.hue }}>
                <span className="ct-art">{p ? <ProductImage p={p} size={240} /> : <ProductArt kind={c.icon} color={`hsl(${c.hue} 52% 46%)`} />}</span>
                <span className="ct-name">{c.name}</span>
                <span className="ct-count">{productsInCategory(c.id).length.toLocaleString('nl-NL')} artikelen</span>
              </Link>
            )
          })}
        </section>

        <Rail title="Nieuw binnen bij TMA" items={fresh} more={{ label: 'Alle nieuwe producten', to: '/nieuw' }} />

        <section className="promo-row">
          <Link to="/c/folk/ukuleles" className="promo promo-a">
            <div><p className="eyebrow">Korala, Richwood & meer</p><h3>Ukulele's voor iedereen</h3><p>Sopraan, concert, tenor en bariton — perfect voor de klas en de bank.</p><span className="btn btn-light btn-sm">Shop ukulele's</span></div>
            <ProductArt kind="ukulele" color="#e48aa8" />
          </Link>
          <Link to="/c/blaas" className="promo promo-b">
            <div><p className="eyebrow">Stewart Ellis & meer</p><h3>Klaar voor de harmonie</h3><p>Saxofoons, trompetten, klarinetten en fluiten, met alle accessoires.</p><span className="btn btn-light btn-sm">Ontdek blaasinstrumenten</span></div>
            <ProductArt kind="sax" color="#c9a23b" />
          </Link>
        </section>

        <Rail title="Instrumenten in de spotlight" items={instruments} />

        {house.length > 0 && (
          <section className="house">
            <div className="house-copy">
              <p className="eyebrow">Exclusief via The Music Alliance</p>
              <h2>Huismerken met karakter</h2>
              <p>Merken die samen met duizenden muziekwinkels in heel Europa zijn ontwikkeld. Daardoor krijg je meer instrument voor je geld — met service en onderdelen gegarandeerd.</p>
              <Link to="/merken" className="btn btn-primary">Alle {stats.brands} merken</Link>
            </div>
            <div className="house-grid">
              {house.map((b) => (
                <Link key={b.id} to={`/merk/${b.id}`} className="brand-tile" style={{ ['--bc' as string]: b.color }}>
                  <span className="bt-name">{b.name}</span><span className="bt-tag">{productsOfBrand(b.id).length} artikelen</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <Rail title="Gitaaraccessoires" items={accessories} more={{ label: 'Alle accessoires', to: '/c/accessoires' }} />

        <section className="brand-strip" aria-label="Topmerken">
          {topBrands.map((b) => <Link key={b.id} to={`/merk/${b.id}`} className="chip">{b.name} <small>{b.count}</small></Link>)}
          <Link to="/merken" className="chip chip-on">Alle merken</Link>
        </section>

        <section className="finder-cta">
          <div>
            <h2>Twijfel je welk instrument je moet kiezen?</h2>
            <p>Beantwoord 3 korte vragen en we stellen een persoonlijk advies samen — passend bij jouw niveau en budget.</p>
          </div>
          <Link to="/keuzehulp" className="btn btn-accent btn-lg">Start de keuzehulp <Icon name="chevron" size={18} /></Link>
        </section>

        <section className="usp-grid">
          {[
            ['truck', 'Snel in huis', `Gratis verzending vanaf € ${shop.freeShippingFrom}.`],
            ['return', `${shop.returnDays} dagen bedenktijd`, 'Niet tevreden? Gratis retourneren, zonder gedoe.'],
            ['shield', '2 jaar garantie', 'Met service en onderdelen via het Europese TMA-netwerk.'],
            ['chat', 'Advies van muzikanten', 'Onze specialisten spelen zelf. Bel, mail of chat.'],
          ].map(([i, t, d]) => (
            <div key={t} className="usp"><Icon name={i} size={28} /><h3>{t}</h3><p>{d}</p></div>
          ))}
        </section>

        {recentItems.length > 0 && <Rail title="Recent bekeken" items={recentItems} />}
        <p className="muted small center-text">Catalogus bijgewerkt op {new Date(catalogMeta.scrapedAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
      </div>
    </>
  )
}
