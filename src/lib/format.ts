const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' })
export const money = (n: number) => eur.format(n)
export const priceParts = (n: number) => {
  const [whole, cents] = n.toFixed(2).split('.')
  return { whole: Number(whole).toLocaleString('nl-NL'), cents: cents === '00' ? '-' : cents }
}

const DAYS = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

/** Verwachte bezorgdatum: voor 22:00 besteld = morgen in huis (niet op zondag). */
export function deliveryEstimate(inStock: boolean, now = new Date(), cutoff = 22) {
  const d = new Date(now)
  let add = inStock ? (now.getHours() < cutoff ? 1 : 2) : 7
  d.setDate(d.getDate() + add)
  while (d.getDay() === 0) { d.setDate(d.getDate() + 1); add++ }
  const label = add === 1 ? 'morgen' : `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
  return { date: d, label }
}

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`
