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
      'Bayangkan kamu naik motor. Speedometer tidak menunjukkan jarak total, melainkan seberapa cepat posisimu berubah pada detik itu juga. Itulah turunan: ukuran seberapa cepat nilai fungsi berubah di satu titik. Di grafik, turunan adalah kemiringan garis singgung. Cara mendapatkannya cerdik: tarik garis sekan lewat dua titik yang berjarak h, lalu rapatkan kedua titik itu sampai h mendekati nol. Garis sekan pun "menyatu" menjadi garis singgung (coba geser slider di Beranda!).',
    rules: [{ name: 'Definisi turunan', tex: r`f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}` }],
    examples: [
      {
        q: r`f(x)=x^{2}`,
        steps: [
          r`f'(x)=\lim_{h\to0}\frac{(x+h)^2-x^2}{h}`,
          r`=\lim_{h\to0}\frac{x^2+2xh+h^2-x^2}{h}=\lim_{h\to0}\frac{2xh+h^2}{h}`,
          r`=\lim_{h\to0}(2x+h)`,
        ],
        ans: r`f'(x)=2x`,
      },
    ],
    tip: 'Cara membaca hasilnya: turunan positif berarti grafik sedang naik, negatif berarti turun, dan nol berarti grafik datar sesaat (puncak atau lembah). Aturan-aturan di materi berikutnya adalah jalan pintas dari definisi ini, jadi kamu tidak perlu menghitung limit setiap kali.',
  },
  {
    id: 'pangkat',
    title: 'Aturan pangkat dan jumlah',
    summary: 'Turunan x pangkat n, konstanta, jumlah, dan selisih',
    intro:
      'Ini jurus dasar yang akan kamu pakai terus. Pangkat "turun" menjadi pengali di depan, lalu pangkat baru dikurangi satu. Konstanta? Ia diam saja, turunannya nol. Suku-suku yang dijumlahkan atau dikurangkan boleh diturunkan satu per satu. Bertemu akar atau pecahan? Ubah dulu menjadi pangkat: akar x sama dengan x pangkat setengah, dan 1/x² sama dengan x pangkat min dua.',
    rules: [
      { name: 'Pangkat', tex: r`(x^{n})'=n\,x^{n-1}` },
      { name: 'Konstanta', tex: r`(c)'=0,\qquad (c\,u)'=c\,u'` },
      { name: 'Jumlah dan selisih', tex: r`(u\pm v)'=u'\pm v'` },
    ],
    examples: [
      {
        q: r`f(x)=3x^{4}-2x^{2}+7`,
        steps: [
          r`(3x^{4})'=3\cdot 4x^{3}=12x^{3}`,
          r`(-2x^{2})'=-2\cdot 2x=-4x`,
          r`(7)'=0`,
          r`f'(x)=12x^{3}-4x+0`,
        ],
        ans: r`f'(x)=12x^{3}-4x`,
      },
      {
        q: r`f(x)=\dfrac{1}{x^{2}}`,
        steps: [r`f(x)=x^{-2}\quad\text{(ubah jadi pangkat)}`, r`f'(x)=-2x^{-3}`],
        ans: r`f'(x)=-\dfrac{2}{x^{3}}`,
      },
      {
        q: r`f(x)=\sqrt{x}`,
        steps: [r`f(x)=x^{1/2}\quad\text{(akar = pangkat setengah)}`, r`f'(x)=\tfrac{1}{2}x^{-1/2}`],
        ans: r`f'(x)=\dfrac{1}{2\sqrt{x}}`,
      },
    ],
    tip: 'Mantra cepat: "kalikan pangkatnya, lalu kurangi pangkatnya". Cek diri: turunan dari x adalah 1, karena x = x¹ menjadi 1·x⁰ = 1.',
    practice: 'power',
  },
  {
    id: 'perkalian',
    title: 'Aturan perkalian',
    summary: 'Turunan dari dua fungsi yang dikalikan',
    intro:
      'Godaan terbesar: menurunkan dua faktor lalu mengalikannya. Jangan! Kalau f(x) = x · x = x², turunannya 2x, padahal 1 · 1 hanya 1. Dua faktor sama-sama bergerak, jadi giliran dibagi: turunkan faktor pertama sementara yang kedua diam, lalu turunkan faktor kedua sementara yang pertama diam, kemudian jumlahkan keduanya.',
    rules: [{ name: 'Perkalian', tex: r`(u\,v)'=u'v+u\,v'` }],
    examples: [
      {
        q: r`f(x)=(x^{2}+1)(x-3)`,
        steps: [
          r`u=x^{2}+1,\;u'=2x`,
          r`v=x-3,\;v'=1`,
          r`f'(x)=2x(x-3)+(x^{2}+1)(1)`,
          r`=2x^{2}-6x+x^{2}+1`,
        ],
        ans: r`f'(x)=3x^{2}-6x+1`,
      },
      {
        q: r`f(x)=x^{3}(2x+1)`,
        steps: [
          r`u=x^{3},\;u'=3x^{2}`,
          r`v=2x+1,\;v'=2`,
          r`f'(x)=3x^{2}(2x+1)+x^{3}\cdot 2`,
          r`=6x^{3}+3x^{2}+2x^{3}`,
        ],
        ans: r`f'(x)=8x^{3}+3x^{2}`,
      },
    ],
    tip: 'Cara memeriksa: kalau bentuknya mudah dijabarkan, jabarkan dulu lalu turunkan dengan aturan pangkat. Contoh kedua: x³(2x+1) = 2x⁴ + x³, turunannya 8x³ + 3x². Hasilnya sama, kan?',
    practice: 'product',
  },
  {
    id: 'hasil-bagi',
    title: 'Aturan hasil bagi',
    summary: 'Turunan pecahan yang pembilang dan penyebutnya berisi x',
    intro:
      'Untuk pecahan, polanya mudah diingat kalau kamu hafal ceritanya: bawah kali turunan atas, dikurangi atas kali turunan bawah, semuanya dibagi bawah kuadrat. Urutan pengurangannya penting. Kalau tertukar, tanda hasilmu berbalik!',
    rules: [{ name: 'Hasil bagi', tex: r`\left(\frac{u}{v}\right)'=\frac{u'v-u\,v'}{v^{2}}` }],
    examples: [
      {
        q: r`f(x)=\dfrac{x}{x^{2}+4}`,
        steps: [
          r`u=x,\;u'=1`,
          r`v=x^{2}+4,\;v'=2x`,
          r`f'(x)=\dfrac{1\cdot(x^{2}+4)-x\cdot 2x}{(x^{2}+4)^{2}}`,
          r`=\dfrac{x^{2}+4-2x^{2}}{(x^{2}+4)^{2}}`,
        ],
        ans: r`f'(x)=\dfrac{4-x^{2}}{(x^{2}+4)^{2}}`,
      },
      {
        q: r`f(x)=\dfrac{x^{2}+1}{x-1}`,
        steps: [
          r`u=x^{2}+1,\;u'=2x`,
          r`v=x-1,\;v'=1`,
          r`f'(x)=\dfrac{2x(x-1)-(x^{2}+1)\cdot 1}{(x-1)^{2}}`,
          r`=\dfrac{2x^{2}-2x-x^{2}-1}{(x-1)^{2}}`,
        ],
        ans: r`f'(x)=\dfrac{x^{2}-2x-1}{(x-1)^{2}}`,
      },
    ],
    tip: 'Kalau penyebutnya hanya angka (misalnya x²/3), tidak perlu aturan ini. Cukup tulis sebagai (1/3)x² lalu pakai aturan pangkat.',
    practice: 'quotient',
  },
  {
    id: 'rantai',
    title: 'Aturan rantai',
    summary: 'Turunan fungsi di dalam fungsi',
    intro:
      'Bayangkan boneka matryoshka: ada boneka kecil di dalam boneka besar. Untuk fungsi di dalam fungsi, buka lapisan luar lebih dulu (turunkan bagian luar dengan isinya dibiarkan utuh), lalu kalikan dengan turunan isinya. Aturan ini paling sering dipakai bersama aturan lain, jadi sering juga menjadi sumber salah hitung.',
    rules: [
      { name: 'Rantai', tex: r`\big(f(g(x))\big)'=f'(g(x))\cdot g'(x)` },
      { name: 'Pangkat dengan rantai', tex: r`(u^{n})'=n\,u^{n-1}\cdot u'` },
      { name: 'Akar dengan rantai', tex: r`(\sqrt{u})'=\frac{u'}{2\sqrt{u}}` },
    ],
    examples: [
      {
        q: r`f(x)=(x^{2}+3)^{5}`,
        steps: [r`u=x^{2}+3,\;u'=2x`, r`f'(x)=5u^{4}\cdot u'`, r`=5(x^{2}+3)^{4}\cdot 2x`],
        ans: r`f'(x)=10x(x^{2}+3)^{4}`,
      },
      {
        q: r`f(x)=\sin 3x`,
        steps: [r`u=3x,\;u'=3`, r`f'(x)=\cos(3x)\cdot 3`],
        ans: r`f'(x)=3\cos 3x`,
      },
      {
        q: r`f(x)=\sqrt{x^{2}+1}`,
        steps: [r`u=x^{2}+1,\;u'=2x`, r`f'(x)=\dfrac{2x}{2\sqrt{x^{2}+1}}`],
        ans: r`f'(x)=\dfrac{x}{\sqrt{x^{2}+1}}`,
      },
    ],
    tip: 'Dua pertanyaan sakti: "mana bagian luar, mana bagian dalam?" lalu "sudahkah aku mengalikan dengan turunan bagian dalam?" Lupa mengalikan u′ adalah kesalahan nomor satu di materi ini.',
    practice: 'chain',
  },
  {
    id: 'trigonometri',
    title: 'Turunan fungsi trigonometri',
    summary: 'sin, cos, tan, sec, csc, dan cot',
    intro:
      'Ada enam turunan dasar yang perlu dihafal. Trik pengingatnya: fungsi berawalan "co" (cos, csc, cot) turunannya selalu bertanda negatif. Kalau argumennya bukan x polos, gabungkan dengan aturan rantai: turunkan fungsi trigonometrinya, lalu kalikan dengan turunan argumennya.',
    rules: [
      { name: 'sin dan cos', tex: r`(\sin x)'=\cos x,\qquad (\cos x)'=-\sin x` },
      { name: 'tan dan sec', tex: r`(\tan x)'=\sec^{2}x,\qquad (\sec x)'=\sec x\tan x` },
      { name: 'cot dan csc', tex: r`(\cot x)'=-\csc^{2}x,\qquad (\csc x)'=-\csc x\cot x` },
    ],
    examples: [
      {
        q: r`f(x)=x^{2}\cos x`,
        steps: [r`u=x^{2},\;u'=2x`, r`v=\cos x,\;v'=-\sin x`, r`f'(x)=2x\cos x+x^{2}(-\sin x)`],
        ans: r`f'(x)=2x\cos x-x^{2}\sin x`,
      },
      {
        q: r`f(x)=\cos(x^{2})`,
        steps: [r`u=x^{2},\;u'=2x`, r`f'(x)=-\sin(x^{2})\cdot 2x`],
        ans: r`f'(x)=-2x\sin(x^{2})`,
      },
    ],
    tip: 'Pasangan yang mudah tertukar: turunan sin adalah cos (positif), turunan cos adalah MINUS sin. Kalau ragu, ingat bahwa grafik cos mulai dari puncak lalu menurun, jadi kemiringan awalnya negatif.',
    practice: 'trig',
  },
  {
    id: 'tingkat-tinggi',
    title: 'Turunan tingkat tinggi',
    summary: 'Menurunkan hasil turunan lagi',
    intro:
      'Turunan kedua adalah turunan dari turunan pertama, dan seterusnya. Contoh nyata: posisi mobil diturunkan sekali menjadi kecepatan, diturunkan lagi menjadi percepatan. Jadi turunan kedua memberi tahu bagaimana kemiringan itu sendiri berubah, misalnya apakah kamu sedang menginjak gas atau rem.',
    rules: [{ name: 'Notasi', tex: r`f''(x)=\big(f'(x)\big)',\qquad f'''(x)=\big(f''(x)\big)'` }],
    examples: [
      {
        q: r`f(x)=x^{4}-3x^{2}`,
        steps: [r`f'(x)=4x^{3}-6x`, r`f''(x)=12x^{2}-6`, r`f'''(x)=24x`],
        ans: r`f''(x)=12x^{2}-6`,
      },
    ],
    tip: 'Di halaman Penyelesai kamu bisa memilih turunan sampai orde 5 dan melihat setiap tahapnya. Ingat: turunan terus mengecilkan pangkat, jadi polinomial akhirnya menjadi konstanta lalu nol.',
  },
]
