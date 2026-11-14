import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { frequentlyBoughtWith, products } from '../data/catalog'
import type { ArtKind, Product } from '../data/types'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import { Breadcrumbs } from '../components/bits'
import { money } from '../lib/format'
import { useTitle } from '../lib/useTitle'

const INSTR: { id: string; label: string; kind: ArtKind; leaf: RegExp }[] = [
  { id: 'gitaar', label: 'Gitaar', kind: 'acoustic', leaf: /akoestische gitaren|klassieke gitaren|concertgitaren|studiegitaren|resonator/i },
  { id: 'ukulele', label: 'Ukulele', kind: 'ukulele', leaf: /ukulele/i },
  { id: 'folk', label: 'Banjo of mandoline', kind: 'acoustic', leaf: /banjo|mandolin/i },
  { id: 'drums', label: 'Drums', kind: 'drumkit', leaf: /drumkits|kinderdrums|elektronische drums|cajons/i },
  { id: 'blaas', label: 'Blaasinstrument', kind: 'sax', leaf: /saxofoon|trompet|klarinet|dwarsfluit|trombone|blokfluit|bugel|hoorn/i },
  { id: 'strijk', label: 'Viool of cello', kind: 'violin', leaf: /^violen|altviolen|cello's|contrabassen|viool|cello$/i },
  { id: 'mondharmonica', label: 'Mondharmonica', kind: 'harmonica', leaf: /mondharmonica|bluesharp|melodica/i },
]
const WHO = [['kid', 'Een kind (tot 12 jaar)'], ['adult', 'Tiener of volwassene']] as const
const BUDGET = [[0, 100, 'Tot € 100'], [100, 300, '€ 100 – 300'], [300, 800, '€ 300 – 800'], [800, Infinity, 'Vanaf € 800']] as const
const INSTRUMENT_CATS = ['gitaren', 'folk', 'drums', 'blaas', 'strijk']
const KID = /1\/2|1\/4|1\/8|3\/4|junior|kinder|sopraan|kids|child/i

export default function FinderPage() {
  useTitle('Keuzehulp')
  const [step, setStep] = useState(0)
  const [instr, setInstr] = useState<string | null>(null)
  const [who, setWho] = useState<string | null>(null)
  const [budget, setBudget] = useState<number | null>(null)

  const counts = useMemo(() => Object.fromEntries(INSTR.map((i) => [i.id, products.filter((p) => i.leaf.test(p.leaf) && INSTRUMENT_CATS.includes(p.category) && !/accessoires|onderdelen|koffers|tassen|snaren|strijkstokken|toebehoren|gereedschap/.test(p.sub)).length])), [])

  const result = useMemo(() => {
    if (step < 3 || !instr || budget === null) return null
    const def = INSTR.find((i) => i.id === instr)!
    const [lo, hi] = BUDGET[budget]
    let pool = products.filter((p) => def.leaf.test(p.leaf) && INSTRUMENT_CATS.includes(p.category) && !/accessoires|onderdelen|koffers|tassen|snaren|strijkstokken|toebehoren|gereedschap/.test(p.sub))
    const inBudget = pool.filter((p) => p.price >= lo && p.price < hi)
    pool = inBudget.length ? inBudget : pool
    const score = (p: Product) =>
      (who === 'kid' ? (KID.test(`${p.name} ${p.description} ${p.leaf}`) ? 3 : 0) : (KID.test(`${p.name} ${p.description}`) ? -2 : 0)) +
      (p.image ? 1 : 0) + (p.isNew ? 0.3 : 0) - Math.abs(p.price - (lo + Math.min(hi, lo * 2 + 200)) / 2) / 1000
    const picks = [...pool].sort((a, b) => score(b) - score(a)).slice(0, 8)
    return { picks, exact: inBudget.length > 0, kit: picks[0] ? frequentlyBoughtWith(picks[0], 4) : [] }
  }, [step, instr, who, budget])

  const reset = () => { setStep(0); setInstr(null); setWho(null); setBudget(null) }
  const Q = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <div className="quiz-step"><p className="eyebrow">Vraag {n} van 3</p><h2>{title}</h2>{children}</div>
  )
  const choose = <T,>(set: (v: T) => void, v: T) => { set(v); setStep((s) => s + 1) }

  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Keuzehulp' }]} />
      <div className="quiz">
        <div className="quiz-progress"><div style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }} /></div>
        {step === 0 && (
          <Q n={1} title="Welk instrument wil je (leren) spelen?">
            <div className="quiz-grid">
              {INSTR.filter((i) => counts[i.id] > 0).map((i) => (
                <button key={i.id} className={`quiz-opt ${instr === i.id ? 'on' : ''}`} onClick={() => choose(setInstr, i.id)}>
                  <ProductArt kind={i.kind} color="#c26a2e" /><span>{i.label}</span><small className="muted">{counts[i.id]} modellen</small>
                </button>
              ))}
            </div>
          </Q>
        )}
        {step === 1 && <Q n={2} title="Voor wie is het instrument?"><div className="quiz-list">{WHO.map(([k, l]) => <button key={k} className="quiz-opt row" onClick={() => choose(setWho, k)}>{l}<Icon name="chevron" /></button>)}</div></Q>}
        {step === 2 && <Q n={3} title="Wat is je budget?"><div className="quiz-list">{BUDGET.map(([, , l], i) => <button key={l} className="quiz-opt row" onClick={() => choose(setBudget, i)}>{l}<Icon name="chevron" /></button>)}</div></Q>}
        {step > 0 && step < 3 && <button className="link-btn" onClick={() => setStep((s) => s - 1)}>← Vorige vraag</button>}

        {result && (
          <div className="quiz-result">
            <p className="eyebrow">Jouw persoonlijke advies</p>
            <h2>{result.exact ? `Deze ${result.picks.length} passen het best bij jou` : 'Niets binnen dit budget — dit komt het dichtst in de buurt'}</h2>
            <div className="grid">{result.picks.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            {result.kit.length > 0 && (
              <div className="kit">
                <h3>Handig om erbij te nemen</h3>
                <ul>{result.kit.map((p) => <li key={p.id}><Link to={`/product/${p.slug}`}>{p.name}</Link> <b>{money(p.price)}</b></li>)}</ul>
              </div>
            )}
            <button className="btn btn-ghost" onClick={reset}>Opnieuw beginnen</button>
          </div>
        )}
      </div>
    </div>
  )
}
