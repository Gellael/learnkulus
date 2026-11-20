import { useState } from 'react'
import { solve, type MethodId, type Solution } from './api'
import Steps from './Steps'
import Tex from './Tex'

const METHODS: { id: MethodId; label: string; desc: string }[] = [
  { id: 'auto', label: 'Aturan turunan', desc: 'Memilih aturan yang sesuai dengan bentuk soal: pangkat, perkalian, hasil bagi, rantai, atau trigonometri.' },
  { id: 'limit', label: 'Definisi limit', desc: 'Memakai definisi f′(x) = lim [f(x+h) − f(x)] / h. Hanya untuk polinomial, misalnya 3x^2 - 5x atau (x+1)^3.' },
  { id: 'expand', label: 'Jabarkan dulu', desc: 'Menjabarkan fungsi menjadi jumlah suku, lalu menurunkan tiap suku dengan aturan pangkat. Hanya untuk polinomial.' },
]
const EXAMPLES = ['3x^4 - 2x^2 + 7', '(x^2+1)(x-3)', 'x/(x^2+4)', 'sin 3x', '7x^2 cos 10x', 'sqrt(x^2+1)']

export default function Solver() {
  const [expr, setExpr] = useState('(x^2+1)(x-3)')
  const [order, setOrder] = useState(1)
  const [method, setMethod] = useState<MethodId>('auto')
  const [sol, setSol] = useState<Solution | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function run(e = expr, m = method) {
    setBusy(true)
    setErr('')
    try {
      setSol(await solve(e, order, m))
    } catch (x) {
      setSol(null)
      setErr((x as Error).message)
    }
    setBusy(false)
  }

  const current = METHODS.find((m) => m.id === method)!

  return (
    <section>
      <h2>Penyelesai turunan</h2>
      <p className="muted">Ketik fungsi, pilih cara penyelesaian sesuai perintah soal, lalu lihat langkahnya.</p>

      <div className="pills" role="group" aria-label="Metode penyelesaian">
        {METHODS.map((m) => (
          <button key={m.id} className={'pill' + (m.id === method ? ' on' : '')} onClick={() => setMethod(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="tip">{current.desc}</p>

      <div className="row">
        <span>f(x) =</span>
        <input value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} />
        <select value={order} onChange={(e) => setOrder(+e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>turunan ke-{n}</option>
          ))}
        </select>
        <button onClick={() => run()} disabled={busy}>{busy ? 'Menghitung...' : 'Hitung'}</button>
      </div>
      <div className="examples">
        <span className="muted">Coba:</span>
        {EXAMPLES.map((x) => (
          <button key={x} className="ex" onClick={() => { setExpr(x); run(x) }}>{x}</button>
        ))}
      </div>

      {err && <p className="error">{err}</p>}
      {sol && (
        <>
          <p className="fx">
            f(x) = <Tex tex={sol.input} />
          </p>
          <Steps sol={sol} />
        </>
      )}
    </section>
  )
}
