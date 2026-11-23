import { useEffect, useRef } from 'react'
import Tex from './Tex'
import { useI18n } from './i18n'
import { lessonsFor, type Go } from './lessons'

export default function Materi({ index, setIndex, go }: { index: number; setIndex: (i: number) => void; go: Go }) {
  const { lang, t } = useI18n()
  const LESSONS = lessonsFor(lang)
  const l = LESSONS[index]
  const asideRef = useRef<HTMLElement>(null)
  useEffect(() => {
    asideRef.current?.querySelector<HTMLElement>('.side.on')?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [index])
  return (
    <div className="materi">
      <aside ref={asideRef}>
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

        <h3>{t('materi.formulas')}</h3>
        {l.rules.map((r) => (
          <div className="rule" key={r.name}>
            <span className="muted">{r.name}</span>
            <Tex block tex={r.tex} />
          </div>
        ))}

        <h3>{t('materi.examples')}</h3>
        {l.examples.map((e, i) => (
          <div className="card" key={i}>
            <p>
              <strong>{t('materi.problem')}</strong> <Tex tex={e.q} />
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
            <button onClick={() => go('practice', { topic: l.practice })}>{t('materi.practiceTopic')}</button>
          ) : (
            <button onClick={() => go('solver')}>{t('materi.tryInSolver')}</button>
          )}
          {index < LESSONS.length - 1 && (
            <button
              className="ghost"
              onClick={() => {
                setIndex(index + 1)
                window.scrollTo(0, 0)
              }}
            >
              {t('materi.next')}
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
