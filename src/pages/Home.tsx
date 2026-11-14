import { Link } from 'react-router-dom'
import { brands, categories, productById, products, productsInCategory, stats } from '../data/catalog'
import ProductArt from '../components/ProductArt'
import Rail from '../components/Rail'
import Icon from '../components/Icon'
import { useStore } from '../state/store'
import { shop } from '../lib/config'

export default function Home() {
  const { recent } = useStore()
  const deals = products.filter((p) => p.oldPrice && p.stock > 0).sort((a, b) => (b.oldPrice! - b.price) / b.oldPrice! - (a.oldPrice! - a.price) / a.oldPrice!).slice(0, 12)
  const fresh = [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.addedAt - a.addedAt).slice(0, 12)
  const INSTRUMENTS = ['gitaren', 'ukuleles', 'drums', 'toetsen', 'blaas', 'strijk', 'versterkers']
  const best = products.filter((p) => INSTRUMENTS.includes(p.category) && p.reviews >= 40).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 12)
  const recentItems = recent.map((id) => productById[id]).filter(Boolean)
  const house = brands.filter((b) => b.house)

  return (
    <>
      <section className="hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{shop.tagline}</p>
            <h1>Vind het instrument dat bij <em>jou</em> past.</h1>
            <p className="lead">Van je eerste ukulele tot een handgebouwde concertgitaar. {stats.brands} topmerken, scherpe prijzen en advies van muzikanten — vandaag besteld, morgen spelen.</p>
            <div className="hero-cta">
              <Link to="/keuzehulp" className="btn btn-accent btn-lg"><Icon name="spark" size={18} /> Start de keuzehulp</Link>
              <Link to="/aanbiedingen" className="btn btn-light btn-lg">Bekijk aanbiedingen</Link>
            </div>
            <ul className="hero-trust">
              <li><b>4,8</b> / 5 klantwaardering</li>
              <li><b>16.000+</b> producten</li>
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
          {categories.map((c) => (
            <Link key={c.id} to={`/c/${c.id}`} className="cat-tile" style={{ ['--h' as string]: c.hue }}>
              <span className="ct-art"><ProductArt kind={c.icon} color={`hsl(${c.hue} 52% 46%)`} /></span>
              <span className="ct-name">{c.name}</span>
              <span className="ct-count">{productsInCategory(c.id).length} producten</span>
            </Link>
          ))}
        </section>

        <Rail title="Toppers in de aanbieding" items={deals} more={{ label: 'Alle aanbiedingen', to: '/aanbiedingen' }} />

        <section className="promo-row">
          <Link to="/c/ukuleles" className="promo promo-a">
            <div><p className="eyebrow">Korala & Richwood</p><h3>Ukulele's vanaf € 39</h3><p>Perfect voor de klas, de camping en de bank.</p><span className="btn btn-light btn-sm">Shop ukulele's</span></div>
            <ProductArt kind="ukulele" color="#e48aa8" />
          </Link>
          <Link to="/c/toetsen/digitale-pianos" className="promo promo-b">
            <div><p className="eyebrow">Medeli & Crumar</p><h3>Speel thuis, zonder de buren te storen</h3><p>Digitale piano's met gewogen toetsen en hoofdtelefoonaansluiting.</p><span className="btn btn-light btn-sm">Ontdek piano's</span></div>
            <ProductArt kind="piano" color="#1f1f22" />
          </Link>
        </section>

        <Rail title="Best beoordeeld" items={best} more={{ label: 'Alles bekijken', to: '/zoeken?q=&sort=rating' }} />

        <section className="house">
          <div className="house-copy">
            <p className="eyebrow">Exclusief via The Music Alliance</p>
            <h2>Huismerken met karakter</h2>
            <p>Merken die samen met duizenden muziekwinkels in heel Europa zijn ontwikkeld. Daardoor krijg je meer instrument voor je geld — met service en onderdelen gegarandeerd.</p>
            <Link to="/merken" className="btn btn-primary">Alle merken</Link>
          </div>
          <div className="house-grid">
            {house.map((b) => (
              <Link key={b.id} to={`/merk/${b.id}`} className="brand-tile" style={{ ['--bc' as string]: b.color }}>
                <span className="bt-name">{b.name}</span><span className="bt-tag">{b.tagline}</span>
              </Link>
            ))}
          </div>
        </section>

        <Rail title="Nieuw binnen" items={fresh} />

        <section className="finder-cta">
          <div>
            <h2>Twijfel je welk instrument je moet kiezen?</h2>
            <p>Beantwoord 4 korte vragen en we stellen een persoonlijk advies samen — met de beste keuze voor jouw niveau en budget.</p>
          </div>
          <Link to="/keuzehulp" className="btn btn-accent btn-lg">Start de keuzehulp <Icon name="chevron" size={18} /></Link>
        </section>

        <section className="usp-grid">
          {[
            ['truck', 'Snel in huis', `Voor ${shop.cutoffHour}:00 besteld, morgen geleverd. Gratis vanaf € ${shop.freeShippingFrom}.`],
            ['return', `${shop.returnDays} dagen bedenktijd`, 'Niet tevreden? Gratis retourneren, zonder gedoe.'],
            ['shield', '2 jaar garantie', 'Op alle instrumenten, met reparatieservice via ons dealernetwerk.'],
            ['chat', 'Advies van muzikanten', 'Onze specialisten spelen zelf. Bel, mail of chat.'],
          ].map(([i, t, d]) => (
            <div key={t} className="usp"><Icon name={i} size={28} /><h3>{t}</h3><p>{d}</p></div>
          ))}
        </section>

        {recentItems.length > 0 && <Rail title="Recent bekeken" items={recentItems} />}
      </div>
    </>
  )
}
