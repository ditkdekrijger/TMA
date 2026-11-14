import type { ArtKind } from '../data/types'

interface Props {
  kind: ArtKind
  color: string
  accent?: string
  size?: number | string
  className?: string
  title?: string
}

const DARK = '#1c1a17'
const METAL = '#c9ccd1'
const WOOD = '#6b3f22'

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + amt * 255)))
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function Guitar({ c, kind }: { c: string; kind: 'acoustic' | 'classical' | 'resonator' | 'ukulele' }) {
  const s = kind === 'ukulele' ? 0.72 : 1
  return (
    <g transform={`rotate(-28 100 100) translate(${100 - 100 * s} ${100 - 100 * s + (kind === 'ukulele' ? 14 : 0)}) scale(${s})`}>
      <rect x="93" y="8" width="14" height="96" rx="3" fill={WOOD} />
      <rect x="95" y="10" width="10" height="90" fill={shade(WOOD, -0.08)} />
      {[22, 32, 42, 52, 62, 72, 82].map((y) => <rect key={y} x="94" y={y} width="12" height="1.2" fill={METAL} />)}
      <path d="M90 -14 h20 l3 26 h-26z" fill={kind === 'classical' ? WOOD : DARK} />
      {kind === 'classical' && <><rect x="95" y="-10" width="3" height="16" rx="1" fill="#2a1a10" /><rect x="102" y="-10" width="3" height="16" rx="1" fill="#2a1a10" /></>}
      <ellipse cx="100" cy="112" rx="38" ry="32" fill={c} />
      <ellipse cx="100" cy="160" rx="50" ry="42" fill={c} />
      <ellipse cx="100" cy="160" rx="50" ry="42" fill="url(#sheen)" />
      <ellipse cx="100" cy="112" rx="38" ry="32" fill="url(#sheen)" />
      {kind === 'resonator' ? (
        <>
          <circle cx="100" cy="155" r="30" fill={METAL} stroke="#9aa0a7" strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} cx={100 + 20 * Math.cos(i * 0.785)} cy={155 + 20 * Math.sin(i * 0.785)} r="3" fill="#8f959c" />)}
          <circle cx="82" cy="110" r="5" fill={DARK} /><circle cx="118" cy="110" r="5" fill={DARK} />
        </>
      ) : (
        <>
          <circle cx="100" cy="122" r={kind === 'ukulele' ? 15 : 17} fill={DARK} />
          <circle cx="100" cy="122" r={kind === 'ukulele' ? 18 : 21} fill="none" stroke={kind === 'classical' ? '#2f6b47' : shade(c, -0.3)} strokeWidth="3" />
          <rect x="80" y="170" width="40" height="7" rx="2" fill={DARK} />
          {kind === 'acoustic' && <path d="M118 140 q18 6 22 26 q-10 4 -20 -4z" fill={DARK} opacity=".55" />}
        </>
      )}
      {[96, 98, 100, 102, 104].slice(0, kind === 'ukulele' ? 4 : 5).map((x) => <line key={x} x1={x} y1="-6" x2={x} y2="174" stroke="#eee" strokeWidth=".5" opacity=".7" />)}
    </g>
  )
}

function Electric({ c, bass }: { c: string; bass?: boolean }) {
  return (
    <g transform="rotate(-28 100 100)">
      <rect x="94" y={bass ? -16 : 0} width="12" height={bass ? 130 : 112} rx="3" fill="#e2c592" />
      {[14, 24, 34, 44, 54, 64, 74, 84, 94].map((y) => <rect key={y} x="94" y={y + (bass ? -6 : 0)} width="12" height="1" fill={METAL} />)}
      <path d={bass ? 'M92 -36 q14 -6 22 2 l-4 22 h-16z' : 'M92 -22 q14 -6 20 2 l-3 22 h-15z'} fill="#e2c592" />
      <path d="M62 118 C52 96 72 86 84 100 C92 108 108 108 116 98 C128 84 152 96 140 120 C150 140 156 170 132 184 C112 196 88 196 68 184 C44 170 52 140 62 118Z" fill={c} />
      <path d="M62 118 C52 96 72 86 84 100 C92 108 108 108 116 98 C128 84 152 96 140 120 C150 140 156 170 132 184 C112 196 88 196 68 184 C44 170 52 140 62 118Z" fill="url(#sheen)" />
      <path d="M76 120 C72 110 82 104 92 112 L112 112 C120 104 132 110 126 124 L130 170 L74 170Z" fill="#f4efe6" opacity=".9" />
      {(bass ? [128, 148] : [122, 138, 154]).map((y) => <rect key={y} x="86" y={y} width="28" height={bass ? 9 : 6} rx="3" fill={DARK} />)}
      <rect x="86" y="164" width="28" height="6" rx="1" fill={METAL} />
      {[0, 1, 2].map((i) => <circle key={i} cx={120 + i * 6} cy={176 - i * 6} r="3.2" fill={METAL} />)}
      {[96, 98, 100, 102, 104].slice(0, bass ? 4 : 6).map((x) => <line key={x} x1={x} y1={bass ? -30 : -16} x2={x} y2="166" stroke="#eee" strokeWidth=".5" />)}
    </g>
  )
}

function ViolinBody({ c, cello }: { c: string; cello?: boolean }) {
  return (
    <g transform={cello ? 'translate(0 0)' : 'rotate(-25 100 100)'}>
      <rect x="95" y="6" width="10" height="80" rx="3" fill={DARK} />
      <path d="M93 4 q7 -14 14 0" fill={WOOD} stroke={WOOD} strokeWidth="5" />
      <path d="M100 58 C78 58 70 68 72 84 C74 96 82 98 80 108 C78 118 66 122 66 146 C66 176 84 190 100 190 C116 190 134 176 134 146 C134 122 122 118 120 108 C118 98 126 96 128 84 C130 68 122 58 100 58Z" fill={c} />
      <path d="M100 58 C78 58 70 68 72 84 C74 96 82 98 80 108 C78 118 66 122 66 146 C66 176 84 190 100 190 C116 190 134 176 134 146 C134 122 122 118 120 108 C118 98 126 96 128 84 C130 68 122 58 100 58Z" fill="url(#sheen)" />
      <path d="M84 120 q-4 12 2 26" stroke={DARK} strokeWidth="2.4" fill="none" /><path d="M116 120 q4 12 -2 26" stroke={DARK} strokeWidth="2.4" fill="none" />
      <rect x="94" y="134" width="12" height="3" fill="#e2c592" />
      <path d="M94 160 l6 26 l6 -26z" fill={DARK} />
      {[97, 99, 101, 103].map((x) => <line key={x} x1={x} y1="8" x2={x} y2="164" stroke="#eee" strokeWidth=".5" />)}
      {cello && <rect x="99" y="188" width="2" height="12" fill={METAL} />}
    </g>
  )
}

function Keys({ c, x = 20, y = 92, w = 160, h = 38, n = 22 }: { c: string; x?: number; y?: number; w?: number; h?: number; n?: number }) {
  const kw = w / n
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => <rect key={i} x={x + i * kw} y={y} width={kw - 0.8} height={h} rx="1" fill="#fbfaf6" />)}
      {Array.from({ length: n - 1 }).map((_, i) => [0, 1, 3, 4, 5].includes(i % 7) ? <rect key={i} x={x + (i + 1) * kw - kw * 0.3} y={y} width={kw * 0.6} height={h * 0.6} rx="1" fill={c === '#f1ede4' ? DARK : '#111'} /> : null)}
    </g>
  )
}

export default function ProductArt({ kind, color, accent, size = '100%', className, title }: Props) {
  const c = color
  const a = accent ?? shade(color, -0.25)
  let body: JSX.Element
  switch (kind) {
    case 'acoustic': case 'classical': case 'resonator': case 'ukulele':
      body = <Guitar c={c} kind={kind} />; break
    case 'electric': body = <Electric c={c} />; break
    case 'bass': body = <Electric c={c} bass />; break
    case 'violin': body = <ViolinBody c={c} />; break
    case 'cello': body = <g transform="translate(20 0) scale(.8 1)"><ViolinBody c={c} cello /></g>; break
    case 'drumkit': body = (
      <g>
        <ellipse cx="44" cy="58" rx="30" ry="6" fill="#d8b24a" /><line x1="44" y1="58" x2="44" y2="170" stroke={METAL} strokeWidth="2" />
        <ellipse cx="160" cy="48" rx="34" ry="6" fill="#d8b24a" /><line x1="160" y1="48" x2="160" y2="170" stroke={METAL} strokeWidth="2" />
        <circle cx="100" cy="132" r="44" fill={c} /><circle cx="100" cy="132" r="36" fill="#f4efe6" /><circle cx="100" cy="132" r="36" fill="url(#sheen)" />
        <text x="100" y="138" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontSize="13" fill={c}>DRUMS</text>
        <rect x="64" y="70" width="30" height="24" rx="4" fill={c} /><rect x="106" y="66" width="34" height="26" rx="4" fill={c} />
        <rect x="140" y="112" width="40" height="44" rx="5" fill={c} /><rect x="22" y="118" width="38" height="18" rx="3" fill={c} />
        <rect x="22" y="118" width="38" height="4" fill={METAL} /><rect x="140" y="112" width="40" height="4" fill={METAL} />
        <path d="M60 176 l-10 14 M140 176 l10 14" stroke={METAL} strokeWidth="3" />
      </g>); break
    case 'edrum': body = (
      <g>
        <path d="M30 70 h140 M40 70 v110 M160 70 v110 M30 120 h140" stroke="#555" strokeWidth="5" />
        {[[58, 66, 18], [96, 60, 18], [138, 66, 18], [62, 118, 22], [140, 118, 24]].map(([x, y, r], i) => <g key={i}><ellipse cx={x} cy={y} rx={r} ry={r * 0.35} fill="#2b2b2b" /><ellipse cx={x} cy={y - 2} rx={r - 2} ry={r * 0.3} fill="#4a4d52" /></g>)}
        <ellipse cx="34" cy="44" rx="20" ry="5" fill={DARK} /><ellipse cx="168" cy="40" rx="22" ry="5" fill={DARK} />
        <rect x="84" y="128" width="32" height="40" rx="5" fill={DARK} /><circle cx="100" cy="148" r="11" fill="#555" />
        <rect x="88" y="92" width="24" height="16" rx="2" fill={c === '#1f1f22' ? '#d1202f' : c} /><rect x="91" y="95" width="12" height="6" fill="#9be7ff" />
      </g>); break
    case 'snare': body = (
      <g>
        <ellipse cx="100" cy="80" rx="64" ry="20" fill="#f4efe6" stroke={METAL} strokeWidth="3" />
        <path d="M36 80 v54 a64 20 0 0 0 128 0 v-54 a64 20 0 0 1 -128 0z" fill={c} />
        <path d="M36 80 v54 a64 20 0 0 0 128 0 v-54 a64 20 0 0 1 -128 0z" fill="url(#sheen)" />
        {[50, 75, 100, 125, 150].map((x) => <rect key={x} x={x - 3} y="88" width="6" height="44" rx="2" fill={METAL} />)}
      </g>); break
    case 'cymbal': body = (
      <g>
        <ellipse cx="100" cy="104" rx="80" ry="26" fill={c} /><ellipse cx="100" cy="104" rx="80" ry="26" fill="url(#sheen)" />
        {[66, 52, 38, 24].map((r) => <ellipse key={r} cx="100" cy="104" rx={r} ry={r * 0.32} fill="none" stroke={shade(c, -0.15)} strokeWidth=".8" />)}
        <ellipse cx="100" cy="98" rx="14" ry="6" fill={shade(c, -0.1)} /><line x1="100" y1="92" x2="100" y2="180" stroke={METAL} strokeWidth="3" />
      </g>); break
    case 'cajon': body = (
      <g>
        <path d="M60 40 l70 -10 l20 10 v140 l-20 10 l-70 -6z" fill={shade(c, -0.15)} />
        <path d="M60 40 h70 v150 h-70z" fill={c} /><path d="M60 40 h70 v150 h-70z" fill="url(#sheen)" />
        <circle cx="140" cy="100" r="8" fill={DARK} opacity=".8" />
        <rect x="64" y="44" width="62" height="142" fill="none" stroke={shade(c, -0.2)} strokeWidth="1.5" />
      </g>); break
    case 'djembe': body = (
      <g>
        <ellipse cx="100" cy="40" rx="48" ry="12" fill="#efe1c4" />
        <path d="M52 40 q4 50 34 74 q-20 40 -14 70 h56 q6 -30 -14 -70 q30 -24 34 -74z" fill={c} />
        <path d="M52 40 q4 50 34 74 q-20 40 -14 70 h56 q6 -30 -14 -70 q30 -24 34 -74z" fill="url(#sheen)" />
        {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={56 + i * 11} y1="44" x2={86 + i * 3.5} y2="112" stroke="#e7d7b5" strokeWidth="1.2" />)}
      </g>); break
    case 'sticks': body = (
      <g>
        <path d="M40 176 L160 26" stroke={c} strokeWidth="10" strokeLinecap="round" /><ellipse cx="160" cy="26" rx="6" ry="8" transform="rotate(38 160 26)" fill={shade(c, 0.05)} />
        <path d="M64 184 L174 46" stroke={shade(c, -0.08)} strokeWidth="10" strokeLinecap="round" /><ellipse cx="174" cy="46" rx="6" ry="8" transform="rotate(38 174 46)" fill={c} />
        <path d="M40 176 L80 126" stroke={DARK} strokeWidth="10" strokeLinecap="round" opacity=".25" />
      </g>); break
    case 'drumhead': body = (
      <g><circle cx="100" cy="100" r="76" fill={METAL} /><circle cx="100" cy="100" r="68" fill="#f6f3ec" /><circle cx="100" cy="100" r="68" fill="url(#sheen)" />
        <text x="100" y="106" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="16" fontWeight="700" fill="#555">COATED</text></g>); break
    case 'piano': body = (
      <g>
        <rect x="24" y="40" width="152" height="70" rx="6" fill={c} /><rect x="24" y="40" width="152" height="70" rx="6" fill="url(#sheen)" />
        <rect x="20" y="104" width="160" height="12" rx="3" fill={shade(c, -0.15)} />
        <Keys c={c} x={26} y={110} w={148} h={22} n={26} />
        <rect x="20" y="132" width="160" height="8" rx="2" fill={c} />
        <rect x="30" y="140" width="10" height="48" fill={c} /><rect x="160" y="140" width="10" height="48" fill={c} />
        <rect x="88" y="176" width="24" height="6" rx="2" fill={c === '#1f1f22' ? '#c9a23b' : '#888'} />
      </g>); break
    case 'keyboard': body = (
      <g>
        <rect x="10" y="70" width="180" height="70" rx="8" fill={c} /><rect x="10" y="70" width="180" height="70" rx="8" fill="url(#sheen)" />
        <Keys c={c} x={18} y={100} w={164} h={34} n={24} />
        {[30, 44, 58].map((x) => <circle key={x} cx={x} cy="84" r="4" fill="#888" />)}
        <rect x="80" y="78" width="40" height="12" rx="2" fill="#123" /><rect x="84" y="81" width="18" height="6" fill="#4fd" opacity=".7" />
        {[140, 150, 160, 170].map((x) => <rect key={x} x={x} y="80" width="6" height="10" rx="1" fill={a} />)}
      </g>); break
    case 'organ': body = (
      <g>
        <rect x="10" y="64" width="180" height="80" rx="6" fill={c} /><rect x="10" y="64" width="180" height="80" rx="6" fill="url(#sheen)" />
        {Array.from({ length: 9 }).map((_, i) => <g key={i}><rect x={50 + i * 11} y={52 - (i % 3) * 4} width="6" height={30} fill={['#5a2c1a', '#5a2c1a', '#f4efe6', '#f4efe6', '#111', '#f4efe6', '#111', '#111', '#f4efe6'][i]} /></g>)}
        <Keys c={c} x={18} y={106} w={164} h={32} n={24} />
      </g>); break
    case 'stand': body = (
      <g stroke={c === '#1f1f22' ? '#2d2d33' : c} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M50 180 L150 70 M150 180 L50 70" /><path d="M36 70 h48 M116 70 h48" strokeWidth="5" />
        <circle cx="100" cy="125" r="6" fill="#555" stroke="none" />
      </g>); break
    case 'sax': body = (
      <g transform="rotate(10 100 100)">
        <path d="M86 16 q-4 -8 6 -10 l14 2 v8 q-8 2 -10 10 l6 110 q2 30 26 34 q26 2 30 -26 l-2 -20 h22 q2 36 -12 54 q-24 24 -58 4 q-20 -14 -22 -48z" fill={c} />
        <path d="M86 16 q-4 -8 6 -10 l14 2 v8 q-8 2 -10 10 l6 110 q2 30 26 34 q26 2 30 -26 l-2 -20 h22 q2 36 -12 54 q-24 24 -58 4 q-20 -14 -22 -48z" fill="url(#sheen)" />
        <ellipse cx="164" cy="117" rx="12" ry="4" fill={shade(c, -0.35)} />
        {[40, 56, 72, 88, 104, 120].map((y) => <circle key={y} cx="104" cy={y} r="5" fill={shade(c, 0.15)} stroke={shade(c, -0.3)} />)}
        <rect x="84" y="2" width="12" height="10" rx="3" fill={DARK} />
      </g>); break
    case 'trumpet': body = (
      <g transform="rotate(-12 100 100)">
        <path d="M18 104 h120 M30 104 v-26 h96 v26 M44 104 v20 h80" stroke={c} strokeWidth="8" fill="none" strokeLinejoin="round" />
        <path d="M136 92 q24 -4 46 -20 v64 q-22 -16 -46 -20z" fill={c} />
        <path d="M136 92 q24 -4 46 -20 v64 q-22 -16 -46 -20z" fill="url(#sheen)" />
        {[78, 92, 106].map((x) => <g key={x}><rect x={x - 5} y="70" width="10" height="44" rx="3" fill={shade(c, -0.1)} /><rect x={x - 6} y="62" width="12" height="8" rx="3" fill={shade(c, 0.1)} /></g>)}
        <rect x="8" y="100" width="14" height="8" rx="3" fill={METAL} />
      </g>); break
    case 'trombone': body = (
      <g transform="rotate(-10 100 100)">
        <path d="M14 112 h130 M14 92 h130 q14 0 14 10 q0 10 -14 10" stroke={c} strokeWidth="6" fill="none" />
        <path d="M60 92 v-24 h60" stroke={c} strokeWidth="6" fill="none" />
        <path d="M118 68 q30 -6 60 -32 v74 q-30 -26 -60 -32z" fill={c} /><path d="M118 68 q30 -6 60 -32 v74 q-30 -26 -60 -32z" fill="url(#sheen)" />
      </g>); break
    case 'flute': case 'clarinet': case 'recorder': {
      const isFl = kind === 'flute'
      body = (
        <g transform={isFl ? 'rotate(-30 100 100)' : 'rotate(28 100 100)'}>
          {isFl
            ? <><rect x="10" y="94" width="180" height="12" rx="6" fill={c} /><rect x="10" y="94" width="180" height="12" rx="6" fill="url(#sheen)" /><ellipse cx="34" cy="94" rx="6" ry="3" fill={DARK} />
                {[70, 84, 98, 112, 126, 140, 154].map((x) => <circle key={x} cx={x} cy="96" r="5" fill={shade(c, 0.1)} stroke={shade(c, -0.3)} />)}</>
            : <><path d={`M96 8 h8 l${kind === 'recorder' ? 2 : 3} 170 q${kind === 'clarinet' ? 14 : 4} 4 ${kind === 'clarinet' ? 14 : 4} 14 h-${kind === 'clarinet' ? 42 : 24} q0 -10 ${kind === 'clarinet' ? 14 : 4} -14z`} fill={c} />
                <path d={`M96 8 h8 l3 170 q14 4 14 14 h-42 q0 -10 14 -14z`} fill="url(#sheen)" opacity={kind === 'clarinet' ? 1 : 0} />
                {[40, 58, 76, 94, 112, 130, 148].map((y) => <circle key={y} cx="100" cy={y} r="3.5" fill={kind === 'clarinet' ? METAL : DARK} />)}
                {kind === 'clarinet' && [50, 86, 122].map((y) => <rect key={y} x="94" y={y} width="12" height="2" fill={METAL} />)}</>}
        </g>)
      break
    }
    case 'harmonica': body = (
      <g>
        <rect x="24" y="74" width="152" height="52" rx="6" fill={c} /><rect x="24" y="74" width="152" height="52" rx="6" fill="url(#sheen)" />
        <rect x="24" y="94" width="152" height="14" fill="#2a2a2a" />
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={32 + i * 14.4} y="97" width="9" height="8" rx="1" fill="#000" />)}
      </g>); break
    case 'amp': body = (
      <g>
        <rect x="22" y="40" width="156" height="136" rx="10" fill={c} /><rect x="22" y="40" width="156" height="136" rx="10" fill="url(#sheen)" />
        <rect x="32" y="50" width="136" height="26" rx="4" fill={c === '#1f1f22' ? '#33363c' : shade(c, -0.25)} />
        {[46, 62, 78, 94, 110, 126, 142].map((x) => <circle key={x} cx={x} cy="63" r="5" fill="#ddd" />)}
        <rect x="32" y="84" width="136" height="82" rx="6" fill="#26272b" />
        <pattern id="grille" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6 L6 0" stroke="#3a3c42" strokeWidth="1.2" /></pattern>
        <rect x="32" y="84" width="136" height="82" rx="6" fill="url(#grille)" />
        <text x="100" y="132" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="12" fill="#d1202f" letterSpacing="2">AMP</text>
      </g>); break
    case 'pedal': body = (
      <g>
        <rect x="56" y="34" width="88" height="140" rx="10" fill={c} /><rect x="56" y="34" width="88" height="140" rx="10" fill="url(#sheen)" />
        {[76, 100, 124].map((x) => <g key={x}><circle cx={x} cy="60" r="10" fill={DARK} /><line x1={x} y1="60" x2={x} y2="52" stroke="#fff" strokeWidth="2" /></g>)}
        <circle cx="100" cy="88" r="4" fill="#ff3b3b" />
        <rect x="68" y="104" width="64" height="20" rx="3" fill="#fff" opacity=".9" />
        <circle cx="100" cy="150" r="12" fill={METAL} /><circle cx="100" cy="150" r="7" fill="#9ba0a6" />
      </g>); break
    case 'multifx': body = (
      <g>
        <path d="M14 70 h172 l-8 100 h-156z" fill={DARK} /><rect x="24" y="78" width="152" height="40" rx="4" fill="#2b2d32" />
        <rect x="70" y="84" width="60" height="26" rx="2" fill="#0b2a3a" /><rect x="74" y="88" width="40" height="6" fill="#4fd" opacity=".7" />
        {[36, 52, 148, 164].map((x) => <circle key={x} cx={x} cy="98" r="6" fill="#666" />)}
        {[40, 76, 112, 148].map((x) => <g key={x}><circle cx={x + 6} cy="148" r="9" fill={METAL} /><circle cx={x + 6} cy="130" r="3" fill={c === '#1f1f22' ? '#d1202f' : c} /></g>)}
      </g>); break
    case 'pedalboard': body = (
      <g>
        <path d="M14 140 l18 -70 h136 l18 70z" fill="#33363c" />
        {[36, 72, 108, 140].map((x, i) => <rect key={x} x={x} y="84" width="28" height="44" rx="4" fill={['#d1202f', '#1f4e9a', '#2f6b47', '#e0712c'][i]} />)}
        <path d="M14 140 h172 v12 h-172z" fill="#222" />
      </g>); break
    case 'wireless': body = (
      <g>
        {[60, 130].map((x) => <g key={x}><rect x={x - 22} y="70" width="44" height="74" rx="10" fill={c} /><rect x={x - 22} y="70" width="44" height="74" rx="10" fill="url(#sheen)" />
          <rect x={x - 8} y="144" width="16" height="22" rx="3" fill={METAL} /><circle cx={x} cy="90" r="4" fill="#3bd16f" />
          <rect x={x - 14} y="104" width="28" height="12" rx="2" fill="#123" /></g>)}
      </g>); break
    case 'mic': body = (
      <g transform="rotate(-35 100 100)">
        <circle cx="100" cy="52" r="30" fill="#b9bcc2" />
        <pattern id="mesh" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1" fill="#7d828a" /></pattern>
        <circle cx="100" cy="52" r="30" fill="url(#mesh)" />
        <path d="M76 74 h48 l-10 110 h-28z" fill={c} /><path d="M76 74 h48 l-10 110 h-28z" fill="url(#sheen)" />
        <rect x="74" y="74" width="52" height="8" rx="3" fill={METAL} />
      </g>); break
    case 'mixer': body = (
      <g>
        <path d="M14 160 l14 -100 h144 l14 100z" fill={c} /><path d="M14 160 l14 -100 h144 l14 100z" fill="url(#sheen)" />
        {Array.from({ length: 8 }).map((_, i) => <g key={i}>
          {[72, 86, 100].map((y) => <circle key={y} cx={40 + i * 16} cy={y} r="4" fill={['#d1202f', '#e8b931', '#1f4e9a'][(y - 72) / 14]} />)}
          <rect x={38 + i * 16} y="112" width="4" height="38" fill="#111" /><rect x={34 + i * 16} y={124 + (i % 3) * 6} width="12" height="7" rx="1" fill="#ddd" /></g>)}
      </g>); break
    case 'speaker': body = (
      <g>
        <path d="M44 20 h112 l10 160 h-132z" fill={c} /><path d="M44 20 h112 l10 160 h-132z" fill="url(#sheen)" />
        <circle cx="100" cy="122" r="42" fill="#2a2b30" /><circle cx="100" cy="122" r="30" fill="#3a3c42" /><circle cx="100" cy="122" r="12" fill="#1a1a1d" />
        <path d="M74 44 h52 l-6 22 h-40z" fill="#2a2b30" />
      </g>); break
    case 'headphones': body = (
      <g>
        <path d="M44 120 v-20 a56 56 0 0 1 112 0 v20" fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" />
        <rect x="26" y="104" width="40" height="66" rx="16" fill={c} /><rect x="134" y="104" width="40" height="66" rx="16" fill={c} />
        <rect x="26" y="104" width="40" height="66" rx="16" fill="url(#sheen)" /><rect x="134" y="104" width="40" height="66" rx="16" fill="url(#sheen)" />
      </g>); break
    case 'interface': body = (
      <g>
        <rect x="24" y="72" width="152" height="64" rx="10" fill={c} /><rect x="24" y="72" width="152" height="64" rx="10" fill="url(#sheen)" />
        <circle cx="62" cy="104" r="14" fill={DARK} /><circle cx="62" cy="104" r="14" fill="none" stroke="#3bd16f" strokeWidth="3" strokeDasharray="40 60" />
        <circle cx="102" cy="104" r="14" fill={DARK} /><circle cx="148" cy="104" r="18" fill="#2b2d32" stroke={METAL} strokeWidth="2" />
      </g>); break
    case 'cable': body = (
      <g fill="none" stroke={c} strokeWidth="7" strokeLinecap="round">
        {[0, 1, 2, 3].map((i) => <ellipse key={i} cx={100 + i * 4} cy={104 - i * 3} rx={58 - i * 5} ry={40 - i * 3} />)}
        <path d="M150 90 l26 -40" /><rect x="170" y="30" width="12" height="26" rx="3" fill={METAL} stroke="none" transform="rotate(34 176 43)" />
        <path d="M50 120 l-26 40" /><rect x="14" y="152" width="12" height="26" rx="3" fill={METAL} stroke="none" transform="rotate(34 20 165)" />
      </g>); break
    case 'strings': body = (
      <g>
        <rect x="40" y="30" width="120" height="140" rx="8" fill={c} /><rect x="40" y="30" width="120" height="140" rx="8" fill="url(#sheen)" />
        <rect x="52" y="44" width="96" height="56" rx="4" fill="#fff" opacity=".92" />
        <circle cx="100" cy="134" r="22" fill="none" stroke="#fff" strokeWidth="2" />
        <circle cx="100" cy="134" r="16" fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 2" />
        {[56, 64, 72, 80, 88].map((y) => <rect key={y} x="60" y={y} width={y === 56 ? 54 : 80} height={y === 56 ? 6 : 3} rx="1" fill={y === 56 ? c : '#999'} />)}
      </g>); break
    case 'picks': body = (
      <g>
        {[[70, 90, -20, c], [118, 84, 18, shade(c, 0.15)], [94, 128, 4, shade(c, -0.15)]].map(([x, y, r, col], i) => (
          <path key={i} d="M0 -32 C22 -32 34 -18 26 4 C18 24 6 34 0 34 C-6 34 -18 24 -26 4 C-34 -18 -22 -32 0 -32Z" fill={col as string} transform={`translate(${x} ${y}) rotate(${r})`} />
        ))}
      </g>); break
    case 'strap': body = (
      <g>
        <path d="M30 40 C70 70 60 130 100 150 C140 170 160 140 176 160" stroke={c} strokeWidth="26" fill="none" strokeLinecap="round" />
        <path d="M30 40 C70 70 60 130 100 150 C140 170 160 140 176 160" stroke={shade(c, 0.2)} strokeWidth="2" strokeDasharray="4 4" fill="none" />
        <rect x="16" y="26" width="24" height="24" rx="5" fill={shade(c, -0.3)} transform="rotate(30 28 38)" />
      </g>); break
    case 'bag': body = (
      <g>
        <path d="M100 8 q16 0 16 14 v40 q32 8 32 50 q0 34 -14 52 q14 30 -34 30 q-48 0 -34 -30 q-14 -18 -14 -52 q0 -42 32 -50 v-40 q0 -14 16 -14z" fill={c} />
        <path d="M100 8 q16 0 16 14 v40 q32 8 32 50 q0 34 -14 52 q14 30 -34 30 q-48 0 -34 -30 q-14 -18 -14 -52 q0 -42 32 -50 v-40 q0 -14 16 -14z" fill="url(#sheen)" />
        <rect x="76" y="120" width="48" height="50" rx="8" fill={shade(c, -0.15)} /><path d="M70 30 v170" stroke={shade(c, 0.2)} strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity=".6" />
      </g>); break
    case 'case': body = (
      <g>
        <path d="M100 6 q18 0 18 14 v38 q38 8 38 54 q0 36 -14 50 q14 34 -42 34 q-56 0 -42 -34 q-14 -14 -14 -50 q0 -46 38 -54 v-38 q0 -14 18 -14z" fill={c} />
        <path d="M100 6 q18 0 18 14 v38 q38 8 38 54 q0 36 -14 50 q14 34 -42 34 q-56 0 -42 -34 q-14 -14 -14 -50 q0 -46 38 -54 v-38 q0 -14 18 -14z" fill="url(#sheen)" />
        {[70, 110, 150].map((y) => <rect key={y} x="150" y={y} width="10" height="8" rx="1" fill={METAL} />)}
        <rect x="160" y="96" width="10" height="30" rx="4" fill={DARK} />
      </g>); break
    case 'tuner': body = (
      <g>
        <rect x="56" y="44" width="88" height="72" rx="14" fill={c} /><rect x="56" y="44" width="88" height="72" rx="14" fill="url(#sheen)" />
        <rect x="66" y="54" width="68" height="52" rx="6" fill="#0c1116" />
        <text x="100" y="88" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="24" fill="#3bd16f">A</text>
        <path d="M74 98 h52" stroke="#3bd16f" strokeWidth="2" strokeDasharray="2 3" />
        <rect x="90" y="116" width="20" height="34" fill="#555" /><path d="M78 150 h44 l-6 28 h-32z" fill="#333" />
      </g>); break
    case 'capo': body = (
      <g>
        <path d="M40 86 h120 q12 0 12 12 v8 h-144 v-8 q0 -12 12 -12z" fill={c} />
        <path d="M40 86 h120 q12 0 12 12 v8 h-144 v-8 q0 -12 12 -12z" fill="url(#sheen)" />
        <rect x="36" y="106" width="128" height="8" fill="#222" />
        <path d="M164 96 q24 0 24 30 v24 l-16 6" stroke={c} strokeWidth="10" fill="none" strokeLinecap="round" />
      </g>); break
    case 'care': body = (
      <g>
        <rect x="70" y="56" width="60" height="124" rx="12" fill={c === '#f1ede4' ? '#e7e2d5' : c} stroke="#ccc" />
        <rect x="88" y="30" width="24" height="28" rx="3" fill="#2f6b47" /><path d="M112 36 h20 v8 h-20z" fill="#2f6b47" />
        <rect x="76" y="94" width="48" height="56" rx="4" fill="#2f6b47" /><text x="100" y="126" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11" fill="#fff">CARE</text>
      </g>); break
    case 'pickup': body = (
      <g>
        <rect x="40" y="76" width="120" height="48" rx="10" fill={c} /><rect x="40" y="76" width="120" height="48" rx="10" fill="url(#sheen)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={58 + i * 17} cy="92" r="5" fill={METAL} />)}
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={58 + i * 17} cy="110" r="5" fill={METAL} />)}
        <path d="M150 124 q10 30 30 40" stroke="#222" strokeWidth="3" fill="none" />
      </g>); break
    case 'tuners': body = (
      <g>
        {[0, 1, 2].map((i) => <g key={i} transform={`translate(${i * 48} 0)`}>
          <rect x="40" y="70" width="26" height="40" rx="5" fill={c} /><rect x="40" y="70" width="26" height="40" rx="5" fill="url(#sheen)" />
          <path d="M53 110 q-16 14 0 46 q16 -32 0 -46z" fill={c} /><circle cx="53" cy="62" r="8" fill={c} /><rect x="49" y="40" width="8" height="24" rx="2" fill={METAL} />
        </g>)}
      </g>); break
    case 'bridge': body = (
      <g>
        <rect x="30" y="90" width="140" height="22" rx="8" fill={c} /><rect x="30" y="90" width="140" height="22" rx="8" fill="url(#sheen)" />
        {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={50 + i * 18} y="80" width="12" height="14" rx="2" fill={shade(c, -0.1)} />)}
        <circle cx="24" cy="101" r="8" fill={METAL} /><circle cx="176" cy="101" r="8" fill={METAL} />
      </g>); break
    case 'electronics': body = (
      <g>
        <circle cx="70" cy="100" r="30" fill={METAL} /><circle cx="70" cy="100" r="12" fill="#888" /><rect x="66" y="40" width="8" height="34" fill="#aaa" />
        {[44, 70, 96].map((x) => <rect key={x} x={x - 3} y="130" width="6" height="30" fill={METAL} />)}
        <rect x="120" y="80" width="56" height="40" rx="4" fill={c} /><rect x="144" y="60" width="8" height="22" fill="#222" />
      </g>); break
    case 'tool': body = (
      <g transform="rotate(-30 100 100)">
        <rect x="40" y="92" width="80" height="16" rx="3" fill={METAL} />
        {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={44 + i * 6.5} y1="92" x2={40 + i * 6.5} y2="108" stroke="#8d939a" strokeWidth="1" />)}
        <rect x="120" y="88" width="60" height="24" rx="10" fill="#24563f" /><rect x="120" y="88" width="60" height="24" rx="10" fill="url(#sheen)" />
      </g>); break
    case 'metronome': body = (
      <g><path d="M70 180 l20 -150 h20 l20 150z" fill={c} /><line x1="100" y1="160" x2="120" y2="50" stroke={METAL} strokeWidth="3" /></g>); break
    default:
      body = <circle cx="100" cy="100" r="60" fill={c} />
  }

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label={title ?? kind}>
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="192" rx="62" ry="5" fill="#000" opacity=".08" />
      {body}
    </svg>
  )
}
