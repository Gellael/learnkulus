export type Page = 'home' | 'materi' | 'practice' | 'solver'
export type Go = (p: Page, opt?: { lesson?: number; topic?: string }) => void

export type Lesson = {
  id: string
  title: string
  summary: string
  intro: string
  rules: { name: string; tex: string }[]
  examples: { q: string; steps: string[]; ans: string }[]
  tip?: string
  practice?: string // id topik di halaman Latihan
}

const r = String.raw

export const LESSONS: Lesson[] = [
  {
    id: 'pengantar',
    title: 'Apa itu turunan?',
    summary: 'Kemiringan garis singgung dan laju perubahan',
    intro:
      'Turunan mengukur seberapa cepat nilai fungsi berubah di satu titik. Secara geometri, turunan adalah kemiringan garis singgung kurva di titik itu. Garis singgung didapat dari garis sekan yang kedua titiknya dirapatkan sampai jaraknya h mendekati nol (coba geser slider di Beranda).',
    rules: [{ name: 'Definisi turunan', tex: r`f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}` }],
    examples: [
      {
        q: r`f(x)=x^{2}`,
        steps: [
          r`f'(x)=\lim_{h\to0}\frac{(x+h)^2-x^2}{h}`,
          r`=\lim_{h\to0}\frac{2xh+h^2}{h}=\lim_{h\to0}(2x+h)`,
        ],
        ans: r`f'(x)=2x`,
      },
    ],
    tip: 'Aturan-aturan di materi berikutnya adalah jalan pintas dari definisi ini, jadi kamu tidak perlu menghitung limit setiap kali.',
  },
  {
    id: 'pangkat',
    title: 'Aturan pangkat dan jumlah',
    summary: 'Turunan x pangkat n, konstanta, jumlah, dan selisih',
    intro:
      'Ini aturan paling dasar. Pangkatnya turun jadi pengali dan pangkatnya berkurang satu. Konstanta menjadi nol, dan suku-suku yang dijumlahkan diturunkan satu per satu. Bentuk akar dan pecahan ditulis dulu sebagai pangkat.',
    rules: [
      { name: 'Pangkat', tex: r`(x^{n})'=n\,x^{n-1}` },
      { name: 'Konstanta', tex: r`(c)'=0,\qquad (c\,u)'=c\,u'` },
      { name: 'Jumlah dan selisih', tex: r`(u\pm v)'=u'\pm v'` },
    ],
    examples: [
      {
        q: r`f(x)=3x^{4}-2x^{2}+7`,
        steps: [r`f'(x)=3\cdot 4x^{3}-2\cdot 2x+0`],
        ans: r`f'(x)=12x^{3}-4x`,
      },
      {
        q: r`f(x)=\dfrac{1}{x^{2}}`,
        steps: [r`f(x)=x^{-2}`, r`f'(x)=-2x^{-3}`],
        ans: r`f'(x)=-\dfrac{2}{x^{3}}`,
      },
    ],
    practice: 'power',
  },
  {
    id: 'perkalian',
    title: 'Aturan perkalian',
    summary: 'Turunan dari dua fungsi yang dikalikan',
    intro:
      'Turunan perkalian bukan hasil kali turunannya. Turunkan fungsi pertama dan kalikan dengan yang kedua, lalu tambahkan fungsi pertama dikalikan turunan yang kedua.',
    rules: [{ name: 'Perkalian', tex: r`(u\,v)'=u'v+u\,v'` }],
    examples: [
      {
        q: r`f(x)=(x^{2}+1)(x-3)`,
        steps: [
          r`u=x^{2}+1,\;u'=2x`,
          r`v=x-3,\;v'=1`,
          r`f'(x)=2x(x-3)+(x^{2}+1)(1)`,
        ],
        ans: r`f'(x)=3x^{2}-6x+1`,
      },
    ],
    tip: 'Kalau bentuknya mudah dijabarkan dulu, hasilnya bisa dipakai untuk memeriksa jawabanmu.',
    practice: 'product',
  },
  {
    id: 'hasil-bagi',
    title: 'Aturan hasil bagi',
    summary: 'Turunan pecahan yang pembilang dan penyebutnya berisi x',
    intro:
      'Untuk pecahan, turunkan pembilang dikali penyebut, kurangi dengan pembilang dikali turunan penyebut, lalu bagi dengan kuadrat penyebut. Urutan pengurangannya penting.',
    rules: [{ name: 'Hasil bagi', tex: r`\left(\frac{u}{v}\right)'=\frac{u'v-u\,v'}{v^{2}}` }],
    examples: [
      {
        q: r`f(x)=\dfrac{x}{x^{2}+4}`,
        steps: [
          r`u=x,\;u'=1`,
          r`v=x^{2}+4,\;v'=2x`,
          r`f'(x)=\dfrac{1\cdot(x^{2}+4)-x\cdot 2x}{(x^{2}+4)^{2}}`,
        ],
        ans: r`f'(x)=\dfrac{4-x^{2}}{(x^{2}+4)^{2}}`,
      },
    ],
    practice: 'quotient',
  },
  {
    id: 'rantai',
    title: 'Aturan rantai',
    summary: 'Turunan fungsi di dalam fungsi',
    intro:
      'Kalau ada fungsi di dalam fungsi, turunkan bagian luarnya dengan bagian dalam dibiarkan, lalu kalikan dengan turunan bagian dalam. Ini aturan yang paling sering dipakai bersama aturan lain.',
    rules: [
      { name: 'Rantai', tex: r`\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)` },
      { name: 'Pangkat dengan rantai', tex: r`(u^{n})'=n\,u^{n-1}\cdot u'` },
    ],
    examples: [
      {
        q: r`f(x)=(x^{2}+3)^{5}`,
        steps: [r`u=x^{2}+3,\;u'=2x`, r`f'(x)=5u^{4}\cdot u'`],
        ans: r`f'(x)=10x(x^{2}+3)^{4}`,
      },
      {
        q: r`f(x)=\sin 3x`,
        steps: [r`u=3x,\;u'=3`, r`f'(x)=\cos(3x)\cdot 3`],
        ans: r`f'(x)=3\cos 3x`,
      },
    ],
    tip: 'Tanyakan dulu: mana bagian luar, mana bagian dalam? Lalu turunkan dari luar ke dalam.',
    practice: 'chain',
  },
  {
    id: 'trigonometri',
    title: 'Turunan fungsi trigonometri',
    summary: 'sin, cos, tan, sec, csc, dan cot',
    intro:
      'Hafalkan enam turunan dasar ini. Fungsi yang berawalan "co" (cos, csc, cot) turunannya bertanda negatif. Kalau argumennya bukan x saja, gabungkan dengan aturan rantai.',
    rules: [
      { name: 'sin dan cos', tex: r`(\sin x)'=\cos x,\qquad (\cos x)'=-\sin x` },
      { name: 'tan dan sec', tex: r`(\tan x)'=\sec^{2}x,\qquad (\sec x)'=\sec x\tan x` },
      { name: 'cot dan csc', tex: r`(\cot x)'=-\csc^{2}x,\qquad (\csc x)'=-\csc x\cot x` },
    ],
    examples: [
      {
        q: r`f(x)=x^{2}\cos x`,
        steps: [r`u=x^{2},\;v=\cos x`, r`f'(x)=2x\cos x+x^{2}(-\sin x)`],
        ans: r`f'(x)=2x\cos x-x^{2}\sin x`,
      },
    ],
    practice: 'trig',
  },
  {
    id: 'tingkat-tinggi',
    title: 'Turunan tingkat tinggi',
    summary: 'Menurunkan hasil turunan lagi',
    intro:
      'Turunan kedua adalah turunan dari turunan pertama, dan seterusnya. Turunan kedua memberi tahu bagaimana kemiringan itu sendiri berubah.',
    rules: [{ name: 'Notasi', tex: r`f''(x)=\big(f'(x)\big)',\qquad f'''(x)=\big(f''(x)\big)'` }],
    examples: [
      {
        q: r`f(x)=x^{4}-3x^{2}`,
        steps: [r`f'(x)=4x^{3}-6x`],
        ans: r`f''(x)=12x^{2}-6`,
      },
    ],
    tip: 'Di halaman Penyelesai kamu bisa memilih turunan sampai orde 5 dan melihat langkahnya.',
  },
]
