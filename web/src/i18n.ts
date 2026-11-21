import { useCallback, useSyncExternalStore } from 'react'

export type Lang = 'id' | 'en'

const KEY = 'lang'

/** Teks antarmuka. Kunci Indonesia menjadi acuan; Inggris wajib punya kunci yang sama (dicek oleh TypeScript). */
const ID = {
  // navigasi dan judul tab
  'nav.materi': 'Materi',
  'nav.practice': 'Latihan',
  'nav.solver': 'Penyelesai',
  'nav.about': 'Tentang',
  'nav.aria': 'Menu utama',
  'brand.aria': 'learnkulus, ke beranda',
  'title.home': 'learnkulus | Belajar turunan secara interaktif',
  'title.materi': 'Materi | learnkulus',
  'title.practice': 'Latihan | learnkulus',
  'title.solver': 'Penyelesai | learnkulus',
  'title.about': 'Tentang | learnkulus',
  'lang.switch': 'Ganti bahasa',
  'lang.title': 'Bahasa: Indonesia',
  'theme.toDark': 'Ganti ke tema gelap',
  'theme.toLight': 'Ganti ke tema terang',

  // beranda
  'home.kicker': 'Kalkulus dasar, versi interaktif',
  'home.h1a': 'Pahami ',
  'home.h1m': 'turunan',
  'home.h1b': ', lalu latih sampai hafal polanya',
  'home.lead': 'Belajar dari pengertian sampai aturan rantai dan trigonometri. Soal latihan dibuat acak, jawabanmu diperiksa otomatis, dan pembahasan menjelaskan dari mana setiap angka berasal.',
  'home.start': 'Mulai belajar',
  'home.practiceNow': 'Langsung latihan',
  'home.stat.lessons': 'materi',
  'home.stat.problems': 'soal acak',
  'home.stat.methods': 'cara penyelesaian',
  'home.map': 'Peta materi',
  'home.mapHint': 'Ikuti urutannya, atau lompat ke topik yang kamu butuhkan.',
  'home.why': 'Kenapa learnkulus?',
  'home.why1b': 'Setiap angka ada asalnya.',
  'home.why1': ' Pembahasan memperlihatkan u, v, dan turunannya, bukan hanya hasil akhir.',
  'home.why2b': 'Soal tidak habis.',
  'home.why2': ' Soal dibuat acak per topik, dan jawaban diperiksa berdasarkan nilainya, jadi bentuk yang berbeda tetap dianggap benar.',
  'home.why3b': 'Tanpa akun.',
  'home.why3': ' Kemajuan tersimpan di browser, dan foto soal dibaca di perangkatmu sendiri.',
  'home.more': 'Baca selengkapnya',
  'footer.copy': '© {year} Ricardo Gellael. Seluruh hak cipta dilindungi.',
  'footer.made': 'learnkulus dibuat oleh Ricardo Gellael untuk belajar kalkulus dengan cara yang lebih menyenangkan.',
  'footer.about': 'Tentang learnkulus',

  // materi
  'materi.formulas': 'Rumus',
  'materi.examples': 'Contoh',
  'materi.problem': 'Soal:',
  'materi.practiceTopic': 'Latihan topik ini',
  'materi.tryInSolver': 'Coba di Penyelesai',
  'materi.next': 'Materi berikutnya',

  // latihan
  'practice.title': 'Latihan',
  'practice.level': 'Level',
  'practice.stored': 'Tersimpan di browser ini',
  'practice.ask': "Tentukan f'(x) jika",
  'practice.placeholder': 'contoh: 3x^2 - 2x',
  'practice.check': 'Periksa',
  'practice.next': 'Soal berikutnya',
  'practice.correct': 'Benar! +10 XP. Pola ini sudah kamu kuasai.',
  'practice.wrong': 'Belum tepat, tidak apa-apa. Salah itu bagian dari belajar. Yuk lihat di mana beloknya:',
  'topic.power': 'Aturan pangkat',
  'topic.product': 'Aturan perkalian',
  'topic.quotient': 'Aturan hasil bagi',
  'topic.chain': 'Aturan rantai',
  'topic.trig': 'Trigonometri',

  // penyelesai
  'solver.title': 'Penyelesai turunan',
  'solver.intro': 'Ketik fungsi atau foto soalnya, pilih jalur penyelesaian sesuai perintah soal, lalu bedah langkahnya satu per satu.',
  'solver.methodsAria': 'Metode penyelesaian',
  'method.auto.label': 'Aturan turunan',
  'method.auto.desc': 'Jalur utama: aplikasi memilih aturan yang cocok dengan bentuk soal (pangkat, perkalian, hasil bagi, rantai, atau trigonometri) dan menjelaskan kenapa aturan itu dipilih.',
  'method.limit.label': 'Definisi limit',
  'method.limit.desc': 'Jalur "dari nol": memakai definisi f′(x) = lim [f(x+h) − f(x)] / h, persis seperti saat turunan pertama kali ditemukan. Hanya untuk polinomial, misalnya 3x^2 - 5x atau (x+1)^3.',
  'method.expand.label': 'Jabarkan dulu',
  'method.expand.desc': 'Jalur "ratakan dulu": fungsi dijabarkan menjadi jumlah suku, lalu tiap suku diturunkan dengan aturan pangkat. Hanya untuk polinomial.',
  'solver.fx': 'f(x) =',
  'solver.fxAria': 'Fungsi f(x)',
  'solver.order': 'turunan ke-{n}',
  'solver.compute': 'Hitung',
  'solver.computing': 'Menghitung...',
  'solver.camera': 'Foto dengan kamera',
  'solver.gallery': 'Pilih dari galeri',
  'solver.try': 'Coba:',
  'scan.title': 'Ini yang terbaca dari fotomu',
  'scan.seenAlt': 'Foto setelah dibuat hitam-putih, seperti yang dilihat pembaca',
  'scan.raw': 'Teks mentah dari pembaca:',
  'scan.empty': '(kosong)',
  'scan.into': 'Sudah dimasukkan ke kolom f(x) di atas:',
  'scan.fixes': 'Perapian otomatis yang saya lakukan:',
  'scan.alts': 'Kalau hasil di atas keliru, coba salah satu tebakan lain ini:',
  'scan.lowconf': 'Pembacanya kurang yakin dengan foto ini. ',
  'scan.warn': 'Pembaca teks ini tidak mengerti matematika, jadi pangkat kecil (x²) sering terbaca sebagai angka biasa dan tanda minus kadang keliru. Periksa kolom f(x), perbaiki kalau perlu, baru klik Hitung.',
  'scan.tips': 'Tips foto: dekatkan kamera ke satu soal saja, pakai cahaya terang, dan hindari bayangan. Tulisan cetak jauh lebih mudah dibaca daripada tulisan tangan.',
  'progress.preparing': 'Menyiapkan foto...',
  'progress.loadCore': 'Memuat mesin pembaca...',
  'progress.init': 'Menyiapkan mesin pembaca...',
  'progress.download': 'Mengunduh data huruf (hanya pertama kali)...',
  'progress.reading': 'Membaca soal...',
  'err.generic': 'Terjadi kesalahan',
  'err.notImage': 'File harus berupa gambar (JPG, PNG, atau WEBP).',
  'err.badImage': 'Gambar tidak bisa dibuka. Coba foto ulang atau pilih gambar lain.',
  'err.noText': 'Tidak ada tulisan soal yang terbaca. Coba foto lebih dekat, lebih terang, dan hanya berisi satu soal.',

  // perapian hasil OCR
  'fix.xDigits': 'Angka di belakang x dibaca sebagai pangkat (x2 menjadi x^2)',
  'fix.parenDigits': 'Angka di belakang kurung tutup dibaca sebagai pangkat',
  'fix.addParen': 'Kurung tutup yang hilang ditambahkan di ujung',
  'fix.dropParen': 'Kurung tutup yang berlebih dibuang',
  'fix.prefix': 'Awalan f(x) = dibuang',
  'fix.rhs': 'Hanya sisi kanan tanda = yang dipakai',
  'fix.superscript': 'Pangkat kecil (x²) diubah menjadi ^',
  'fix.minus': 'Tanda minus diseragamkan',
  'fix.times': 'Tanda kali diseragamkan',
  'fix.divide': 'Tanda bagi diseragamkan',
  'fix.bracket': 'Kurung siku/kurawal diubah menjadi kurung biasa',
  'fix.sqrt': 'Akar √ diubah menjadi sqrt',
  'fix.quotes': 'Tanda kutip dibuang',
  'fix.bar': 'Garis tegak | dibaca sebagai angka 1',
  'fix.upperX': 'Huruf X besar diubah menjadi x',
  'fix.letterO': 'Huruf O di dekat angka dibaca sebagai 0',
  'fix.lower': 'Huruf kapital diubah menjadi huruf kecil',
  'fix.dropChars': 'Karakter yang tidak dikenal dibuang',
  'fix.letterX': 'Huruf tunggal yang tidak dikenal dianggap sebagai x',
  'fix.twoAsX': 'Tidak ada huruf x yang terbaca. Huruf x miring sering terbaca sebagai angka 2, jadi angka 2 dianggap x',
  'fix.constTrig': 'Fungsi trigonometri dengan isi angka saja (misalnya sin(52)) dianggap salah baca: angka 2 di ujungnya diganti x',

  // pembahasan langkah
  'steps.title': 'Pembahasan',
  'steps.count': '{n} langkah',
  'steps.route': 'Jalur:',
  'steps.how': 'Cara membaca pembahasan',
  'steps.how1': 'Setiap kotak besar adalah satu aturan: rumusnya, lalu u dan v yang dimisalkan.',
  'steps.how2': 'Kotak kecil di dalamnya adalah pekerjaan sampingan untuk mencari turunan u dan v. Selesaikan dulu sebelum kembali ke kotak induk.',
  'steps.how3': 'Teks "dari langkah N" bisa diketuk untuk melompat ke langkah itu.',
  'steps.answer': 'Jawaban',
  'steps.on': 'Bagian ini',
  'steps.formula': 'Rumus',
  'steps.why': 'Penjelasan',
  'steps.tidy': 'Tahap perapian',
  'steps.assumed': 'Dimisalkan',
  'steps.calc': 'Perhitungan',
  'steps.kids': 'Dikerjakan dulu',
  'steps.merge': 'Langkah {n}: masukkan ke rumus',
  'steps.result': 'Hasil bagian ini',
  'steps.so': 'Jadi',
  'steps.from': 'dari',
  'steps.stepN': 'langkah {n}',
  'why.when': 'Kapan dipakai',
  'why.how': 'Caranya',
  'why.warn': 'Awas',
  'why.example': 'Contoh',
  'why.trick': 'Trik hafal',
  'why.remember': 'Ingat',

  // demo garis sekan
  'secant.aria': 'Garis sekan mendekati garis singgung saat h mengecil',
  'secant.dist': 'Jarak h =',
  'secant.caption': 'Untuk f(x) = x² di titik P. Geser h ke kecil: garis sekan (biru) menyatu dengan garis singgung (putus-putus) dan kemiringannya mendekati f′(1) = 2.',
} as const

const EN: Record<keyof typeof ID, string> = {
  'nav.materi': 'Lessons',
  'nav.practice': 'Practice',
  'nav.solver': 'Solver',
  'nav.about': 'About',
  'nav.aria': 'Main menu',
  'brand.aria': 'learnkulus, go to home',
  'title.home': 'learnkulus | Learn derivatives interactively',
  'title.materi': 'Lessons | learnkulus',
  'title.practice': 'Practice | learnkulus',
  'title.solver': 'Solver | learnkulus',
  'title.about': 'About | learnkulus',
  'lang.switch': 'Change language',
  'lang.title': 'Language: English',
  'theme.toDark': 'Switch to dark theme',
  'theme.toLight': 'Switch to light theme',

  'home.kicker': 'Basic calculus, interactive edition',
  'home.h1a': 'Understand ',
  'home.h1m': 'derivatives',
  'home.h1b': ', then practice until the patterns stick',
  'home.lead': 'Learn from the basic idea all the way to the chain rule and trigonometry. Practice problems are random, your answers are checked automatically, and the walkthrough explains where every number comes from.',
  'home.start': 'Start learning',
  'home.practiceNow': 'Jump to practice',
  'home.stat.lessons': 'lessons',
  'home.stat.problems': 'random problems',
  'home.stat.methods': 'solving methods',
  'home.map': 'Lesson map',
  'home.mapHint': 'Follow the order, or jump to the topic you need.',
  'home.why': 'Why learnkulus?',
  'home.why1b': 'Every number has a source.',
  'home.why1': ' The walkthrough shows u, v, and their derivatives, not just the final result.',
  'home.why2b': 'Problems never run out.',
  'home.why2': ' Problems are generated randomly per topic, and answers are checked by value, so a different form still counts as correct.',
  'home.why3b': 'No account needed.',
  'home.why3': ' Progress is saved in your browser, and problem photos are read on your own device.',
  'home.more': 'Read more',
  'footer.copy': '© {year} Ricardo Gellael. All rights reserved.',
  'footer.made': 'learnkulus was made by Ricardo Gellael to learn calculus in a more enjoyable way.',
  'footer.about': 'About learnkulus',

  'materi.formulas': 'Formulas',
  'materi.examples': 'Examples',
  'materi.problem': 'Problem:',
  'materi.practiceTopic': 'Practice this topic',
  'materi.tryInSolver': 'Try it in the Solver',
  'materi.next': 'Next lesson',

  'practice.title': 'Practice',
  'practice.level': 'Level',
  'practice.stored': 'Saved in this browser',
  'practice.ask': "Find f'(x) if",
  'practice.placeholder': 'example: 3x^2 - 2x',
  'practice.check': 'Check',
  'practice.next': 'Next problem',
  'practice.correct': 'Correct! +10 XP. You have got this pattern down.',
  'practice.wrong': 'Not quite, and that is okay. Mistakes are part of learning. Let us see where it turned:',
  'topic.power': 'Power rule',
  'topic.product': 'Product rule',
  'topic.quotient': 'Quotient rule',
  'topic.chain': 'Chain rule',
  'topic.trig': 'Trigonometry',

  'solver.title': 'Derivative solver',
  'solver.intro': 'Type a function or take a photo of the problem, choose the solving method the problem asks for, then go through the steps one by one.',
  'solver.methodsAria': 'Solving method',
  'method.auto.label': 'Derivative rules',
  'method.auto.desc': 'Main path: the app picks the rule that fits the shape of the problem (power, product, quotient, chain, or trigonometry) and explains why it chose that rule.',
  'method.limit.label': 'Limit definition',
  'method.limit.desc': 'The "from scratch" path: uses the definition f′(x) = lim [f(x+h) − f(x)] / h, just as when the derivative was first discovered. Polynomials only, for example 3x^2 - 5x or (x+1)^3.',
  'method.expand.label': 'Expand first',
  'method.expand.desc': 'The "flatten first" path: the function is expanded into a sum of terms, then each term is differentiated with the power rule. Polynomials only.',
  'solver.fx': 'f(x) =',
  'solver.fxAria': 'Function f(x)',
  'solver.order': 'derivative {n}',
  'solver.compute': 'Compute',
  'solver.computing': 'Computing...',
  'solver.camera': 'Take a photo',
  'solver.gallery': 'Choose from gallery',
  'solver.try': 'Try:',
  'scan.title': 'This is what was read from your photo',
  'scan.seenAlt': 'Photo after conversion to black and white, as the reader sees it',
  'scan.raw': 'Raw text from the reader:',
  'scan.empty': '(empty)',
  'scan.into': 'Already entered into the f(x) field above:',
  'scan.fixes': 'Automatic clean-up applied:',
  'scan.alts': 'If the result above is wrong, try one of these other guesses:',
  'scan.lowconf': 'The reader is not very confident about this photo. ',
  'scan.warn': 'This text reader does not understand math, so small superscripts (x²) are often read as regular digits and minus signs are sometimes wrong. Check the f(x) field, fix it if needed, then click Compute.',
  'scan.tips': 'Photo tips: move the camera close to a single problem, use bright light, and avoid shadows. Printed text is much easier to read than handwriting.',
  'progress.preparing': 'Preparing the photo...',
  'progress.loadCore': 'Loading the reader engine...',
  'progress.init': 'Setting up the reader engine...',
  'progress.download': 'Downloading character data (first time only)...',
  'progress.reading': 'Reading the problem...',
  'err.generic': 'Something went wrong',
  'err.notImage': 'The file must be an image (JPG, PNG, or WEBP).',
  'err.badImage': 'The image could not be opened. Try taking the photo again or choose another image.',
  'err.noText': 'No problem text could be read. Try a closer, brighter photo that contains only one problem.',

  'fix.xDigits': 'Digits right after x were read as a power (x2 became x^2)',
  'fix.parenDigits': 'Digits right after a closing parenthesis were read as a power',
  'fix.addParen': 'Missing closing parentheses were added at the end',
  'fix.dropParen': 'Extra closing parentheses were removed',
  'fix.prefix': 'The "f(x) =" prefix was removed',
  'fix.rhs': 'Only the right side of the = sign was used',
  'fix.superscript': 'Superscript powers (x²) were converted to ^',
  'fix.minus': 'Minus signs were standardized',
  'fix.times': 'Multiplication signs were standardized',
  'fix.divide': 'Division signs were standardized',
  'fix.bracket': 'Square and curly brackets were changed to regular parentheses',
  'fix.sqrt': 'The root sign √ was changed to sqrt',
  'fix.quotes': 'Quotation marks were removed',
  'fix.bar': 'The vertical bar | was read as the digit 1',
  'fix.upperX': 'Capital X was changed to x',
  'fix.letterO': 'The letter O next to a digit was read as 0',
  'fix.lower': 'Capital letters were changed to lowercase',
  'fix.dropChars': 'Unrecognized characters were removed',
  'fix.letterX': 'A lone unrecognized letter was treated as x',
  'fix.twoAsX': 'No letter x was read. A slanted x is often read as the digit 2, so the digit 2 was treated as x',
  'fix.constTrig': 'A trig function with only digits inside (for example sin(52)) was treated as a misread: the trailing 2 was replaced with x',

  'steps.title': 'Walkthrough',
  'steps.count': '{n} steps',
  'steps.route': 'Route:',
  'steps.how': 'How to read the walkthrough',
  'steps.how1': 'Each large box is one rule: its formula, then the u and v we assign.',
  'steps.how2': 'The small boxes inside are side work to find the derivatives of u and v. Finish them first before returning to the parent box.',
  'steps.how3': 'Text like "from step N" can be tapped to jump to that step.',
  'steps.answer': 'Answer',
  'steps.on': 'This part',
  'steps.formula': 'Formula',
  'steps.why': 'Explanation',
  'steps.tidy': 'Tidying stages',
  'steps.assumed': 'Set up',
  'steps.calc': 'Calculation',
  'steps.kids': 'Work this out first',
  'steps.merge': 'Step {n}: plug into the formula',
  'steps.result': 'Result of this part',
  'steps.so': 'So',
  'steps.from': 'from',
  'steps.stepN': 'step {n}',
  'why.when': 'When to use it',
  'why.how': 'How',
  'why.warn': 'Watch out',
  'why.example': 'Example',
  'why.trick': 'Memory trick',
  'why.remember': 'Remember',

  'secant.aria': 'The secant line approaches the tangent line as h gets smaller',
  'secant.dist': 'Distance h =',
  'secant.caption': 'For f(x) = x² at point P. Slide h toward small: the secant line (blue) merges with the tangent line (dashed) and its slope approaches f′(1) = 2.',
}

const DICT: Record<Lang, Record<string, string>> = { id: ID, en: EN }

function storedLang(): Lang | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'id' || v === 'en' ? v : null
  } catch {
    return null
  }
}

/** Bawaan: Indonesia. Inggris hanya jika peramban tidak memuat bahasa Indonesia dan bahasa utamanya Inggris. */
function detectLang(): Lang {
  const list = (navigator.languages?.length ? navigator.languages : [navigator.language]).map((x) => (x ?? '').toLowerCase())
  if (list.some((x) => x === 'id' || x.startsWith('id-') || x === 'in' || x.startsWith('in-'))) return 'id'
  return list[0]?.startsWith('en') ? 'en' : 'id'
}

let current: Lang = storedLang() ?? detectLang()
const listeners = new Set<() => void>()

function apply(l: Lang) {
  document.documentElement.lang = l
}
apply(current)

function notify() {
  listeners.forEach((f) => f())
}

export const getLang = () => current

export function setLang(l: Lang) {
  if (l === current) return
  current = l
  apply(l)
  try {
    localStorage.setItem(KEY, l)
  } catch {
    /* penyimpanan diblokir: bahasa tetap berlaku untuk sesi ini */
  }
  notify()
}

// Sinkronkan antar tab.
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || (e.newValue !== 'id' && e.newValue !== 'en') || e.newValue === current) return
  current = e.newValue
  apply(current)
  notify()
})

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const s = DICT[lang][key] ?? DICT.id[key] ?? key
  return vars ? s.replace(/\{(\w+)\}/g, (_m, k: string) => String(vars[k] ?? `{${k}}`)) : s
}

/** Terjemahan di luar komponen React (mis. api.ts), memakai bahasa yang sedang aktif. */
export const tr = (key: string, vars?: Record<string, string | number>) => translate(current, key, vars)

const subscribe = (f: () => void) => {
  listeners.add(f)
  return () => {
    listeners.delete(f)
  }
}

export function useI18n() {
  const lang = useSyncExternalStore(subscribe, getLang, getLang)
  const t = useCallback((key: string, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang])
  return { lang, t, setLang }
}
