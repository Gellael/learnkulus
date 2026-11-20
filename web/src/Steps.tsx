import type { CSSProperties } from 'react'
import type { Solution } from './api'
import Tex from './Tex'

const TONES: [RegExp, string][] = [
  [/perkalian/i, 'violet'],
  [/hasil bagi/i, 'coral'],
  [/rantai/i, 'sky'],
  [/pangkat/i, 'mint'],
  [/jumlah|selisih|gabung/i, 'pink'],
  [/dasar/i, 'sun'],
  [/definisi|limit|f\(x/i, 'violet'],
  [/jabarkan/i, 'coral'],
  [/sederhanakan|bagi dengan h|tiap suku/i, 'mint'],
]
const tone = (rule: string) => TONES.find(([re]) => re.test(rule))?.[1] ?? 'ink'
const isMerge = (rule: string) => rule.startsWith('Gabungkan:')
const isMarker = (rule: string) => rule.startsWith('Turunan ke')

export default function Steps({ sol }: { sol: Solution }) {
  // parent: kartu induk dari kartu yang menjorok. plan: kartu rencana untuk kartu "Gabungkan".
  const parent: number[] = []
  const plan: number[] = []
  const stack: number[] = []
  const lastAt: number[] = []
  sol.steps.forEach((s, i) => {
    stack.length = s.depth
    parent[i] = s.depth > 0 ? stack[s.depth - 1] : -1
    plan[i] = isMerge(s.rule) ? (lastAt[s.depth] ?? -1) : -1
    stack[s.depth] = i
    lastAt[s.depth] = i
  })

  const route = sol.steps.map((s, i) => ({ s, i })).filter(({ s }) => s.depth === 0 && !isMarker(s.rule))

  return (
    <div className="solution">
      <h3 className="steps-title">Langkah demi langkah</h3>

      {route.length > 1 && (
        <div className="route">
          <p className="route-title">Alur singkat</p>
          <ol>
            {route.map(({ s, i }) => (
              <li key={i}>
                <span className="n">{i + 1}</span>
                {s.rule}
              </li>
            ))}
          </ol>
        </div>
      )}

      <ul className="howto">
        <li><b>Kartu pertama</b> memilih aturan dan memisalkan u dan v.</li>
        <li><b>Kartu yang menjorok</b> mencari turunan u dan v. Kerjakan dulu sebelum lanjut.</li>
        <li><b>Kartu "Gabungkan"</b> memasukkan hasil tadi ke rumus aturannya.</li>
        <li><b>Kartu "Sederhanakan"</b> merapikan bentuk akhir. Nilainya tetap, hanya penampilannya.</li>
      </ul>

      <ol className="steplist">
        {sol.steps.map((s, i) => {
          const merge = isMerge(s.rule)
          return (
            <li key={i} className={`stepcard ${tone(s.rule)}${merge ? ' merge' : ''}`} style={{ '--d': Math.min(s.depth, 3) } as CSSProperties}>
              <div className="stephead">
                <span className="num">{i + 1}</span>
                <span className={`chip ${tone(s.rule)}`}>{s.rule}</span>
                {merge && plan[i] >= 0 && <span className="sub">lanjutan langkah {plan[i] + 1}</span>}
                {!merge && parent[i] >= 0 && <span className="sub">rincian untuk langkah {parent[i] + 1}</span>}
              </div>

              {s.why && (
                <details className="whyd" open={s.depth === 0 || merge}>
                  <summary>Penjelasan</summary>
                  <p className="why">{s.why}</p>
                </details>
              )}

              {s.formula && (
                <div className="formula">
                  <span className="tag">Rumus</span> <Tex tex={s.formula} />
                </div>
              )}
              {s.appliedTo && (
                <div className="muted">
                  Diturunkan: <Tex tex={s.appliedTo} />
                </div>
              )}
              {s.details.length > 0 && (
                <div className="details">
                  {s.details.map((d, j) => (
                    <div key={j} className="detail">
                      <Tex tex={d} />
                    </div>
                  ))}
                </div>
              )}
              {s.result && (
                <div className="partial">
                  Hasil bagian ini: <Tex tex={s.result} />
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="final-label">Semua langkah selesai. Jadi turunannya adalah:</p>
      <p className="answer big">
        <Tex tex={sol.derivative} />
      </p>
    </div>
  )
}
