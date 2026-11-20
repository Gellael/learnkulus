import type { Solution } from './api'
import { buildTree, isMarker, parseRow, parseWhy, tone, type Node } from './stepModel'
import Tex from './Tex'

const jump = (n: string) => document.getElementById(`langkah-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })

function Note({ text }: { text: string }) {
  const m = text.match(/^hasil langkah (\d+)$/)
  if (!m) return <span className="sx-note">{text}</span>
  return (
    <span className="sx-note">
      dari{' '}
      <button type="button" className="sx-ref" onClick={() => jump(m[1])}>
        langkah {m[1]}
      </button>
    </span>
  )
}

function Rows({ lines, title, timeline }: { lines: string[]; title?: string; timeline?: boolean }) {
  const rows = lines.map(parseRow)
  return (
    <div className={'sx-rows' + (timeline ? ' tl' : '')}>
      {title && <p className="sx-sec">{title}</p>}
      {rows.map((r, j) =>
        r.kind === 'label' && r.label?.startsWith('Berikutnya') ? (
          <p key={j} className="sx-next">
            <span>{r.label}</span>
            <Tex tex={r.tex} />
          </p>
        ) : (
          <div key={j} className={`sx-row ${r.kind}`}>
            {r.kind === 'label' && <span className="sx-rl">{r.label}</span>}
            {r.kind === 'result' && <span className="sx-rl">Jadi</span>}
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
  return (
    <details className="sx-why" open={open}>
      <summary>Penjelasan</summary>
      <div className="sx-why-body">
        {parseWhy(text).map((it, k) => (
          <p key={k} className={`sx-why-item ${it.kind}`}>
            {it.label && <b>{it.label}</b>}
            {it.text}
          </p>
        ))}
      </div>
    </details>
  )
}

function Block({ n, nested = false }: { n: Node; nested?: boolean }) {
  const { s, i } = n
  const simplify = s.rule === 'Sederhanakan'
  const result = n.merge ? n.merge.s.result : s.result
  return (
    <section id={`langkah-${i + 1}`} className={`sx-block ${tone(s.rule)}${nested ? ' nested' : ''}`}>
      <header className="sx-title">
        <span className="sx-num">{i + 1}</span>
        <h4>{s.rule}</h4>
      </header>

      {s.appliedTo && (
        <p className="sx-on">
          <span className="sx-k">Bagian ini</span>
          <Tex tex={s.appliedTo} />
        </p>
      )}
      {s.formula && (
        <div className="sx-formula">
          <span className="sx-k">Rumus</span>
          <Tex tex={s.formula} />
        </div>
      )}
      {s.why && <Why text={s.why} open={!nested} />}

      {s.details.length > 0 && <Rows lines={s.details} title={simplify ? 'Tahap perapian' : n.merge ? 'Dimisalkan' : 'Perhitungan'} timeline={simplify} />}

      {n.kids.length > 0 && (
        <div className="sx-kids">
          <p className="sx-sec">Dikerjakan dulu</p>
          {n.kids.map((k) => (
            <Block key={k.i} n={k} nested />
          ))}
        </div>
      )}

      {n.merge && (
        <div className="sx-merge">
          <p className="sx-sec">Langkah {n.merge.i + 1}: masukkan ke rumus</p>
          <p className="sx-hint">{n.merge.s.why}</p>
          <Rows lines={n.merge.s.details} />
        </div>
      )}

      {result && (
        <p className="sx-result">
          <span>Hasil bagian ini</span>
          <Tex tex={result} />
        </p>
      )}
    </section>
  )
}

export default function Steps({ sol }: { sol: Solution }) {
  const tree = buildTree(sol.steps)
  const route = tree.filter((n) => !isMarker(n.s.rule))

  return (
    <div className="sx">
      <div className="sx-head">
        <h3>Pembahasan</h3>
        <span>{sol.steps.length} langkah</span>
      </div>

      {route.length > 1 && route.length <= 6 && (
        <p className="sx-route">
          <b>Jalur:</b>
          {route.map((n, k) => (
            <span key={n.i}>
              {k > 0 && <i> → </i>}
              {n.s.rule}
            </span>
          ))}
        </p>
      )}

      <details className="sx-why sx-read">
        <summary>Cara membaca pembahasan</summary>
        <div className="sx-why-body">
          <p className="sx-why-item intro">Setiap kotak besar adalah satu aturan: rumusnya, lalu u dan v yang dimisalkan.</p>
          <p className="sx-why-item intro">Kotak kecil di dalamnya adalah pekerjaan sampingan untuk mencari turunan u dan v. Selesaikan dulu sebelum kembali ke kotak induk.</p>
          <p className="sx-why-item intro">Teks "dari langkah N" bisa diketuk untuk melompat ke langkah itu.</p>
        </div>
      </details>

      {tree.map((n) =>
        isMarker(n.s.rule) ? (
          <h4 key={n.i} className="sx-marker">
            <span>{n.s.rule}</span>
            {n.s.appliedTo && <Tex tex={n.s.appliedTo} />}
          </h4>
        ) : (
          <Block key={n.i} n={n} />
        ),
      )}

      <div className="sx-answer">
        <span className="sx-k">Jawaban</span>
        <Tex tex={sol.derivative} />
      </div>
    </div>
  )
}
