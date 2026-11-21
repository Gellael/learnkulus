import type { Solution } from './api'
import { useI18n } from './i18n'
import { buildTree, isMarker, isSimplify, parseRow, parseWhy, tone, type Node } from './stepModel'
import Tex from './Tex'

const jump = (n: string) => document.getElementById(`langkah-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

function Note({ text }: { text: string }) {
  const { t } = useI18n()
  const m = text.match(/^(?:hasil langkah|result of step) (\d+)$/)
  if (!m) return <span className="sx-note">{text}</span>
  return (
    <span className="sx-note">
      {t('steps.from')}{' '}
      <button type="button" className="sx-ref" onClick={() => jump(m[1])}>
        {t('steps.stepN', { n: m[1] })}
      </button>
    </span>
  )
}

function Rows({ lines, title, timeline }: { lines: string[]; title?: string; timeline?: boolean }) {
  const { t } = useI18n()
  const rows = lines.map(parseRow)
  return (
    <div className={'sx-rows' + (timeline ? ' tl' : '')}>
      {title && <p className="sx-sec">{title}</p>}
      {rows.map((r, j) =>
        r.kind === 'label' && /^(Berikutnya|Next)\b/.test(r.label ?? '') ? (
          <p key={j} className="sx-next">
            <span>{r.label}</span>
            <Tex tex={r.tex} />
          </p>
        ) : (
          <div key={j} className={`sx-row ${r.kind}`}>
            {r.kind === 'label' && <span className="sx-rl">{r.label}</span>}
            {r.kind === 'result' && <span className="sx-rl">{t('steps.so')}</span>}
            <div className="sx-math">
              <Tex tex={r.tex} />
            </div>
            {r.note && <Note text={r.note} />}
          </div>
        ),
      )}
    </div>
  )
}

function Why({ text, open }: { text: string; open: boolean }) {
  const { t } = useI18n()
  return (
    <details className="sx-why" open={open}>
      <summary>{t('steps.why')}</summary>
      <div className="sx-why-body">
        {parseWhy(text).map((it, k) => (
          <p key={k} className={`sx-why-item ${it.kind}`}>
            {it.key && <b>{t(`why.${it.key}`)}</b>}
            {it.text}
          </p>
        ))}
      </div>
    </details>
  )
}

function Block({ n, nested = false }: { n: Node; nested?: boolean }) {
  const { t } = useI18n()
  const { s, i } = n
  const simplify = isSimplify(s)
  const result = n.merge ? n.merge.s.result : s.result
  return (
    <section id={`langkah-${i + 1}`} className={`sx-block ${tone(s.kind)}${nested ? ' nested' : ''}`}>
      <header className="sx-title">
        <span className="sx-num">{i + 1}</span>
        <h4>{s.rule}</h4>
      </header>

      {s.appliedTo && (
        <p className="sx-on">
          <span className="sx-k">{t('steps.on')}</span>
          <Tex tex={s.appliedTo} />
        </p>
      )}
      {s.formula && (
        <div className="sx-formula">
          <span className="sx-k">{t('steps.formula')}</span>
          <Tex tex={s.formula} />
        </div>
      )}
      {s.why && <Why text={s.why} open={!nested} />}

      {s.details.length > 0 && <Rows lines={s.details} title={simplify ? t('steps.tidy') : n.merge ? t('steps.assumed') : t('steps.calc')} timeline={simplify} />}

      {n.kids.length > 0 && (
        <div className="sx-kids">
          <p className="sx-sec">{t('steps.kids')}</p>
          {n.kids.map((k) => (
            <Block key={k.i} n={k} nested />
          ))}
        </div>
      )}

      {n.merge && (
        <div className="sx-merge">
          <p className="sx-sec">{t('steps.merge', { n: n.merge.i + 1 })}</p>
          <p className="sx-hint">{n.merge.s.why}</p>
          <Rows lines={n.merge.s.details} />
        </div>
      )}

      {result && (
        <p className="sx-result">
          <span>{t('steps.result')}</span>
          <Tex tex={result} />
        </p>
      )}
    </section>
  )
}

export default function Steps({ sol }: { sol: Solution }) {
  const { t } = useI18n()
  const tree = buildTree(sol.steps)
  const route = tree.filter((n) => !isMarker(n.s))

  return (
    <div className="sx">
      <div className="sx-head">
        <h3>{t('steps.title')}</h3>
        <span>{t('steps.count', { n: sol.steps.length })}</span>
      </div>

      {route.length > 1 && route.length <= 6 && (
        <p className="sx-route">
          <b>{t('steps.route')}</b>
          {route.map((n, k) => (
            <span key={n.i}>
              {k > 0 && <i> → </i>}
              {n.s.rule}
            </span>
          ))}
        </p>
      )}

      <details className="sx-why sx-read">
        <summary>{t('steps.how')}</summary>
        <div className="sx-why-body">
          <p className="sx-why-item intro">{t('steps.how1')}</p>
          <p className="sx-why-item intro">{t('steps.how2')}</p>
          <p className="sx-why-item intro">{t('steps.how3')}</p>
        </div>
      </details>

      {tree.map((n) =>
        isMarker(n.s) ? (
          <h4 key={n.i} className="sx-marker">
            <span>{n.s.rule}</span>
            {n.s.appliedTo && <Tex tex={n.s.appliedTo} />}
          </h4>
        ) : (
          <Block key={n.i} n={n} />
        ),
      )}

      <div className="sx-answer">
        <span className="sx-k">{t('steps.answer')}</span>
        <Tex tex={sol.derivative} />
      </div>
    </div>
  )
}
