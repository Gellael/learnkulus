/**
 * Membersihkan teks mentah hasil OCR supaya bisa dibaca parser engine.
 * Murni fungsi teks (tanpa DOM), jadi mudah diuji.
 *
 * OCR biasa (Tesseract) tidak mengerti matematika: pangkat kecil di atas huruf
 * sering terbaca sebagai angka biasa ("x2"), tanda minus terbaca sebagai tanda lain,
 * dan huruf "x" kadang terbaca "X". Fungsi ini memperbaiki pola-pola umum itu
 * dan mencatat apa saja yang diubah supaya pengguna bisa memeriksanya.
 */

export type FixId =
  | 'xDigits' | 'parenDigits' | 'addParen' | 'dropParen' | 'prefix' | 'rhs' | 'superscript' | 'minus' | 'times' | 'divide'
  | 'bracket' | 'sqrt' | 'quotes' | 'bar' | 'upperX' | 'letterO' | 'lower' | 'dropChars' | 'letterX' | 'twoAsX' | 'constTrig'

export type Cleaned = {
  /** Ekspresi yang sudah dirapikan, siap ditaruh di kolom f(x). */
  expr: string
  /** Daftar perubahan yang dilakukan (kunci terjemahan `fix.<id>`), untuk ditampilkan ke pengguna. */
  fixes: FixId[]
  /** Tebakan lain yang masuk akal kalau `expr` ternyata keliru (bisa kosong). */
  alternatives: string[]
}

const SUP: Record<string, string> = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }

/** Pangkat yang menempel ("x2", "(x+1)3"), spasi, tanda di ujung, dan kurung yang tidak seimbang. */
function normalize(input: string, note: (msg: FixId) => void): string {
  let s = input
  // "x2" -> "x^2": angka yang menempel di belakang x hampir pasti pangkat.
  s = s.replace(/x(\d+)/g, (_m, d) => {
    note('xDigits')
    return `x^${d}`
  })
  // "(x+1)3" -> "(x+1)^3"
  s = s.replace(/\)\s*(\d+)/g, (_m, d) => {
    note('parenDigits')
    return `)^${d}`
  })
  // "x^ 2" -> "x^2"
  s = s.replace(/\^\s+/g, '^')

  // Rapikan spasi dan tanda baca di ujung.
  s = s.replace(/\s+/g, ' ').replace(/[.\s+*/^-]+$/g, '').trim()

  // Seimbangkan kurung.
  const open = (s.match(/\(/g) ?? []).length
  const close = (s.match(/\)/g) ?? []).length
  if (open > close) {
    s += ')'.repeat(open - close)
    note('addParen')
  } else if (close > open) {
    let extra = close - open
    s = s.replace(/\)/g, (m) => (extra-- > 0 ? '' : m))
    note('dropParen')
  }
  return s
}

/**
 * Fungsi trigonometri yang isinya tanpa x ("sin(52)") nilainya konstan, dan itu hampir tidak pernah
 * dipakai di soal turunan. Biasanya isinya "5x" yang x-nya terbaca 2. Ubah angka 2 di ujung isi menjadi x.
 */
function fixConstantTrig(input: string, note: (msg: FixId) => void): string {
  const fn = '(sin|cos|tan|sec|csc|cot)'
  const swap = (arg: string) => (!arg.includes('x') && /2$/.test(arg) ? arg.slice(0, -1) + 'x' : arg)
  let changed = false
  let s = input.replace(new RegExp(fn + '\\s*\\(([^()]*)\\)', 'g'), (m, f, arg) => {
    const fixed = swap(arg.trim())
    if (fixed === arg.trim()) return m
    changed = true
    return `${f}(${fixed})`
  })
  s = s.replace(new RegExp(fn + '\\s+(\\d+)(?![\\d(])', 'g'), (m, f, arg) => {
    const fixed = swap(arg)
    if (fixed === arg) return m
    changed = true
    return `${f} ${fixed}`
  })
  if (changed) note('constTrig')
  return s
}

/** Pemeriksaan bentuk kasar (bukan parser penuh) untuk memilih tebakan yang masuk akal. */
function plausible(s: string): boolean {
  if (!s.includes('x')) return false
  let depth = 0
  for (const c of s) {
    if (c === '(') depth++
    else if (c === ')' && --depth < 0) return false
  }
  if (depth !== 0) return false
  if (/\(\s*\)/.test(s)) return false
  if (/[+\-*/^]\s*$/.test(s)) return false
  if (/\^\s*[+*/^)]/.test(s)) return false
  if (/xx/.test(s)) return false // x yang berdempetan hampir selalu salah baca
  return true
}

/**
 * Coba ganti angka 2 menjadi x. Semua 2 diganti dulu (tebakan paling mungkin),
 * lalu kombinasi yang lebih sedikit sebagai cadangan, misalnya kalau hanya sebagian x yang keliru.
 * `pre` adalah teks sebelum dirapikan, `norm` sesudah dirapikan.
 */
function recoverX(s: string): { pre: string; norm: string }[] {
  const pos: number[] = []
  for (let i = 0; i < s.length; i++) if (s[i] === '2') pos.push(i)
  if (pos.length === 0 || pos.length > 6) return []
  const bits = (m: number) => pos.filter((_, k) => m & (1 << k)).length
  const masks = Array.from({ length: (1 << pos.length) - 1 }, (_, k) => k + 1).sort((a, b) => bits(b) - bits(a) || a - b)
  const out: { pre: string; norm: string }[] = []
  for (const m of masks) {
    const chars = [...s]
    pos.forEach((p, k) => {
      if (m & (1 << k)) chars[p] = 'x'
    })
    const pre = chars.join('')
    const norm = normalize(pre, () => {})
    if (plausible(norm) && !out.some((o) => o.norm === norm)) out.push({ pre, norm })
  }
  return out
}

export function cleanMath(raw: string): Cleaned {
  const fixes: FixId[] = []
  const note = (msg: FixId) => {
    if (!fixes.includes(msg)) fixes.push(msg)
  }

  // Ambil baris pertama yang berisi sesuatu.
  let s = (raw.split(/\r?\n/).map((l) => l.trim()).find((l) => l.length > 0) ?? '').trim()

  // Buang awalan "f(x) =", "y =", "f(x):" dsb.
  const before = s
  s = s.replace(/^\s*(?:f\s*\(\s*[xX]\s*\)|y)\s*[=:]\s*/i, '')
  if (s !== before) note('prefix')

  // Jika masih ada "=", ambil sisi kanan.
  if (s.includes('=')) {
    s = s.slice(s.lastIndexOf('=') + 1).trim()
    note('rhs')
  }

  // Pangkat unicode (x², x³) -> ^2, ^3
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => {
    note('superscript')
    return '^' + [...m].map((c) => SUP[c]).join('')
  })

  // Tanda-tanda yang sering salah baca
  const map: [RegExp, string, FixId?][] = [
    [/[−–—‒﹣－]/g, '-', 'minus'],
    [/[×✕✖⋅·∙]/g, '*', 'times'],
    [/[÷∕⁄]/g, '/', 'divide'],
    [/[\[{]/g, '(', 'bracket'],
    [/[\]}]/g, ')', 'bracket'],
    [/√/g, 'sqrt', 'sqrt'],
    [/[“”"'‘’`´]/g, '', 'quotes'],
    [/[|¦]/g, '1', 'bar'],
    [/X/g, 'x', 'upperX'],
  ]
  for (const [re, to, msg] of map) {
    if (re.test(s)) {
      s = s.replace(re, to)
      if (msg) note(msg)
    }
  }

  // Huruf O/o yang menempel pada angka hampir pasti angka 0.
  s = s.replace(/(\d)[Oo]/g, (_m, d) => {
    note('letterO')
    return d + '0'
  })
  s = s.replace(/[Oo](\d)/g, (_m, d) => {
    note('letterO')
    return '0' + d
  })

  // Huruf kapital lain -> kecil (SIN, COS, ...)
  if (/[A-Z]/.test(s)) {
    s = s.toLowerCase()
    note('lower')
  }

  // Hanya sisakan karakter yang dipahami parser.
  const kept = s.replace(/[^0-9a-z+\-*/^().\s]/g, '')
  if (kept !== s) note('dropChars')
  s = kept

  // Huruf x miring sering tidak terbaca sebagai x. Kalau tidak ada x sama sekali,
  // soal turunan hampir pasti kehilangan x-nya, jadi coba pulihkan.
  let alternatives: string[] = []
  if (!s.includes('x')) {
    const letters = s.replace(/[a-z]+/g, (w) => (w.length === 1 ? 'x' : w))
    if (letters !== s) {
      s = letters
      note('letterX')
    } else {
      const found = recoverX(s)
      if (found.length > 0) {
        s = found[0].pre
        alternatives = found.slice(1, 4).map((c) => c.norm)
        note('twoAsX')
      }
    }
  }

  s = fixConstantTrig(s, note)
  s = normalize(s, note)
  alternatives = alternatives.filter((a) => a !== s)

  return { expr: s, fixes, alternatives }
}
