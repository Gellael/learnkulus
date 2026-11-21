import { createWorker, PSM } from 'tesseract.js'
import { cleanMath, type FixId } from './ocrClean'

/**
 * Scan soal dari foto TANPA AI dan TANPA server: seluruh proses jalan di browser
 * memakai Tesseract.js (OCR biasa). Tidak ada API key, tidak ada biaya per pemakaian.
 *
 * Catatan: data bahasa ("eng") diunduh Tesseract.js dari CDN pada pemakaian pertama,
 * lalu disimpan oleh browser, jadi scan berikutnya lebih cepat.
 */

export type ScanResult = {
  /** Teks mentah persis seperti dibaca OCR. */
  raw: string
  /** Ekspresi yang sudah dirapikan, siap dimasukkan ke kolom f(x). */
  expr: string
  /** Daftar perbaikan otomatis yang dilakukan (diterjemahkan di antarmuka). */
  fixes: FixId[]
  /** Tebakan lain kalau `expr` keliru (misalnya x miring terbaca 2). */
  alternatives: string[]
  /** Keyakinan OCR 0..100 (rata-rata dari Tesseract). */
  confidence: number
  /** Gambar hasil pra-pemrosesan (hitam-putih) yang benar-benar dibaca OCR. */
  seen: string
}

export type ProgressKey = 'preparing' | 'loadCore' | 'init' | 'download' | 'reading'
export type Progress = { key: ProgressKey; value: number }

/** Galat yang pesannya diterjemahkan di antarmuka lewat kunci `key` (mis. 'err.noText'). */
export class ScanError extends Error {
  key: string
  constructor(key: string) {
    super(key)
    this.key = key
  }
}

const KEYS: Record<string, ProgressKey> = {
  'loading tesseract core': 'loadCore',
  'initializing tesseract': 'init',
  'loading language traineddata': 'download',
  'initializing api': 'init',
  'recognizing text': 'reading',
}

/** Ambang Otsu: memisahkan latar dan tulisan secara otomatis. */
function otsu(hist: number[], total: number): number {
  let sum = 0
  for (let i = 0; i < 256; i++) sum += i * hist[i]
  let sumB = 0
  let wB = 0
  let best = 0
  let thr = 127
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (!wB) continue
    const wF = total - wB
    if (!wF) break
    sumB += t * hist[t]
    const mB = sumB / wB
    const mF = (sum - sumB) / wF
    const between = wB * wF * (mB - mF) * (mB - mF)
    if (between > best) {
      best = between
      thr = t
    }
  }
  return thr
}

/**
 * Siapkan foto supaya mudah dibaca OCR: ukuran pas, abu-abu, hitam-putih (Otsu),
 * dan beri bingkai putih. Foto latar gelap dengan tulisan terang otomatis dibalik.
 */
export async function prepare(file: File): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file)
  const longest = Math.max(bmp.width, bmp.height)
  const k = Math.min(3, Math.max(0.25, 1600 / longest))
  const w = Math.round(bmp.width * k)
  const h = Math.round(bmp.height * k)
  const pad = 24

  const c = document.createElement('canvas')
  c.width = w + pad * 2
  c.height = h + pad * 2
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(bmp, pad, pad, w, h)

  const img = ctx.getImageData(0, 0, c.width, c.height)
  const d = img.data
  const gray = new Uint8Array(c.width * c.height)
  const hist = new Array<number>(256).fill(0)
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const g = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])
    gray[p] = g
    hist[g]++
  }
  const thr = otsu(hist, gray.length)
  let dark = 0
  for (let p = 0; p < gray.length; p++) if (gray[p] <= thr) dark++
  // Jika lebih dari separuh piksel gelap, kemungkinan latarnya gelap: balik.
  const invert = dark > gray.length / 2
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const isInk = invert ? gray[p] > thr : gray[p] <= thr
    const v = isInk ? 0 : 255
    d[i] = d[i + 1] = d[i + 2] = v
    d[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return c
}

/** Baca soal dari foto. Melempar ScanError (kunci terjemahan) jika gagal. */
export async function scanProblem(file: File, onProgress?: (p: Progress) => void): Promise<ScanResult> {
  if (!file.type.startsWith('image/')) throw new ScanError('err.notImage')

  let canvas: HTMLCanvasElement
  try {
    canvas = await prepare(file)
  } catch {
    throw new ScanError('err.badImage')
  }

  onProgress?.({ key: 'preparing', value: 0.02 })
  const worker = await createWorker('eng', 1, {
    logger: (m: { status: string; progress: number }) => {
      const key = KEYS[m.status]
      if (key) onProgress?.({ key, value: m.progress })
    },
  })
  try {
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      // Hanya huruf dan simbol yang mungkin muncul di soal turunan.
      tessedit_char_whitelist: '0123456789xXyfsincotaeqrt+-*/^()=. ',
      preserve_interword_spaces: '1',
    })
    const { data } = await worker.recognize(canvas)
    const raw = (data.text ?? '').trim()
    const { expr, fixes, alternatives } = cleanMath(raw)
    if (!expr) {
      throw new ScanError('err.noText')
    }
    return { raw, expr, fixes, alternatives, confidence: Math.round(data.confidence ?? 0), seen: canvas.toDataURL('image/jpeg', 0.7) }
  } finally {
    await worker.terminate()
  }
}
