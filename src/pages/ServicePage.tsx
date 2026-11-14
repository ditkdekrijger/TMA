import { useEffect } from 'react'
import { Breadcrumbs } from '../components/bits'
import Icon from '../components/Icon'
import { shop } from '../lib/config'
import { useTitle } from '../lib/useTitle'

const FAQ: [string, string, string][] = [
  ['verzending', 'Verzending & levering', `Op werkdagen voor ${shop.cutoffHour}:00 besteld (op voorraad) = morgen in huis in Nederland en België. Verzending is gratis vanaf € ${shop.freeShippingFrom}; daaronder rekenen we € ${shop.shippingCost.toFixed(2).replace('.', ',')}. Grote instrumenten zoals drumstellen en digitale piano's worden met een koerier bezorgd.`],
  ['retour', 'Retourneren', `Je hebt ${shop.returnDays} dagen bedenktijd. Retourneren is gratis: meld je retour aan via je account, print het label en lever het pakket in bij een afgiftepunt. Binnen 5 werkdagen na ontvangst storten we het bedrag terug.`],
  ['garantie', 'Garantie & reparatie', 'Op alle instrumenten krijg je minimaal 2 jaar garantie. Dankzij het Europese netwerk van The Music Alliance zijn onderdelen en reparatieservice voor onze merken jarenlang beschikbaar.'],
  ['scholen', 'Muziekscholen, harmonieën & orkesten', 'Voor scholen, verenigingen en orkesten bieden we staffelkortingen, levering op rekening en huurkoopregelingen voor studie-instrumenten. Vraag een offerte aan via de klantenservice.'],
  ['afstellen', 'Gratis afstelservice', 'Gitaren en basgitaren vanaf niveau Gevorderd worden vóór verzending gecontroleerd en afgesteld door onze technici, zodat ze direct prettig spelen.'],
  ['betalen', 'Betalen', 'Betaal veilig met iDEAL, Bancontact, creditcard, PayPal of achteraf met Klarna (ook in 3 termijnen zonder rente).'],
]

export default function ServicePage() {
  useTitle('Klantenservice')
  useEffect(() => {
    const id = location.hash.split('#')[2]
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])
  return (
    <div className="wrap page narrow">
      <Breadcrumbs items={[{ label: 'Klantenservice' }]} />
      <h1>Klantenservice</h1>
      <p className="lead">Onze specialisten zijn zelf muzikant en helpen je graag — met een bestelling, een keuze of een reparatie.</p>
      <div className="contact-cards" id="contact">
        <div><Icon name="chat" size={26} /><h3>Bel ons</h3><p>{shop.phone}<br /><span className="muted">ma-za 9:00 – 18:00</span></p></div>
        <div><Icon name="user" size={26} /><h3>Mail ons</h3><p>{shop.email}<br /><span className="muted">Binnen 24 uur antwoord</span></p></div>
        <div><Icon name="store" size={26} /><h3>Bij een dealer</h3><p>Probeer instrumenten uit bij een van de 4.500+ TMA-verkooppunten.</p></div>
      </div>
      <div className="faq">
        {FAQ.map(([id, q, a]) => (
          <details key={id} id={id} open={typeof location !== 'undefined' && location.hash.endsWith(id)}>
            <summary>{q}<Icon name="chevronDown" size={18} /></summary><p>{a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
