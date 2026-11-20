import Tex from './Tex'
import { LESSONS, type Go } from './lessons'

export default function Materi({ index, setIndex, go }: { index: number; setIndex: (i: number) => void; go: Go }) {
  const l = LESSONS[index]
  return (
    <div className="materi">
      <aside>
        <ol>
          {LESSONS.map((x, i) => (
            <li key={x.id}>
              <button className={'side' + (i === index ? ' on' : '')} onClick={() => setIndex(i)}>
                <span className="num">{i + 1}</span>
                {x.title}
              </button>
            </li>
          ))}
        </ol>
      </aside>
      <article>
        <h2>{l.title}</h2>
        <p className="lead">{l.intro}</p>

        <h3>Rumus</h3>
        {l.rules.map((r) => (
          <div className="rule" key={r.name}>
            <span className="muted">{r.name}</span>
            <Tex block tex={r.tex} />
          </div>
        ))}

        <h3>Contoh</h3>
        {l.examples.map((e, i) => (
          <div className="card" key={i}>
            <p>
              <strong>Soal:</strong> <Tex tex={e.q} />
            </p>
            <ol className="steps">
              {e.steps.map((s, j) => (
                <li key={j}>
                  <Tex tex={s} />
                </li>
              ))}
            </ol>
            <p className="answer">
              <Tex tex={e.ans} />
            </p>
          </div>
        ))}

        {l.tip && <p className="tip">{l.tip}</p>}

        <div className="row">
          {l.practice ? (
            <button onClick={() => go('practice', { topic: l.practice })}>Latihan topik ini</button>
          ) : (
            <button onClick={() => go('solver')}>Coba di Penyelesai</button>
          )}
          {index < LESSONS.length - 1 && (
            <button
              className="ghost"
              onClick={() => {
                setIndex(index + 1)
                window.scrollTo(0, 0)
              }}
            >
              Materi berikutnya
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
