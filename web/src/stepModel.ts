import type { Step } from './api'

// Jenis langkah dibaca dari `kind` (dikirim engine, sama di semua bahasa), bukan dari teks yang ditampilkan.
export const isMerge = (s: Step) => s.kind.startsWith('merge:')
export const isMarker = (s: Step) => s.kind === 'marker'
export const isSimplify = (s: Step) => s.kind === 'simplify'

const TONES: Record<string, string> = {
  product: 'violet',
  quotient: 'coral',
  chain: 'sky',
  'chain-power': 'sky',
  power: 'mint',
  sum: 'pink',
  diff: 'pink',
  combine: 'pink',
  'const-mult': 'sun',
  basic: 'sun',
  def: 'violet',
  fxh: 'violet',
  fdiff: 'violet',
  limit: 'violet',
  expand: 'coral',
  divh: 'mint',
  'each-term': 'mint',
  simplify: 'mint',
}
export const tone = (kind: string) => TONES[kind.replace(/^merge:/, '')] ?? 'ink'

/**
 * Engine mengirim langkah sebagai daftar datar. Di sini diubah menjadi pohon:
 * kartu rencana -> kartu rincian (anak) -> kartu "Gabungkan" (menempel pada kartu rencananya).
 * Nomor `i` tetap nomor langkah asli, karena teks "hasil langkah N" merujuk ke sana.
 */
export type Node = { i: number; s: Step; kids: Node[]; merge?: { i: number; s: Step } }

export function buildTree(steps: Step[]): Node[] {
  const roots: Node[] = []
  const stack: Node[] = []
  steps.forEach((s, i) => {
    if (isMerge(s)) {
      const p = stack[s.depth]
      if (p && !p.merge) {
        p.merge = { i, s }
        return
      }
    }
    const n: Node = { i, s, kids: [] }
    stack.length = s.depth
    const par: Node | undefined = s.depth > 0 ? stack[s.depth - 1] : undefined
    if (par) par.kids.push(n)
    else roots.push(n)
    stack[s.depth] = n
  })
  return roots
}

export type Row = { kind: 'plain' | 'label' | 'result'; label?: string; tex: string; note?: string }

/** Satu baris rincian (LaTeX dari engine) -> bagian-bagian yang ditampilkan terpisah. */
export function parseRow(d: string): Row {
  let tex = d
  let note: string | undefined
  const nm = tex.match(/^(.*?)\\quad\\text\{\((.*)\)\}$/s)
  if (nm) {
    tex = nm[1].trim()
    note = nm[2]
  }
  const rm = tex.match(/^\\Rightarrow\\;\s*(.*)$/s)
  if (rm) return { kind: 'result', tex: rm[1], note }
  const lm = tex.match(/^\\text\{([^}]*)\}\s*(.*)$/s)
  if (lm) return { kind: 'label', label: lm[1].replace(/:\s*$/, ''), tex: lm[2], note }
  return { kind: 'plain', tex, note }
}

export type WhyKey = 'when' | 'how' | 'warn' | 'example' | 'trick' | 'remember'

// Label penjelasan dari engine, dalam Indonesia maupun Inggris, dipetakan ke kunci yang sama.
const WHY_KEYS: Record<string, WhyKey> = {
  Kapan: 'when',
  When: 'when',
  Cara: 'how',
  Caranya: 'how',
  How: 'how',
  Awas: 'warn',
  'Watch out': 'warn',
  Contoh: 'example',
  'Contoh cepat': 'example',
  Example: 'example',
  'Trik hafal': 'trick',
  'Memory trick': 'trick',
  Ingat: 'remember',
  Remember: 'remember',
}
const WHY_RE = /^(Kapan|Caranya|Cara|Awas|Contoh cepat|Contoh|Trik hafal|Ingat|When|How|Watch out|Example|Memory trick|Remember):\s*(.*)$/

export type WhyItem = { key?: WhyKey; kind: 'intro' | 'item' | 'awas'; text: string }

/** Penjelasan dari engine ("Kapan: ...\nCara: ...\nAwas: ...") -> butir berlabel. */
export function parseWhy(text: string): WhyItem[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line): WhyItem => {
      const m = line.match(WHY_RE)
      if (!m) return { kind: 'intro', text: line }
      const key = WHY_KEYS[m[1]]
      return { key, kind: key === 'warn' ? 'awas' : 'item', text: m[2] }
    })
}
