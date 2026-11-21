import { useEffect, useRef, useState } from 'react'
import { solve, type MethodId, type Solution } from './api'
import { useI18n } from './i18n'
import { ScanError, scanProblem, type Progress, type ScanResult } from './ocr'
import Steps from './Steps'
import Tex from './Tex'

const METHODS: MethodId[] = ['auto', 'limit', 'expand']
const EXAMPLES = ['3x^4 - 2x^2 + 7', '(x^2+1)(x-3)', 'x/(x^2+4)', 'sin 3x', '7x^2 cos 10x', 'sqrt(x^2+1)']

export default function Solver() {
  const { lang, t } = useI18n()
  const [expr, setExpr] = useState('(x^2+1)(x-3)')
  const [order, setOrder] = useState(1)
  const [method, setMethod] = useState<MethodId>('auto')
  const [sol, setSol] = useState<Solution | null>(null)
  // Masukan yang menghasilkan `sol`, supaya pembahasan bisa dihitung ulang saat bahasa berganti.
  const [ran, setRan] = useState<{ e: string; o: number; m: MethodId } | null>(null)
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
      setRan({ e, o: order, m })
    } catch (x) {
      setSol(null)
      setErr((x as Error).message)
    }
    setBusy(false)
  }

  // Bahasa berganti: hitung ulang pembahasan dalam bahasa baru.
  useEffect(() => {
    if (!sol || !ran) return
    let off = false
    solve(ran.e, ran.o, ran.m)
      .then((s) => {
        if (!off) setSol(s)
      })
      .catch(() => {})
    return () => {
      off = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  async function onFile(file?: File) {
    if (!file) return
    setErr('')
    setScan(null)
    setSol(null)
    setReading(true)
    setProgress({ key: 'preparing', value: 0 })
    try {
      const r = await scanProblem(file, setProgress)
      setExpr(r.expr)
      setScan(r)
    } catch (x) {
      setErr(x instanceof ScanError ? t(x.key) : (x as Error).message)
    }
    setReading(false)
    setProgress(null)
  }

  const lowConf = scan !== null && scan.confidence < 60

  return (
    <section>
      <h2>{t('solver.title')}</h2>
      <p className="muted">{t('solver.intro')}</p>

      <div className="pills" role="group" aria-label={t('solver.methodsAria')}>
        {METHODS.map((m) => (
          <button key={m} className={'pill' + (m === method ? ' on' : '')} onClick={() => setMethod(m)}>
            {t(`method.${m}.label`)}
          </button>
        ))}
      </div>
      <p className="tip">{t(`method.${method}.desc`)}</p>

      <div className="solver-form">
        <label className="inputline">
          <span>{t('solver.fx')}</span>
          <input value={expr} onChange={(e) => setExpr(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()} aria-label={t('solver.fxAria')} />
        </label>
        <select value={order} onChange={(e) => setOrder(+e.target.value)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{t('solver.order', { n })}</option>
          ))}
        </select>
        <button onClick={() => run()} disabled={busy}>{busy ? t('solver.computing') : t('solver.compute')}</button>
      </div>

      <div className="row photo">
        <button className="ghost" onClick={() => cam.current?.click()} disabled={reading}>{t('solver.camera')}</button>
        <button className="ghost" onClick={() => pick.current?.click()} disabled={reading}>{t('solver.gallery')}</button>
        <input ref={cam} type="file" accept="image/*" capture="environment" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
        <input ref={pick} type="file" accept="image/*" hidden onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = '' }} />
      </div>

      {reading && progress && (
        <div className="scan-progress" role="status" aria-live="polite">
          <span>{t(`progress.${progress.key}`)}</span>
          <span className="bar"><span style={{ width: `${Math.round(progress.value * 100)}%` }} /></span>
        </div>
      )}

      {scan && (
        <div className="scanbox">
          <h3>{t('scan.title')}</h3>
          <div className="scan-grid">
            <img src={scan.seen} alt={t('scan.seenAlt')} />
            <div>
              <p className="muted">{t('scan.raw')}</p>
              <p className="rawtext">{scan.raw || t('scan.empty')}</p>
              <p className="muted">{t('scan.into')}</p>
              <p className="rawtext good">{scan.expr}</p>
            </div>
          </div>
          {scan.fixes.length > 0 && (
            <>
              <p className="muted">{t('scan.fixes')}</p>
              <ul className="fixes">
                {scan.fixes.map((f) => <li key={f}>{t(`fix.${f}`)}</li>)}
              </ul>
            </>
          )}
          {scan.alternatives.length > 0 && (
            <div className="alts">
              <span className="muted">{t('scan.alts')}</span>
              {scan.alternatives.map((a) => (
                <button key={a} className="ex" onClick={() => setExpr(a)}>{a}</button>
              ))}
            </div>
          )}
          <p className="tip">
            {lowConf ? t('scan.lowconf') : ''}
            {t('scan.warn')}
          </p>
        </div>
      )}

      {!scan && !reading && (
        <p className="muted">{t('scan.tips')}</p>
      )}

      <div className="examples">
        <span className="muted">{t('solver.try')}</span>
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
