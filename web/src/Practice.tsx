import { useEffect, useState } from 'react'
import { check, getProblem, type CheckResult, type Problem } from './api'
import Steps from './Steps'
import Tex from './Tex'

const TOPICS: Record<string, string> = {
  power: 'Aturan pangkat',
  product: 'Aturan perkalian',
  quotient: 'Aturan hasil bagi',
  chain: 'Aturan rantai',
  trig: 'Trigonometri',
}

const load = (k: string) => Number(localStorage.getItem(k) ?? 0)

export default function Practice({ initialTopic = 'power' }: { initialTopic?: string }) {
  const [topic, setTopic] = useState(initialTopic)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [err, setErr] = useState('')
  const [xp, setXp] = useState(() => load('xp'))
  const [streak, setStreak] = useState(() => load('streak'))

  async function next(t = topic) {
    setResult(null)
    setAnswer('')
    setErr('')
    try {
      setProblem(await getProblem(t, Math.floor(Math.random() * 1_000_000)))
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  useEffect(() => {
    next()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function submit() {
    if (!problem) return
    setErr('')
    try {
      const r = await check(problem.topic, problem.seed, answer)
      setResult(r)
      const newStreak = r.correct ? streak + 1 : 0
      const newXp = r.correct ? xp + 10 : xp
      setStreak(newStreak)
      setXp(newXp)
      localStorage.setItem('xp', String(newXp))
      localStorage.setItem('streak', String(newStreak))
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  return (
    <section>
      <h2>Latihan</h2>
      <div className="row">
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            next(e.target.value)
          }}
        >
          {Object.entries(TOPICS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="hud" title="Tersimpan di browser ini">
          <span className="lvl">Level {Math.floor(xp / 50) + 1}</span>
          <span className="bar"><span style={{ width: `${(xp % 50) * 2}%` }} /></span>
          <span className="xp">{xp} XP</span>
          <span className="streak">Streak {streak}</span>
        </div>
        
      </div>
      {problem && (
        <div className="card">
          <p>Tentukan f'(x) jika</p>
          <Tex block tex={`f(x) = ${problem.latex}`} />
          <div className="row">
            <input
              placeholder="contoh: 3x^2 - 2x"
              value={answer}
              disabled={!!result}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !result && submit()}
            />
            {!result ? <button onClick={submit} disabled={!answer.trim()}>Periksa</button> : <button onClick={() => next()}>Soal berikutnya</button>}
          </div>
        </div>
      )}
      {err && <p className="error">{err}</p>}
      {result && (
        <>
          <p className={result.correct ? 'ok pop' : 'error'}>
            {result.correct ? 'Benar! +10 XP' : 'Belum tepat. Ini pembahasannya:'}
          </p>
          <Steps sol={result.solution} />
        </>
      )}
    </section>
  )
}
