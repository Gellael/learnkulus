import type { Solution } from './api'
import Tex from './Tex'

export default function Steps({ sol }: { sol: Solution }) {
  return (
    <div className="card">
      <p>Hasil:</p>
      <Tex block tex={`${sol.derivative}`} />
      <details>
        <summary>Lihat langkah ({sol.steps.length})</summary>
        <ol>
          {sol.steps.map((s, i) => (
            <li key={i}>
              <strong>{s.rule}</strong>
              {s.formula && (
                <div>
                  <Tex tex={s.formula} />
                </div>
              )}
              <div className="muted">
                pada: <Tex tex={s.appliedTo} />
              </div>
            </li>
          ))}
        </ol>
      </details>
    </div>
  )
}
