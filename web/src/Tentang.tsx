import type { ReactNode } from 'react'
import { useI18n, type Lang } from './i18n'
import { lessonsFor, type Go } from './lessons'

type Copy = {
  title: string
  lead: string
  startBtn: string
  tryBtn: string
  threeTitle: string
  cards: { cls: string; h: string; p: (n: number) => string }[]
  howTitle: string
  howIntro: string
  flow: [string, string][]
  howNote: string
  checkTitle: string
  check1: string
  check2: ReactNode
  methodsTitle: string
  methodsIntro: string
  methodsHead: [string, string, string]
  methods: { name: string; how: string; fit: string }[]
  inputsTitle: string
  inputsHead: [string, string, string]
  inputs: { what: string; write: string; ex: string }[]
  supportedTitle: string
  supported: string[]
  unsupportedTitle: string
  unsupported: string[]
  photoTitle: string
  photo1: string
  photo2: string
  photoNote: string
  privacyTitle: string
  privacy: string[]
  builtTitle: string
  built: string
  report: string
}

const COPY: Record<Lang, Copy> = {
  id: {
    title: 'Tentang learnkulus',
    lead: 'learnkulus adalah tempat belajar turunan (kalkulus diferensial) dalam bahasa Indonesia dan Inggris. Tujuannya bukan sekadar memberi jawaban, tetapi memperlihatkan dari mana setiap angka dalam jawaban itu berasal, sehingga kamu bisa menirunya sendiri di ujian.',
    startBtn: 'Mulai dari materi',
    tryBtn: 'Coba penyelesai',
    threeTitle: 'Tiga bagian utama',
    cards: [
      { cls: 'v', h: 'Materi', p: (n) => `${n} materi berurutan, dari arti turunan sebagai kemiringan garis singgung sampai aturan rantai, trigonometri, dan turunan tingkat tinggi. Tiap materi berisi rumus dan contoh yang dikerjakan.` },
      { cls: 'c', h: 'Latihan', p: () => 'Soal dibuat acak untuk lima topik: pangkat, perkalian, hasil bagi, rantai, dan trigonometri. Jawabanmu diperiksa otomatis, lalu pembahasan lengkap ditampilkan.' },
      { cls: 's', h: 'Penyelesai', p: () => 'Ketik fungsi apa saja atau foto soalnya, pilih jalur penyelesaian dan orde turunan (1 sampai 5), lalu bedah langkahnya satu per satu.' },
    ],
    howTitle: 'Bagaimana pembahasan dibuat',
    howIntro: 'Pembahasan dihitung oleh mesin kalkulus simbolik yang menerapkan aturan turunan, bukan jawaban hafalan dan bukan teks yang dihasilkan model bahasa. Karena itu soal apa pun yang didukung mendapat pembahasan sesuai bentuknya sendiri. Urutannya selalu sama:',
    flow: [
      ['Pilih aturan.', ' Mesin melihat bentuk fungsi, misalnya hasil kali dua faktor yang sama-sama memuat x, lalu memakai aturan perkalian.'],
      ['Misalkan bagian-bagiannya.', ' Fungsi dipecah menjadi u dan v supaya masing-masing bisa diturunkan sendiri.'],
      ['Kerjakan bagian dalam.', ' Turunan u dan v dicari dulu, dan bila perlu dipecah lagi dengan aturan lain.'],
      ['Gabungkan.', ' Hasil bagian dalam dimasukkan ke rumus aturannya.'],
      ['Sederhanakan.', ' Bentuk mentah dirapikan bertahap. Nilainya tidak berubah, hanya penampilannya.'],
    ],
    howNote: 'Teks seperti "dari langkah 3" di pembahasan menunjukkan asal sebuah nilai, dan bisa diketuk untuk melompat ke langkah itu.',
    checkTitle: 'Bagaimana jawabanmu diperiksa',
    check1: 'Saat kamu meminta soal, server hanya mengirim soalnya, bukan kunci. Saat kamu menjawab, server membuat ulang soal yang sama dari kode acaknya, menghitung turunannya sendiri, lalu membandingkan jawabanmu dengan hasilnya di beberapa titik uji.',
    check2: (
      <>
        Yang dibandingkan adalah nilainya, bukan tulisannya. Jadi <code>2x(x+1)</code> dan <code>2x^2 + 2x</code> sama-sama dianggap benar. Kalau salah, pembahasan ditampilkan supaya kamu bisa melihat di langkah mana jawabanmu menyimpang.
      </>
    ),
    methodsTitle: 'Tiga jalur penyelesaian',
    methodsIntro: 'Soal ujian sering meminta cara tertentu, jadi penyelesai menyediakan tiga jalur.',
    methodsHead: ['Jalur', 'Cara kerja', 'Cocok untuk'],
    methods: [
      { name: 'Aturan turunan', how: 'Aplikasi memilih aturan yang cocok dengan bentuk soal (pangkat, jumlah, perkalian, hasil bagi, rantai, atau trigonometri) dan menjelaskan alasannya.', fit: 'Semua fungsi yang didukung' },
      { name: 'Definisi limit', how: 'Memakai definisi f′(x) = lim [f(x+h) − f(x)] / h, persis seperti saat turunan pertama kali dirumuskan.', fit: 'Polinomial' },
      { name: 'Jabarkan dulu', how: 'Fungsi dijabarkan menjadi jumlah suku, lalu tiap suku diturunkan dengan aturan pangkat.', fit: 'Polinomial' },
    ],
    inputsTitle: 'Cara menulis soal',
    inputsHead: ['Bentuk', 'Cara menulis', 'Contoh'],
    inputs: [
      { what: 'Pangkat', write: 'Pakai tanda ^', ex: 'x^3, x^-2' },
      { what: 'Perkalian', write: 'Tanda kali boleh dihilangkan', ex: '3x, (x+1)(x-2)' },
      { what: 'Pecahan', write: 'Pakai tanda /', ex: '(x^2+1)/(x-1)' },
      { what: 'Akar', write: 'Pakai sqrt', ex: 'sqrt(x^2+1)' },
      { what: 'Trigonometri', write: 'sin, cos, tan, sec, csc, cot. Kurung boleh dihilangkan untuk isi yang sederhana', ex: 'sin 3x, cos(x^2)' },
    ],
    supportedTitle: 'Sudah didukung',
    supported: [
      'Polinomial dan pangkat bilangan bulat, termasuk pangkat negatif',
      'Pecahan dan akar',
      'Fungsi trigonometri: sin, cos, tan, sec, csc, cot',
      'Aturan jumlah, selisih, perkalian, hasil bagi, dan rantai',
      'Turunan ke-1 sampai ke-5',
    ],
    unsupportedTitle: 'Belum didukung',
    unsupported: [
      'Fungsi eksponen dan logaritma (e^x, ln x)',
      'Pangkat yang eksponennya memuat x, misalnya 2^x',
      'Fungsi trigonometri invers',
      'Variabel selain x',
      'Turunan implisit',
    ],
    photoTitle: 'Soal dari foto',
    photo1: 'Di Penyelesai, soal bisa difoto atau dipilih dari galeri. Foto dibaca di perangkatmu dengan OCR biasa, bukan AI, dan tidak diunggah ke server mana pun. Yang dikirim ke server hanya teks soal yang sudah muncul di kolom f(x).',
    photo2: 'OCR tidak mengerti matematika, jadi hasilnya perlu diperiksa. Kesalahan yang paling sering: huruf x miring terbaca angka 2, dan pangkat kecil terbaca sebagai angka biasa. Aplikasi memperbaiki pola-pola umum itu dan menampilkan daftar perbaikannya, tetapi kolom f(x) selalu bisa kamu ubah sebelum menekan Hitung.',
    photoNote: 'Hasil terbaik: satu soal per foto, cahaya terang, tanpa bayangan, dan tulisan cetak.',
    privacyTitle: 'Data dan privasi',
    privacy: [
      'Tidak perlu akun.',
      'XP, level, streak latihan, serta pilihan tema dan bahasa disimpan di browser perangkat ini, jadi tidak ikut pindah ke perangkat lain.',
      'Server tidak menyimpan soal maupun jawabanmu. Ia hanya menghitung dan membalas.',
      'Pertama kali memakai foto soal, browser mengunduh data huruf OCR sekali, lalu menyimpannya untuk pemakaian berikutnya.',
    ],
    builtTitle: 'Dibuat dengan',
    built: 'Antarmuka memakai React dan KaTeX untuk rumus. Mesin kalkulus ditulis dengan Rust tanpa pustaka tambahan, berjalan sebagai Cloudflare Worker, dan pembaca foto memakai Tesseract.js. learnkulus dibuat oleh Ricardo Gellael untuk belajar kalkulus dengan cara yang lebih menyenangkan.',
    report: 'Menemukan hasil yang keliru? Catat soalnya beserta jalur dan orde yang dipilih, lalu sampaikan ke pembuat supaya bisa diperbaiki.',
  },
  en: {
    title: 'About learnkulus',
    lead: 'learnkulus is a place to learn derivatives (differential calculus) in Indonesian and English. The goal is not just to give answers, but to show where every number in the answer comes from, so you can reproduce it yourself on an exam.',
    startBtn: 'Start with the lessons',
    tryBtn: 'Try the solver',
    threeTitle: 'Three main parts',
    cards: [
      { cls: 'v', h: 'Lessons', p: (n) => `${n} lessons in order, from the meaning of the derivative as the slope of a tangent line to the chain rule, trigonometry, and higher-order derivatives. Each lesson has formulas and worked examples.` },
      { cls: 'c', h: 'Practice', p: () => 'Problems are generated randomly for five topics: power, product, quotient, chain, and trigonometry. Your answer is checked automatically, then the full walkthrough is shown.' },
      { cls: 's', h: 'Solver', p: () => 'Type any function or take a photo of the problem, choose a solving method and the derivative order (1 to 5), then go through the steps one by one.' },
    ],
    howTitle: 'How the walkthrough is made',
    howIntro: 'The walkthrough is computed by a symbolic calculus engine that applies the derivative rules. It is not a memorized answer and not text generated by a language model. That is why any supported problem gets a walkthrough that fits its own shape. The order is always the same:',
    flow: [
      ['Choose the rule.', ' The engine looks at the shape of the function, for example a product of two factors that both contain x, and uses the product rule.'],
      ['Name the parts.', ' The function is split into u and v so each can be differentiated on its own.'],
      ['Work out the inner parts.', ' The derivatives of u and v are found first, and split again with other rules if needed.'],
      ['Combine.', ' The results of the inner parts are plugged into the formula of the rule.'],
      ['Simplify.', ' The raw form is tidied up in stages. The value does not change, only the appearance.'],
    ],
    howNote: 'Text like "from step 3" in the walkthrough shows where a value came from, and can be tapped to jump to that step.',
    checkTitle: 'How your answer is checked',
    check1: 'When you ask for a problem, the server only sends the problem, not the key. When you answer, the server rebuilds the same problem from its random code, computes the derivative itself, then compares your answer with the result at several test points.',
    check2: (
      <>
        What is compared is the value, not the way it is written. So <code>2x(x+1)</code> and <code>2x^2 + 2x</code> are both counted as correct. If it is wrong, the walkthrough is shown so you can see at which step your answer went off track.
      </>
    ),
    methodsTitle: 'Three solving methods',
    methodsIntro: 'Exam problems often ask for a specific method, so the solver offers three.',
    methodsHead: ['Method', 'How it works', 'Suited for'],
    methods: [
      { name: 'Derivative rules', how: 'The app picks the rule that fits the shape of the problem (power, sum, product, quotient, chain, or trigonometry) and explains why.', fit: 'All supported functions' },
      { name: 'Limit definition', how: 'Uses the definition f′(x) = lim [f(x+h) − f(x)] / h, just as when the derivative was first formulated.', fit: 'Polynomials' },
      { name: 'Expand first', how: 'The function is expanded into a sum of terms, then each term is differentiated with the power rule.', fit: 'Polynomials' },
    ],
    inputsTitle: 'How to write a problem',
    inputsHead: ['Form', 'How to write it', 'Example'],
    inputs: [
      { what: 'Powers', write: 'Use the ^ sign', ex: 'x^3, x^-2' },
      { what: 'Multiplication', write: 'The multiplication sign can be omitted', ex: '3x, (x+1)(x-2)' },
      { what: 'Fractions', write: 'Use the / sign', ex: '(x^2+1)/(x-1)' },
      { what: 'Roots', write: 'Use sqrt', ex: 'sqrt(x^2+1)' },
      { what: 'Trigonometry', write: 'sin, cos, tan, sec, csc, cot. Parentheses can be omitted for simple arguments', ex: 'sin 3x, cos(x^2)' },
    ],
    supportedTitle: 'Supported',
    supported: [
      'Polynomials and whole-number powers, including negative powers',
      'Fractions and roots',
      'Trigonometric functions: sin, cos, tan, sec, csc, cot',
      'Sum, difference, product, quotient, and chain rules',
      'Derivatives from the 1st to the 5th',
    ],
    unsupportedTitle: 'Not supported yet',
    unsupported: [
      'Exponential and logarithmic functions (e^x, ln x)',
      'Powers whose exponent contains x, for example 2^x',
      'Inverse trigonometric functions',
      'Variables other than x',
      'Implicit differentiation',
    ],
    photoTitle: 'Problems from a photo',
    photo1: 'In the Solver, you can take a photo of a problem or pick one from the gallery. The photo is read on your device with ordinary OCR, not AI, and is not uploaded to any server. Only the problem text that already appears in the f(x) field is sent to the server.',
    photo2: 'OCR does not understand math, so the result needs checking. The most common mistakes: a slanted x read as the digit 2, and small superscripts read as regular digits. The app fixes those common patterns and shows a list of the fixes, but you can always edit the f(x) field before pressing Compute.',
    photoNote: 'Best results: one problem per photo, bright light, no shadows, and printed text.',
    privacyTitle: 'Data and privacy',
    privacy: [
      'No account needed.',
      'XP, level, practice streak, and your theme and language choices are saved in the browser of this device, so they do not move to other devices.',
      'The server does not store your problems or answers. It only computes and replies.',
      'The first time you use a problem photo, the browser downloads the OCR character data once, then keeps it for later use.',
    ],
    builtTitle: 'Built with',
    built: 'The interface uses React and KaTeX for formulas. The calculus engine is written in Rust with no extra libraries and runs as a Cloudflare Worker, and the photo reader uses Tesseract.js. learnkulus was made by Ricardo Gellael to learn calculus in a more enjoyable way.',
    report: 'Found a wrong result? Note the problem along with the method and order you chose, then pass it on to the maker so it can be fixed.',
  },
}

export default function Tentang({ go }: { go: Go }) {
  const { lang } = useI18n()
  const c = COPY[lang]
  const n = lessonsFor(lang).length

  return (
    <section className="about">
      <h2>{c.title}</h2>
      <p className="lead">{c.lead}</p>
      <div className="row">
        <button onClick={() => go('materi', { lesson: 0 })}>{c.startBtn}</button>
        <button className="ghost" onClick={() => go('solver')}>{c.tryBtn}</button>
      </div>

      <div className="about-sec">
        <h3>{c.threeTitle}</h3>
        <div className="about-grid">
          {c.cards.map((card) => (
            <div key={card.h} className={`about-card ${card.cls}`}>
              <h4>{card.h}</h4>
              <p>{card.p(n)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="about-sec">
        <h3>{c.howTitle}</h3>
        <p>{c.howIntro}</p>
        <ol className="about-flow">
          {c.flow.map(([b, rest]) => (
            <li key={b}><b>{b}</b>{rest}</li>
          ))}
        </ol>
        <p className="muted">{c.howNote}</p>
      </div>

      <div className="about-sec">
        <h3>{c.checkTitle}</h3>
        <p>{c.check1}</p>
        <p>{c.check2}</p>
      </div>

      <div className="about-sec">
        <h3>{c.methodsTitle}</h3>
        <p>{c.methodsIntro}</p>
        <div className="about-scroll">
          <table className="about-table">
            <thead>
              <tr>{c.methodsHead.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {c.methods.map((m) => (
                <tr key={m.name}><td><b>{m.name}</b></td><td>{m.how}</td><td>{m.fit}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="about-sec">
        <h3>{c.inputsTitle}</h3>
        <div className="about-scroll">
          <table className="about-table">
            <thead>
              <tr>{c.inputsHead.map((h) => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {c.inputs.map((r) => (
                <tr key={r.what}><td><b>{r.what}</b></td><td>{r.write}</td><td><code>{r.ex}</code></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="about-two">
          <div>
            <h4 className="about-sub">{c.supportedTitle}</h4>
            <ul className="about-list">{c.supported.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
          <div>
            <h4 className="about-sub">{c.unsupportedTitle}</h4>
            <ul className="about-list">{c.unsupported.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        </div>
      </div>

      <div className="about-sec">
        <h3>{c.photoTitle}</h3>
        <p>{c.photo1}</p>
        <p>{c.photo2}</p>
        <p className="muted">{c.photoNote}</p>
      </div>

      <div className="about-sec">
        <h3>{c.privacyTitle}</h3>
        <ul className="about-list">{c.privacy.map((x) => <li key={x}>{x}</li>)}</ul>
      </div>

      <div className="about-sec">
        <h3>{c.builtTitle}</h3>
        <p>{c.built}</p>
        <p className="muted">{c.report}</p>
      </div>
    </section>
  )
}
