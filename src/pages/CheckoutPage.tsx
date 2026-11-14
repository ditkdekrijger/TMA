import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { productById } from '../data/catalog'
import ProductArt from '../components/ProductArt'
import Icon from '../components/Icon'
import { Empty } from '../components/bits'
import { Summary } from './CartPage'
import { useStore } from '../state/store'
import { deliveryEstimate, money } from '../lib/format'
import { shop } from '../lib/config'
import { useTitle } from '../lib/useTitle'
import { Logo } from '../components/Header'

type Step = 0 | 1 | 2
const STEPS = ['Gegevens', 'Bezorging', 'Betaling']
const PAY = [
  ['ideal', 'iDEAL', 'Direct betalen via je eigen bank'],
  ['bancontact', 'Bancontact', 'Voor klanten in België'],
  ['card', 'Creditcard', 'Visa, Mastercard, American Express'],
  ['paypal', 'PayPal', 'Betaal met je PayPal-account'],
  ['klarna', 'Klarna', 'Achteraf betalen of in 3 termijnen'],
] as const

interface Form { email: string; first: string; last: string; zip: string; nr: string; street: string; city: string; country: 'NL' | 'BE'; phone: string }

export default function CheckoutPage() {
  useTitle('Afrekenen')
  const { cart, total, clear } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState<Step>(0)
  const [f, setF] = useState<Form>({ email: '', first: '', last: '', zip: '', nr: '', street: '', city: '', country: 'NL', phone: '' })
  const [touched, setTouched] = useState(false)
  const [ship, setShip] = useState<'home' | 'pickup' | 'evening'>('home')
  const [pay, setPay] = useState<string>('ideal')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!cart.length) return <div className="wrap page"><Empty title="Er valt nog niets af te rekenen" text="Voeg eerst producten toe aan je winkelwagen." cta={{ label: 'Naar de winkel', to: '/' }} /></div>

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF((x) => ({ ...x, [k]: e.target.value }))
  const zipOk = f.country === 'NL' ? /^\d{4}\s?[A-Za-z]{2}$/.test(f.zip.trim()) : /^\d{4}$/.test(f.zip.trim())
  const errors: Partial<Record<keyof Form, string>> = {
    email: /^\S+@\S+\.\S+$/.test(f.email) ? undefined : 'Vul een geldig e-mailadres in',
    first: f.first.trim() ? undefined : 'Vul je voornaam in',
    last: f.last.trim() ? undefined : 'Vul je achternaam in',
    zip: zipOk ? undefined : f.country === 'NL' ? 'Bijv. 1234 AB' : 'Bijv. 2000',
    nr: f.nr.trim() ? undefined : 'Huisnummer',
    street: f.street.trim() ? undefined : 'Vul je straat in',
    city: f.city.trim() ? undefined : 'Vul je woonplaats in',
  }
  const valid = Object.values(errors).every((x) => !x)
  const err = (k: keyof Form) => (touched && errors[k] ? <span className="err">{errors[k]}</span> : null)
  const inStock = cart.every((l) => productById[l.id].stock > 0)
  const eta = deliveryEstimate(inStock, new Date(), shop.cutoffHour)

  const field = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className={`field ${touched && errors[k] ? 'invalid' : ''}`}>
      <span>{label}</span>
      <input value={f[k]} onChange={set(k)} aria-invalid={!!(touched && errors[k])} {...props} />
      {err(k)}
    </label>
  )

  const placeOrder = () => {
    if (!agree) return
    setBusy(true)
    const order = { nr: `KH${Date.now().toString().slice(-8)}`, total, email: f.email, name: f.first, eta: eta.label, ship, pay, lines: cart.length }
    try { sessionStorage.setItem('kh.lastOrder', JSON.stringify(order)) } catch { /* */ }
    setTimeout(() => { clear(); nav('/bedankt') }, 900)
  }

  return (
    <div className="checkout">
      <header className="checkout-head"><div className="wrap row-between"><Logo /><span className="muted"><Icon name="lock" size={16} /> Beveiligde verbinding</span></div></header>
      <div className="wrap page">
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'on' : i < step ? 'done' : ''}>
              <button disabled={i > step} onClick={() => setStep(i as Step)}><span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span>{s}</button>
            </li>
          ))}
        </ol>
        <div className="checkout-grid">
          <div className="co-main">
            {step === 0 && (
              <form className="co-card" onSubmit={(e) => { e.preventDefault(); setTouched(true); if (valid) setStep(1) }} noValidate>
                <h2>Je gegevens</h2>
                <p className="muted">Al klant? <button type="button" className="link-btn">Log in</button> — of bestel gewoon als gast.</p>
                {field('email', 'E-mailadres', { type: 'email', autoComplete: 'email' })}
                <div className="field-row">{field('first', 'Voornaam', { autoComplete: 'given-name' })}{field('last', 'Achternaam', { autoComplete: 'family-name' })}</div>
                <label className="field"><span>Land</span>
                  <select value={f.country} onChange={set('country')}><option value="NL">Nederland</option><option value="BE">België</option></select>
                </label>
                <div className="field-row">{field('zip', 'Postcode', { autoComplete: 'postal-code' })}{field('nr', 'Huisnummer + toevoeging')}</div>
                <div className="field-row">{field('street', 'Straat', { autoComplete: 'address-line1' })}{field('city', 'Woonplaats', { autoComplete: 'address-level2' })}</div>
                {field('phone', 'Telefoon (optioneel, voor de bezorger)', { type: 'tel', autoComplete: 'tel' })}
                <button className="btn btn-primary btn-lg">Verder naar bezorging <Icon name="chevron" size={18} /></button>
              </form>
            )}
            {step === 1 && (
              <div className="co-card">
                <h2>Bezorging</h2>
                <div className="options">
                  {([
                    ['home', 'Thuisbezorgd', `Verwacht: ${eta.label}`, 'Gratis vanaf € ' + shop.freeShippingFrom],
                    ['evening', 'Avondlevering (18:00 – 22:00)', `Verwacht: ${eta.label}`, '+ € 2,95'],
                    ['pickup', 'Ophalen bij een afhaalpunt', 'Kies een punt bij jou in de buurt', 'Gratis'],
                  ] as const).map(([k, t, d, pr]) => (
                    <label key={k} className={`option ${ship === k ? 'on' : ''}`}>
                      <input type="radio" name="ship" checked={ship === k} onChange={() => setShip(k)} />
                      <span><b>{t}</b><small>{d}</small></span><span className="opt-price">{pr}</span>
                    </label>
                  ))}
                </div>
                <div className="addr-box"><b>Bezorgadres</b><p>{f.first} {f.last}<br />{f.street} {f.nr}<br />{f.zip.toUpperCase()} {f.city}, {f.country === 'NL' ? 'Nederland' : 'België'}</p><button className="link-btn" onClick={() => setStep(0)}>Wijzigen</button></div>
                <div className="row-between"><button className="btn btn-ghost" onClick={() => setStep(0)}>Terug</button><button className="btn btn-primary btn-lg" onClick={() => setStep(2)}>Verder naar betalen <Icon name="chevron" size={18} /></button></div>
              </div>
            )}
            {step === 2 && (
              <div className="co-card">
                <h2>Betaalmethode</h2>
                <div className="options">
                  {PAY.filter(([k]) => f.country === 'BE' || k !== 'bancontact').map(([k, t, d]) => (
                    <label key={k} className={`option ${pay === k ? 'on' : ''}`}>
                      <input type="radio" name="pay" checked={pay === k} onChange={() => setPay(k)} />
                      <span><b>{t}</b><small>{d}</small></span><span className="pay">{t}</span>
                    </label>
                  ))}
                </div>
                <label className="check agree"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Ik ga akkoord met de algemene voorwaarden en het privacybeleid.</label>
                <div className="row-between">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>Terug</button>
                  <button className="btn btn-accent btn-lg" disabled={!agree || busy} onClick={placeOrder}>{busy ? 'Bezig…' : <>Bestelling plaatsen · {money(total)}</>}</button>
                </div>
                <p className="muted small">Dit is een demo-omgeving: er wordt geen echte betaling uitgevoerd.</p>
              </div>
            )}
          </div>
          <Summary>
            <ul className="co-items">
              {cart.map((l) => {
                const p = productById[l.id]
                const v = p.variants.find((x) => x.label === l.variant) ?? p.variants[0]
                return <li key={l.id + l.variant}><span className="mc-art"><ProductArt kind={p.kind} color={v.color} /><i>{l.qty}</i></span><span>{p.name}<small>{v.label}</small></span><b>{money(p.price * l.qty)}</b></li>
              })}
            </ul>
            <Link to="/winkelwagen" className="link-btn">Winkelwagen aanpassen</Link>
          </Summary>
        </div>
      </div>
    </div>
  )
}
