import { useState } from 'react'
import Logo from './Logo'
import { LESSONS, type Go, type Page } from './lessons'
import Materi from './Materi'
import Practice from './Practice'
import Secant from './Secant'
import Solver from './Solver'
import './index.css'

const NAV: { page: Page; label: string }[] = [
  { page: 'materi', label: 'Materi' },
  { page: 'practice', label: 'Latihan' },
  { page: 'solver', label: 'Penyelesai' },
]

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lesson, setLesson] = useState(0)
  const [topic, setTopic] = useState('power')

  const go: Go = (p, opt) => {
    if (opt?.lesson !== undefined) setLesson(opt.lesson)
    if (opt?.topic) setTopic(opt.topic)
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className="topbar">
        <button className="brandbtn" onClick={() => go('home')} aria-label="Ke beranda">
          <Logo />
          <span>Kalkulus Interaktif</span>
        </button>
        <nav className="topnav" aria-label="Menu utama">
          {NAV.map((n) => (
            <button key={n.page} className={page === n.page ? 'on' : ''} onClick={() => go(n.page)}>
              {n.label}
            </button>
          ))}
        </nav>
      </div>

      {page === 'home' && (
        <>
          <header className="hero">
            <div className="hero-text">
              <h1>Pahami turunan, lalu latih sampai hafal polanya</h1>
              <p className="lead">
                Belajar turunan dari dasar: pengertian, aturan pangkat, perkalian, hasil bagi, aturan rantai,
                dan trigonometri. Setiap soal latihan dibuat acak, jawabanmu diperiksa otomatis, dan
                pembahasan tampil langkah demi langkah.
              </p>
              <div className="row">
                <button onClick={() => go('materi', { lesson: 0 })}>Mulai belajar</button>
                <button className="ghost" onClick={() => go('practice')}>Langsung latihan</button>
              </div>
            </div>
            <Secant />
          </header>

          <section className="map">
            <h2>Peta materi</h2>
            <ol>
              {LESSONS.map((l, i) => (
                <li key={l.id}>
                  <button className="maprow" onClick={() => go('materi', { lesson: i })}>
                    <span className="num">{i + 1}</span>
                    <span>
                      <strong>{l.title}</strong>
                      <br />
                      <span className="muted">{l.summary}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
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

      <footer>
        <p>© {new Date().getFullYear()} Ricardo Gellael. Seluruh hak cipta dilindungi.</p>
        <p className="muted">Dibuat oleh Ricardo Gellael untuk belajar kalkulus dengan cara yang lebih menyenangkan.</p>
      </footer>
    </>
  )
}
