import { useState } from 'react'
import { Link } from 'react-router-dom'
import { brands, categories, stats } from '../data/catalog'
import { shop } from '../lib/config'
import Icon from './Icon'
import { Logo } from './Header'

export default function Footer() {
  const [mail, setMail] = useState('')
  const [done, setDone] = useState(false)
  return (
    <footer className="site-footer">
      <div className="newsletter">
        <div className="wrap nl-inner">
          <div>
            <h2>Blijf op de hoogte</h2>
            <p>Nieuwe instrumenten, speeltips en exclusieve acties. Ontvang <b>10% welkomstkorting</b> op je eerste bestelling.</p>
          </div>
          {done ? <p className="nl-done"><Icon name="check" /> Bedankt! Je kortingscode is <b>WELKOM10</b>.</p> : (
            <form className="nl-form" onSubmit={(e) => { e.preventDefault(); if (/^\S+@\S+\.\S+$/.test(mail)) setDone(true) }}>
              <label className="sr-only" htmlFor="nl">E-mailadres</label>
              <input id="nl" type="email" required placeholder="jouw@email.nl" value={mail} onChange={(e) => setMail(e.target.value)} />
              <button className="btn btn-accent">Aanmelden</button>
            </form>
          )}
        </div>
      </div>
      <div className="wrap foot-grid">
        <div className="foot-about">
          <Logo />
          <p>{shop.tagline}. {stats.products}+ instrumenten en accessoires online, en via ons netwerk toegang tot meer dan 16.000 producten van 200+ merken.</p>
          <div className="pay-row" aria-label="Betaalmethoden">
            {['iDEAL', 'Bancontact', 'Visa', 'Mastercard', 'PayPal', 'Klarna'].map((m) => <span key={m} className="pay">{m}</span>)}
          </div>
        </div>
        <div>
          <h3>Assortiment</h3>
          <ul>{categories.map((c) => <li key={c.id}><Link to={`/c/${c.id}`}>{c.name}</Link></li>)}</ul>
        </div>
        <div>
          <h3>Merken</h3>
          <ul>{brands.slice(0, 10).map((b) => <li key={b.id}><Link to={`/merk/${b.id}`}>{b.name}</Link></li>)}<li><Link to="/merken">Alle merken</Link></li></ul>
        </div>
        <div>
          <h3>Service</h3>
          <ul>
            <li><Link to="/keuzehulp">Keuzehulp</Link></li>
            <li><Link to="/service#verzending">Verzending & levering</Link></li>
            <li><Link to="/service#retour">Retourneren</Link></li>
            <li><Link to="/service#garantie">Garantie & reparatie</Link></li>
            <li><Link to="/service#scholen">Muziekscholen & orkesten</Link></li>
            <li><Link to="/service#contact">Contact</Link></li>
          </ul>
          <p className="foot-contact"><Icon name="chat" size={16} /> {shop.phone}<br />ma-za 9:00 – 18:00</p>
        </div>
      </div>
      <div className="foot-bottom">
        <div className="wrap">
          <span>© {new Date().getFullYear()} {shop.name}. Alle prijzen incl. btw.</span>
          <span className="muted">Demo-catalogus op basis van de merken en productgroepen van The Music Alliance. Prijzen, voorraad en specificaties zijn indicatief.</span>
        </div>
      </div>
    </footer>
  )
}
