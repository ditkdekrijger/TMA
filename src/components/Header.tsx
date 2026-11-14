import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { brands, categories, productsInSub } from '../data/catalog'
import { shop } from '../lib/config'
import { useStore } from '../state/store'
import Icon from './Icon'
import ProductArt from './ProductArt'
import SearchBox from './SearchBox'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label={`${shop.name} home`}>
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--brand)" />
        <path d="M12 28V12M12 20l9-8M15.5 17l7 11" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        <circle cx="29" cy="25" r="3.4" fill="var(--accent)" /><path d="M32.4 25V12" stroke="var(--accent)" strokeWidth="2.4" />
      </svg>
      <span>{shop.name}</span>
    </Link>
  )
}

export default function Header() {
  const { count, wishlist, compare, setDrawer } = useStore()
  const [mega, setMega] = useState<string | null>(null)
  const [mobile, setMobile] = useState(false)
  const [mobileCat, setMobileCat] = useState<string | null>(null)
  const loc = useLocation()

  useEffect(() => { setMega(null); setMobile(false) }, [loc.pathname, loc.search])
  useEffect(() => { document.body.style.overflow = mobile ? 'hidden' : '' }, [mobile])

  const active = categories.find((c) => c.id === mega)

  return (
    <header className="site-header">
      <div className="usp-bar">
        <div className="wrap usp-inner">
          <span><Icon name="truck" size={16} /> Voor {shop.cutoffHour}:00 besteld, morgen in huis</span>
          <span><Icon name="return" size={16} /> {shop.returnDays} dagen bedenktijd</span>
          <span className="hide-sm"><Icon name="check" size={16} /> Gratis verzending vanaf € {shop.freeShippingFrom}</span>
          <span className="hide-md"><Icon name="store" size={16} /> 16.000+ producten uit het TMA-assortiment</span>
        </div>
      </div>
      <div className="wrap head-main">
        <button className="icon-btn only-mobile" onClick={() => setMobile(true)} aria-label="Menu openen"><Icon name="menu" size={24} /></button>
        <Logo />
        <div className="head-search"><SearchBox /></div>
        <nav className="head-actions" aria-label="Account">
          <Link to="/vergelijk" className="head-action hide-sm" aria-label="Vergelijken">
            <Icon name="compare" size={22} />{compare.length > 0 && <span className="pill">{compare.length}</span>}<span className="ha-label">Vergelijk</span>
          </Link>
          <Link to="/verlanglijst" className="head-action" aria-label="Verlanglijst">
            <Icon name="heart" size={22} />{wishlist.length > 0 && <span className="pill">{wishlist.length}</span>}<span className="ha-label">Verlanglijst</span>
          </Link>
          <button className="head-action" onClick={() => setDrawer(true)} aria-label={`Winkelwagen, ${count} artikelen`}>
            <Icon name="cart" size={22} />{count > 0 && <span className="pill pill-accent">{count}</span>}<span className="ha-label">Winkelwagen</span>
          </button>
        </nav>
      </div>
      <nav className="cat-nav" aria-label="Categorieën" onMouseLeave={() => setMega(null)}>
        <div className="wrap cat-nav-inner">
          {categories.map((c) => (
            <NavLink key={c.id} to={`/c/${c.id}`} className={({ isActive }) => `cat-link ${isActive ? 'active' : ''} ${mega === c.id ? 'hover' : ''}`}
              onMouseEnter={() => setMega(c.id)} onFocus={() => setMega(c.id)}>
              {c.name}
            </NavLink>
          ))}
          <NavLink to="/merken" className="cat-link cat-link-alt" onMouseEnter={() => setMega(null)}>Merken</NavLink>
          <NavLink to="/aanbiedingen" className="cat-link cat-link-sale" onMouseEnter={() => setMega(null)}>Aanbiedingen</NavLink>
        </div>
        {active && (
          <div className="mega" onMouseEnter={() => setMega(active.id)}>
            <div className="wrap mega-inner">
              <div className="mega-cols">
                <h3><Link to={`/c/${active.id}`}>{active.name} <Icon name="chevron" size={16} /></Link></h3>
                <ul>
                  {active.children.map((s) => (
                    <li key={s.id}><Link to={`/c/${active.id}/${s.id}`}>{s.name} <small>{productsInSub(s.id).length}</small></Link></li>
                  ))}
                </ul>
              </div>
              <div className="mega-feature" style={{ ['--h' as string]: active.hue }}>
                <ProductArt kind={active.icon} color={`hsl(${active.hue} 55% 45%)`} />
                <div>
                  <p className="eyebrow">{active.tagline}</p>
                  <Link className="btn btn-light" to={`/c/${active.id}`}>Bekijk alles</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {mobile && (
        <div className="drawer-wrap" onClick={() => setMobile(false)}>
          <aside className="drawer drawer-left" onClick={(e) => e.stopPropagation()} aria-label="Menu">
            <div className="drawer-head"><Logo /><button className="icon-btn" onClick={() => setMobile(false)} aria-label="Sluiten"><Icon name="close" /></button></div>
            <div className="drawer-body">
              <ul className="m-nav">
                {categories.map((c) => (
                  <li key={c.id}>
                    <button className="m-cat" onClick={() => setMobileCat(mobileCat === c.id ? null : c.id)} aria-expanded={mobileCat === c.id}>
                      {c.name}<Icon name="chevronDown" size={16} />
                    </button>
                    {mobileCat === c.id && (
                      <ul className="m-sub">
                        <li><Link to={`/c/${c.id}`}>Alles in {c.name}</Link></li>
                        {c.children.map((s) => <li key={s.id}><Link to={`/c/${c.id}/${s.id}`}>{s.name}</Link></li>)}
                      </ul>
                    )}
                  </li>
                ))}
                <li><Link className="m-cat" to="/merken">Merken ({brands.length})</Link></li>
                <li><Link className="m-cat" to="/aanbiedingen">Aanbiedingen</Link></li>
                <li><Link className="m-cat" to="/keuzehulp">Keuzehulp</Link></li>
                <li><Link className="m-cat" to="/vergelijk">Vergelijken</Link></li>
                <li><Link className="m-cat" to="/service">Klantenservice</Link></li>
              </ul>
            </div>
          </aside>
        </div>
      )}
    </header>
  )
}
