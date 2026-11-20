import { useRef, useState } from 'react'
import { solve, type MethodId, type Solution } from './api'
import { scanProblem, type Progress, type ScanResult } from './ocr'
import Steps from './Steps'
import Tex from './Tex'

const METHODS: { id: MethodId; label: string; desc: string }[] = [
  { id: 'auto', label: 'Aturan turunan', desc: 'Jalur utama: aplikasi memilih aturan yang cocok dengan bentuk soal (pangkat, perkalian, hasil bagi, rantai, atau trigonometri) dan menjelaskan kenapa aturan itu dipilih.' },
  { id: 'limit', label: 'Definisi limit', desc: 'Jalur "dari nol": memakai definisi f′(x) = lim [f(x+h) − f(x)] / h, persis seperti saat turunan pertama kali ditemukan. Hanya untuk polinomial, misalnya 3x^2 - 5x atau (x+1)^3.' },
  { id: 'expand', label: 'Jabarkan dulu', desc: 'Jalur "ratakan dulu": fungsi dijabarkan menjadi jumlah suku, lalu tiap suku diturunkan dengan aturan pangkat. Hanya untuk polinomial.' },
]
const EXAMPLES = ['3x^4 - 2x^2 + 7', '(x^2+1)(x-3)', 'x/(x^2+4)', 'sin 3x', '7x^2 cos 10x', 'sqrt(x^2+1)']

export default function Solver() {
  const [expr, setExpr] = useState('(x^2+1)(x-3)')
  const [order, setOrder] = useState(1)
  const [method, setMethod] = useState<MethodId>('auto')
  const [sol, setSol] = useState<Solution | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [reading, setReading] = useState(false)
  const [progress, setProgress] = useState<Progress | null>(null)
  const [scan, setScan] = useState<ScanResult | null>(null)
  const cam = useRef<HTMLInputElement>(null)
  const pick = useRef<HTMLInputElement>(null)

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

  async function onFile(file?: File) {
    if (!file) return
    setErr('')
    setScan(null)
    setSol(null)
    setReading(true)
    setProgress({ label: 'Menyiapkan foto...', value: 0 })
    try {
      const r = await scanProblem(file, setProgress)
      setExpr(r.expr)
      setScan(r)
    } catch (x) {
      setErr((x as Error).message)
    }
    setReading(false)
    setProgress(null)
  }

  const current = METHODS.find((m) => m.id === method)!
  const lowConf = scan !== null && scan.confidence < 60

  return (
    <section>
      <h2>Penyelesai turunan</h2>
      <p className="muted">Ketik fungsi atau foto soalnya, pilih jalur penyelesaian sesuai perintah soal, lalu bedah langkahnya satu per satu.</p>

      <div className="pills" role="group" aria-label="Metode penyelesaian">
        {METHODS.map((m) => (
          <button key={m.id} className={'pill' + (m.id === method ? ' on' : '')} onClick={() => setMethod(m.id)}>
            {m.label}
          </button>
        ))}
      </div>
      <p className="tip">{current.desc}</p>

      <div className="solver-form">
        <label className="inputline">
          <span>f(x) =</span>
          <input value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label="Fungsi f(x)" />
        </label>
        <select value={order} onChange={(e) => setOrder(+e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>turunan ke-{n}</option>
          ))}
        </select>
        <button onClick={() => run()} disabled={busy}>{busy ? 'Menghitung...' : 'Hitung'}</button>
      </div>

      <div className="row photo">
        <button className="ghost" onClick={() => cam.current?.click()} disabled={reading}>Foto dengan kamera</button>
        <button className="ghost" onClick={() => pick.current?.click()} disabled={reading}>Pilih dari galeri</button>
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        <input ref={pick} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
      </div>

      {reading && progress && (
        <div className="scan-progress" role="status" aria-live="polite">
          <span>{progress.label}</span>
          <span className="bar"><span style={{ width: `${Math.round(progress.value * 100)}%` }} /></span>
        </div>
      )}

      {scan && (
        <div className="scanbox">
          <h3>Ini yang terbaca dari fotomu</h3>
          <div className="scan-grid">
            <img src={scan.seen} alt="Foto setelah dibuat hitam-putih, seperti yang dilihat pembaca" />
            <div>
              <p className="muted">Teks mentah dari pembaca:</p>
              <p className="rawtext">{scan.raw || '(kosong)'}</p>
              <p className="muted">Sudah dimasukkan ke kolom f(x) di atas:</p>
              <p className="rawtext good">{scan.expr}</p>
            </div>
          </div>
          {scan.fixes.length > 0 && (
            <>
              <p className="muted">Perapian otomatis yang saya lakukan:</p>
              <ul className="fixes">
                {scan.fixes.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </>
          )}
          {scan.alternatives.length > 0 && (
            <div className="alts">
              <span className="muted">Kalau hasil di atas keliru, coba salah satu tebakan lain ini:</span>
              {scan.alternatives.map((a) => (
                <button key={a} className="ex" onClick={() => setExpr(a)}>{a}</button>
              ))}
            </div>
          )}
          <p className="tip">
            {lowConf ? 'Pembacanya kurang yakin dengan foto ini. ' : ''}
            Pembaca teks ini tidak mengerti matematika, jadi pangkat kecil (x²) sering terbaca sebagai angka biasa dan tanda minus kadang keliru. Periksa kolom f(x), perbaiki kalau perlu, baru klik Hitung.
          </p>
        </div>
      )}

      {!scan && !reading && (
        <p className="muted">Tips foto: dekatkan kamera ke satu soal saja, pakai cahaya terang, dan hindari bayangan. Tulisan cetak jauh lebih mudah dibaca daripada tulisan tangan.</p>
      )}

      <div className="examples">
        <span className="muted">Coba:</span>
        {EXAMPLES.map((x) => (
          <button key={x} className="ex" onClick={() => { setExpr(x); setScan(null); run(x) }}>{x}</button>
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
