const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export type Step = { rule: string; formula: string; appliedTo: string }
export type Solution = { input: string; derivative: string; steps: Step[] }
export type Problem = { topic: string; seed: number; expr: string; latex: string }
export type CheckResult = { correct: boolean; solution: Solution }

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + path, init)
  const j = await r.json()
  if (!r.ok) throw new Error(j.error ?? 'Terjadi kesalahan')
  return j as T
}

const post = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const solve = (expr: string, order: number) =>
  req<Solution>('/solve', post({ expr, order }))

export const getProblem = (topic: string, seed: number) =>
  req<Problem>(`/problem?topic=${topic}&seed=${seed}`)

export const check = (topic: string, seed: number, answer: string) =>
  req<CheckResult>('/check', post({ topic, seed, answer }))
