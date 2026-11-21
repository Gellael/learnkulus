import { getLang, tr } from './i18n'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

export type Step = {
  /** Jenis langkah yang tidak bergantung bahasa (product, chain, merge:product, simplify, marker, ...). */
  kind: string
  rule: string
  formula: string
  why: string
  appliedTo: string
  details: string[]
  result: string
  depth: number
}
export type Solution = { input: string; derivative: string; steps: Step[] }
export type Problem = { topic: string; seed: number; expr: string; latex: string }
export type CheckResult = { correct: boolean; solution: Solution }
export type MethodId = 'auto' | 'limit' | 'expand'

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(API + path, init)
  const j = await r.json()
  if (!r.ok) throw new Error(j.error ?? tr('err.generic'))
  return j as T
}

const post = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

// Bahasa yang sedang aktif ikut dikirim, supaya pembahasan dan pesan galat dari server memakai bahasa itu.
export const solve = (expr: string, order: number, method: MethodId = 'auto') =>
  req<Solution>('/solve', post({ expr, order, method, lang: getLang() }))

export const getProblem = (topic: string, seed: number) =>
  req<Problem>(`/problem?topic=${topic}&seed=${seed}&lang=${getLang()}`)

export const check = (topic: string, seed: number, answer: string) =>
  req<CheckResult>('/check', post({ topic, seed, answer, lang: getLang() }))
