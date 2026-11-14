import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { frequentlyBoughtWith, products } from '../data/catalog'
import type { Product } from '../data/types'
import ProductArt from '../components/ProductArt'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'
import { Breadcrumbs } from '../components/bits'
import { money } from '../lib/format'
import { useTitle } from '../lib/useTitle'
import type { ArtKind } from '../data/types'

const INSTR: { id: string; label: string; kind: ArtKind; cats: string[]; subsKid?: string[]; subsAdult?: string[] }[] = [
  { id: 'gitaar', label: 'Gitaar', kind: 'acoustic', cats: ['gitaren'], subsKid: ['klassieke-gitaren'], subsAdult: ['akoestische-gitaren', 'klassieke-gitaren', 'elektrische-gitaren'] },
  { id: 'bas', label: 'Basgitaar', kind: 'bass', cats: ['gitaren'], subsKid: ['basgitaren'], subsAdult: ['basgitaren', 'akoestische-basgitaren'] },
  { id: 'ukulele', label: 'Ukulele', kind: 'ukulele', cats: ['ukuleles'], subsKid: ['sopraan-ukuleles', 'concert-ukuleles'], subsAdult: ['concert-ukuleles', 'tenor-ukuleles', 'bariton-ukuleles', 'guitaleles'] },
  { id: 'drums', label: 'Drums', kind: 'drumkit', cats: ['drums'], subsKid: ['junior-drums', 'elektronische-drums', 'handpercussie'], subsAdult: ['akoestische-drumstellen', 'elektronische-drums', 'handpercussie'] },
  { id: 'piano', label: 'Piano & keys', kind: 'piano', cats: ['toetsen'], subsKid: ['keyboards', 'digitale-pianos'], subsAdult: ['digitale-pianos', 'stage-pianos', 'keyboards', 'orgels-synths'] },
  { id: 'blaas', label: 'Blaasinstrument', kind: 'sax', cats: ['blaas'], subsKid: ['blokfluiten', 'dwarsfluiten', 'klarinetten', 'trompetten'], subsAdult: ['saxofoons', 'trompetten', 'trombones', 'dwarsfluiten', 'klarinetten'] },
  { id: 'strijk', label: 'Viool of cello', kind: 'violin', cats: ['strijk'], subsKid: ['violen', 'cellos'], subsAdult: ['violen', 'altviolen', 'cellos', 'contrabassen'] },
]
const WHO = [['kid-s', 'Kind tot 8 jaar'], ['kid', 'Kind 8 – 12 jaar'], ['adult', 'Tiener of volwassene']] as const
const LEVEL = [['Beginner', 'Ik begin net'], ['Gevorderd', 'Ik speel al een tijdje'], ['Professional', 'Ik speel op hoog niveau']] as const
const BUDGET = [[150, 'Tot € 150'], [400, 'Tot € 400'], [1000, 'Tot € 1.000'], [Infinity, 'Geen limiet']] as const

export default function FinderPage() {
  useTitle('Keuzehulp')
  const [step, setStep] = useState(0)
  const [instr, setInstr] = useState<string | null>(null)
  const [who, setWho] = useState<string | null>(null)
  const [level, setLevel] = useState<Product['level'] | null>(null)
  const [budget, setBudget] = useState<number | null>(null)

  const result = useMemo(() => {
    if (step < 4 || !instr) return null
    const def = INSTR.find((i) => i.id === instr)!
    const subs = who === 'adult' ? def.subsAdult : def.subsKid
    let pool = products.filter((p) => def.cats.includes(p.category) && (!subs || subs.includes(p.sub)) && p.price <= (budget ?? Infinity))
    if (who !== 'adult') {
      const kidHit = pool.filter((p) => /1\/[24]|3\/4|junior|sopraan|7A/i.test(p.name + p.specs.map((s) => s[1]).join(' ')))
      if (kidHit.length >= 2) pool = [...kidHit, ...pool.filter((p) => !kidHit.includes(p))]
    }
    const score = (p: Product) => (p.level === level ? 2 : 0) + p.rating / 5 + (p.stock > 0 ? 0.5 : 0)
    const picks = [...pool].sort((a, b) => score(b) - score(a)).slice(0, 6)
    return { picks, kit: picks[0] ? frequentlyBoughtWith(picks[0], 4) : [] }
  }, [step, instr, who, level, budget])

  const reset = () => { setStep(0); setInstr(null); setWho(null); setLevel(null); setBudget(null) }
  const Q = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
    <div className="quiz-step"><p className="eyebrow">Vraag {n} van 4</p><h2>{title}</h2>{children}</div>
  )
  const choose = <T,>(set: (v: T) => void, v: T) => { set(v); setStep((s) => s + 1) }

  return (
    <div className="wrap page">
      <Breadcrumbs items={[{ label: 'Keuzehulp' }]} />
      <div className="quiz">
        <div className="quiz-progress"><div style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }} /></div>
        {step === 0 && (
          <Q n={1} title="Welk instrument wil je (leren) spelen?">
            <div className="quiz-grid">
              {INSTR.map((i) => (
                <button key={i.id} className={`quiz-opt ${instr === i.id ? 'on' : ''}`} onClick={() => choose(setInstr, i.id)}>
                  <ProductArt kind={i.kind} color="#c26a2e" /><span>{i.label}</span>
                </button>
              ))}
            </div>
          </Q>
        )}
        {step === 1 && <Q n={2} title="Voor wie is het instrument?"><div className="quiz-list">{WHO.map(([k, l]) => <button key={k} className="quiz-opt row" onClick={() => choose(setWho, k)}>{l}<Icon name="chevron" /></button>)}</div></Q>}
        {step === 2 && <Q n={3} title="Wat is het speelniveau?"><div className="quiz-list">{LEVEL.map(([k, l]) => <button key={k} className="quiz-opt row" onClick={() => choose(setLevel, k)}><span><b>{k}</b> — {l}</span><Icon name="chevron" /></button>)}</div></Q>}
        {step === 3 && <Q n={4} title="Wat is je budget?"><div className="quiz-list">{BUDGET.map(([k, l]) => <button key={l} className="quiz-opt row" onClick={() => choose(setBudget, k)}>{l}<Icon name="chevron" /></button>)}</div></Q>}
        {step > 0 && step < 4 && <button className="link-btn" onClick={() => setStep((s) => s - 1)}>← Vorige vraag</button>}

        {result && (
          <div className="quiz-result">
            <p className="eyebrow">Jouw persoonlijke advies</p>
            <h2>{result.picks.length ? `Deze ${result.picks.length} instrumenten passen het best bij jou` : 'Geen exacte match gevonden'}</h2>
            {result.picks.length ? (
              <>
                <div className="grid">{result.picks.map((p) => <ProductCard key={p.id} p={p} />)}</div>
                {result.kit.length > 0 && (
                  <div className="kit">
                    <h3>Handig om erbij te nemen</h3>
                    <ul>{result.kit.map((p) => <li key={p.id}><Link to={`/product/${p.slug}`}>{p.name}</Link> <b>{money(p.price)}</b></li>)}</ul>
                  </div>
                )}
              </>
            ) : <p>Probeer een hoger budget, of neem contact op met onze specialisten voor persoonlijk advies.</p>}
            <button className="btn btn-ghost" onClick={reset}>Opnieuw beginnen</button>
          </div>
        )}
      </div>
    </div>
  )
}
