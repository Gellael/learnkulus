import { useState } from 'react'
import { solve, type Solution } from './api'
import Steps from './Steps'
import Tex from './Tex'

export default function Solver() {
  const [expr, setExpr] = useState('x^2 cos x')
  const [order, setOrder] = useState(1)
  const [sol, setSol] = useState<Solution | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    setErr('')
    try {
      setSol(await solve(expr, order))
    } catch (e) {
      setSol(null)
      setErr((e as Error).message)
    }
    setBusy(false)
  }

  return (
    <section>
      <h2>Penyelesai turunan</h2>
      <div className="row">
        <span>f(x) =</span>
        <input value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
        <select value={order} onChange={(e) => setOrder(+e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>turunan ke-{n}</option>
          ))}
        </select>
        <button onClick={run} disabled={busy}>Hitung</button>
      </div>
      <p className="muted">Contoh: 3x^4 - 2x^2, sin 3x, (x^2+1)/(x-1), sqrt(x^2+1), x^2 cos x</p>
      {err && <p className="error">{err}</p>}
      {sol && (
        <>
          <p>
            f(x) = <Tex tex={sol.input} />
          </p>
          <Steps sol={sol} />
        </>
      )}
    </section>
  )
}
