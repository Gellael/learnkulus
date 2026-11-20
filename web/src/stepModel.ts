import type { Step } from './api'

export const isMerge = (rule: string) => rule.startsWith('Gabungkan:')
export const isMarker = (rule: string) => rule.startsWith('Turunan ke')

const TONES: [RegExp, string][] = [
  [/perkalian/i, 'violet'],
  [/hasil bagi/i, 'coral'],
  [/rantai/i, 'sky'],
  [/pangkat/i, 'mint'],
  [/jumlah|selisih|gabung/i, 'pink'],
  [/dasar|kelipatan/i, 'sun'],
  [/definisi|limit|f\(x/i, 'violet'],
  [/jabarkan/i, 'coral'],
  [/sederhanakan|bagi dengan h|tiap suku/i, 'mint'],
]
export const tone = (rule: string) => TONES.find(([re]) => re.test(rule))?.[1] ?? 'ink'

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
    if (isMerge(s.rule)) {
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

const WHY_LABELS: Record<string, string> = {
  Kapan: 'Kapan dipakai',
  Cara: 'Caranya',
  Caranya: 'Caranya',
  Awas: 'Awas',
  Contoh: 'Contoh',
  'Contoh cepat': 'Contoh',
  'Trik hafal': 'Trik hafal',
  Ingat: 'Ingat',
}
export type WhyItem = { label?: string; kind: string; text: string }

/** Penjelasan dari engine ("Kapan: ...\nCara: ...\nAwas: ...") -> butir berlabel. */
export function parseWhy(text: string): WhyItem[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^(Kapan|Caranya|Cara|Awas|Contoh cepat|Contoh|Trik hafal|Ingat):\s*(.*)$/)
      if (!m) return { kind: 'intro', text: line }
      return { label: WHY_LABELS[m[1]], kind: m[1] === 'Awas' ? 'awas' : 'item', text: m[2] }
    })
}
