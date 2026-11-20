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

export default function Steps({ sol }: { sol: Solution }) {
  return (
    <div className="solution">
      <h3 className="steps-title">Penyelesaian langkah demi langkah</h3>
      <p className="muted">Langkah yang menjorok adalah rincian untuk mencari turunan bagian dalam. Angka seperti “hasil langkah 3” menunjukkan asal nilainya.</p>
      <ol className="steplist">
        {sol.steps.map((s, i) => (
          <li key={i} className={`stepcard ${tone(s.rule)}`} style={{ marginLeft: Math.min(s.depth, 3) * 20 }}>
            <div className="stephead">
              <span className="num">{i + 1}</span>
              <span className={`chip ${tone(s.rule)}`}>{s.rule}</span>
            </div>
            {s.why && <p className="why">{s.why}</p>}
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
        ))}
      </ol>
      <p className="final-label">Jadi turunannya adalah</p>
      <p className="answer big">
        <Tex tex={sol.derivative} />
      </p>
    </div>
  )
}
