import { useEffect, useState } from 'react'
import { check, getProblem, type CheckResult, type Problem } from './api'
import { useI18n } from './i18n'
import Steps from './Steps'
import Tex from './Tex'

const TOPICS = ['power', 'product', 'quotient', 'chain', 'trig']

const load = (k: string) => Number(localStorage.getItem(k) ?? 0)

export default function Practice({ initialTopic = 'power' }: { initialTopic?: string }) {
  const { lang, t } = useI18n()
  const [topic, setTopic] = useState(initialTopic)
  const [problem, setProblem] = useState<Problem | null>(null)
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [err, setErr] = useState('')
  const [xp, setXp] = useState(() => load('xp'))
  const [streak, setStreak] = useState(() => load('streak'))

  async function next(tp = topic) {
    setResult(null)
    setAnswer('')
    setErr('')
    try {
      setProblem(await getProblem(tp, Math.floor(Math.random() * 1_000_000)))
    } catch (e) {
      setErr((e as Error).message)
    }
  }

  useEffect(() => {
    next()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bahasa berganti: ambil ulang pembahasan dalam bahasa baru (tanpa mengubah XP atau streak).
  useEffect(() => {
    if (!problem || !result) return
    let off = false
    check(problem.topic, problem.seed, answer)
      .then((r) => {
        if (!off) setResult(r)
      })
      .catch(() => {})
    return () => {
      off = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

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
      <h2>{t('practice.title')}</h2>
      <div className="row">
        <select
          value={topic}
          onChange={(e) => {
            setTopic(e.target.value)
            next(e.target.value)
          }}
        >
          {TOPICS.map((k) => (
            <option key={k} value={k}>{t(`topic.${k}`)}</option>
          ))}
        </select>
        <div className="hud" title={t('practice.stored')}>
          <span className="lvl">{t('practice.level')} {Math.floor(xp / 50) + 1}</span>
          <span className="bar"><span style={{ width: `${(xp % 50) * 2}%` }} /></span>
          <span className="xp">{xp} XP</span>
          <span className="streak">Streak {streak}</span>
        </div>
        
      </div>
      {problem && (
        <div className="card">
          <p>{t('practice.ask')}</p>
          <Tex block tex={`f(x) = ${problem.latex}`} />
          <div className="row">
            <input
              placeholder={t('practice.placeholder')}
              value={answer}
              disabled={!!result}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !result && submit()}
            />
            {!result ? <button onClick={submit} disabled={!answer.trim()}>{t('practice.check')}</button> : <button onClick={() => next()}>{t('practice.next')}</button>}
          </div>
        </div>
      )}
      {err && <p className="error">{err}</p>}
      {result && (
        <>
          <p className={result.correct ? 'ok pop' : 'error'}>
            {result.correct ? t('practice.correct') : t('practice.wrong')}
          </p>
          <Steps sol={result.solution} />
        </>
      )}
    </section>
  )
}
