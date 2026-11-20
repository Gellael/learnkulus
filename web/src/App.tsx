import { useEffect, useState } from 'react'
import Logo from './Logo'
import { LESSONS, type Go, type Page } from './lessons'
import Materi from './Materi'
import Practice from './Practice'
import Secant from './Secant'
import Solver from './Solver'
import Tentang from './Tentang'
import Tex from './Tex'
import './index.css'

const NAV: { page: Page; label: string }[] = [
  { page: 'materi', label: 'Materi' },
  { page: 'practice', label: 'Latihan' },
  { page: 'solver', label: 'Penyelesai' },
  { page: 'about', label: 'Tentang' },
]
const TITLES: Record<Page, string> = {
  home: 'learnkulus | Belajar turunan secara interaktif',
  materi: 'Materi | learnkulus',
  practice: 'Latihan | learnkulus',
  solver: 'Penyelesai | learnkulus',
  about: 'Tentang | learnkulus',
}
const TINTS = ['#e3dcff', '#ffe0d8', '#d6ebff', '#cdf3e6', '#ffdbec', '#fff0a8', '#e3dcff']

export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [lesson, setLesson] = useState(0)
  const [topic, setTopic] = useState('power')

  useEffect(() => {
    document.title = TITLES[page]
  }, [page])

  const go: Go = (p, opt) => {
    if (opt?.lesson !== undefined) setLesson(opt.lesson)
    if (opt?.topic) setTopic(opt.topic)
    setPage(p)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className="topbar">
        <button className="brandbtn" onClick={() => go('home')} aria-label="learnkulus, ke beranda">
          <Logo />
          <span className="wordmark">learn<b>kulus</b></span>
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
              <p className="kicker">Kalkulus dasar, versi interaktif</p>
              <h1>
                Pahami <mark>turunan</mark>, lalu latih sampai hafal polanya
              </h1>
              <p className="lead">
                Belajar dari pengertian sampai aturan rantai dan trigonometri. Soal latihan dibuat acak, jawabanmu
                diperiksa otomatis, dan pembahasan menjelaskan dari mana setiap angka berasal.
              </p>
              <div className="row">
                <button onClick={() => go('materi', { lesson: 0 })}>Mulai belajar</button>
                <button className="ghost" onClick={() => go('practice')}>Langsung latihan</button>
              </div>
              <div className="stats">
                <div><b>{LESSONS.length}</b><span>materi</span></div>
                <div><b>∞</b><span>soal acak</span></div>
                <div><b>3</b><span>cara penyelesaian</span></div>
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
            <h2>Peta materi</h2>
            <p className="muted">Ikuti urutannya, atau lompat ke topik yang kamu butuhkan.</p>
            <ol className="lessons">
              {LESSONS.map((l, i) => (
                <li key={l.id}>
                  <button className="lesson-card" style={{ background: TINTS[i % TINTS.length] }} onClick={() => go('materi', { lesson: i })}>
                    <span className="big">{i + 1}</span>
                    <strong>{l.title}</strong>
                    <span className="muted">{l.summary}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="home-about">
            <h2>Kenapa learnkulus?</h2>
            <ul>
              <li><b>Setiap angka ada asalnya.</b> Pembahasan memperlihatkan u, v, dan turunannya, bukan hanya hasil akhir.</li>
              <li><b>Soal tidak habis.</b> Soal dibuat acak per topik, dan jawaban diperiksa berdasarkan nilainya, jadi bentuk yang berbeda tetap dianggap benar.</li>
              <li><b>Tanpa akun.</b> Kemajuan tersimpan di browser, dan foto soal dibaca di perangkatmu sendiri.</li>
            </ul>
            <button className="ghost" onClick={() => go('about')}>Baca selengkapnya</button>
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
        <p>© {new Date().getFullYear()} Ricardo Gellael. Seluruh hak cipta dilindungi.</p>
        <p className="muted">learnkulus dibuat oleh Ricardo Gellael untuk belajar kalkulus dengan cara yang lebih menyenangkan.</p>
        <p>
          <button type="button" className="linkbtn" onClick={() => go('about')}>Tentang learnkulus</button>
        </p>
      </footer>
    </>
  )
}
