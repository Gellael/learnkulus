import { useEffect, useState } from 'react'
import { useI18n } from './i18n'
import LangToggle from './LangToggle'
import { lessonsFor, type Go, type Page } from './lessons'
import Logo from './Logo'
import Materi from './Materi'
import Practice from './Practice'
import Secant from './Secant'
import Solver from './Solver'
import Tentang from './Tentang'
import Tex from './Tex'
import ThemeToggle from './ThemeToggle'
import './index.css'

const NAV: Page[] = ['materi', 'practice', 'solver', 'about']

export default function App() {
  const { lang, t } = useI18n()
  const LESSONS = lessonsFor(lang)
  const [page, setPage] = useState<Page>('home')
  const [lesson, setLesson] = useState(0)
  const [topic, setTopic] = useState('power')

  useEffect(() => {
    document.title = t(`title.${page}`)
  }, [page, t])

  const go: Go = (p, opt) => {
    if (opt?.lesson !== undefined) setLesson(opt.lesson)
    if (opt?.topic) setTopic(opt.topic)
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className="topbar">
        <button className="brandbtn" onClick={() => go('home')} aria-label={t('brand.aria')}>
          <Logo />
          <span className="wordmark">learn<b>kulus</b></span>
        </button>
        <nav className="topnav" aria-label={t('nav.aria')}>
          {NAV.map((p) => (
            <button key={p} className={page === p ? 'on' : ''} onClick={() => go(p)}>
              {t(`nav.${p}`)}
            </button>
          ))}
        </nav>
        <div className="topctl">
          <LangToggle />
          <ThemeToggle />
        </div>
      </div>

      {page === 'home' && (
        <>
          <header className="hero">
            <div className="hero-text">
              <p className="kicker">{t('home.kicker')}</p>
              <h1>
                {t('home.h1a')}<mark>{t('home.h1m')}</mark>{t('home.h1b')}
              </h1>
              <p className="lead">{t('home.lead')}</p>
              <div className="row">
                <button onClick={() => go('materi', { lesson: 0 })}>{t('home.start')}</button>
                <button className="ghost" onClick={() => go('practice')}>{t('home.practiceNow')}</button>
              </div>
              <div className="stats">
                <div><b>{LESSONS.length}</b><span>{t('home.stat.lessons')}</span></div>
                <div><b>∞</b><span>{t('home.stat.problems')}</span></div>
                <div><b>3</b><span>{t('home.stat.methods')}</span></div>
              </div>
            </div>
            <div className="demo-wrap">
              <span className="sticker s1"><Tex tex={String.raw`(uv)'=u'v+uv'`} /></span>
              <span className="sticker s2"><Tex tex={String.raw`(x^{n})'=n\,x^{n-1}`} /></span>
              <span className="sticker s3"><Tex tex={String.raw`(\sin x)'=\cos x`} /></span>
              <Secant />
            </div>
          </header>

          <section className="map">
            <h2>{t('home.map')}</h2>
            <p className="muted">{t('home.mapHint')}</p>
            <ol className="lessons">
              {LESSONS.map((l, i) => (
                <li key={l.id}>
                  <button className="lesson-card" style={{ background: `var(--tint-${i % 7})` }} onClick={() => go('materi', { lesson: i })}>
                    <span className="big">{i + 1}</span>
                    <strong>{l.title}</strong>
                    <span className="muted">{l.summary}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="home-about">
            <h2>{t('home.why')}</h2>
            <ul>
              <li><b>{t('home.why1b')}</b>{t('home.why1')}</li>
              <li><b>{t('home.why2b')}</b>{t('home.why2')}</li>
              <li><b>{t('home.why3b')}</b>{t('home.why3')}</li>
            </ul>
            <button className="ghost" onClick={() => go('about')}>{t('home.more')}</button>
          </section>
        </>
      )}

      {page === 'materi' && (
        <main className="wide">
          <Materi index={lesson} setIndex={setLesson} go={go} />
        </main>
      )}
      {page === 'practice' && (
        <main>
          <Practice key={topic} initialTopic={topic} />
        </main>
      )}
      {page === 'solver' && (
        <main>
          <Solver />
        </main>
      )}
      {page === 'about' && (
        <main>
          <Tentang go={go} />
        </main>
      )}

      <footer>
        <p>{t('footer.copy', { year: new Date().getFullYear() })}</p>
        <p className="muted">{t('footer.made')}</p>
        <p>
          <button type="button" className="linkbtn" onClick={() => go('about')}>{t('footer.about')}</button>
        </p>
      </footer>
    </>
  )
}
