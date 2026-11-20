import type { Solution } from './api'
import Tex from './Tex'

export default function Steps({ sol }: { sol: Solution }) {
  return (
    <div className="card">
      <h3 className="steps-title">Penyelesaian langkah demi langkah</h3>
      <ol className="steplist">
        {sol.steps.map((s, i) => (
          <li key={i} className="stepitem" style={{ marginLeft: Math.min(s.depth, 3) * 22 }}>
            <span className="num">{i + 1}</span>
            <div className="step-body">
              <strong>{s.rule}</strong>
              {s.formula && (
                <div>
                  <Tex tex={s.formula} />
                </div>
              )}
              {s.appliedTo && (
                <div className="muted">
                  Diturunkan: <Tex tex={s.appliedTo} />
                </div>
              )}
              {s.details.map((d, j) => (
                <div key={j} className="detail">
                  <Tex tex={d} />
                </div>
              ))}
              {s.result && (
                <div className="partial">
                  Hasil bagian ini: <Tex tex={s.result} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
      <p className="final-label">Jadi turunannya adalah</p>
      <p className="answer">
        <Tex tex={sol.derivative} />
      </p>
    </div>
  )
}
