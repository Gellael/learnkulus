import { LESSONS, type Go } from './lessons'

const METHODS: { name: string; how: string; fit: string }[] = [
  { name: 'Aturan turunan', how: 'Aplikasi memilih aturan yang cocok dengan bentuk soal (pangkat, jumlah, perkalian, hasil bagi, rantai, atau trigonometri) dan menjelaskan alasannya.', fit: 'Semua fungsi yang didukung' },
  { name: 'Definisi limit', how: 'Memakai definisi f′(x) = lim [f(x+h) − f(x)] / h, persis seperti saat turunan pertama kali dirumuskan.', fit: 'Polinomial' },
  { name: 'Jabarkan dulu', how: 'Fungsi dijabarkan menjadi jumlah suku, lalu tiap suku diturunkan dengan aturan pangkat.', fit: 'Polinomial' },
]

const INPUTS: { what: string; write: string; ex: string }[] = [
  { what: 'Pangkat', write: 'Pakai tanda ^', ex: 'x^3, x^-2' },
  { what: 'Perkalian', write: 'Tanda kali boleh dihilangkan', ex: '3x, (x+1)(x-2)' },
  { what: 'Pecahan', write: 'Pakai tanda /', ex: '(x^2+1)/(x-1)' },
  { what: 'Akar', write: 'Pakai sqrt', ex: 'sqrt(x^2+1)' },
  { what: 'Trigonometri', write: 'sin, cos, tan, sec, csc, cot. Kurung boleh dihilangkan untuk isi yang sederhana', ex: 'sin 3x, cos(x^2)' },
]

export default function Tentang({ go }: { go: Go }) {
  return (
    <section className="about">
      <h2>Tentang learnkulus</h2>
      <p className="lead">
        learnkulus adalah tempat belajar turunan (kalkulus diferensial) dalam bahasa Indonesia. Tujuannya bukan sekadar memberi jawaban, tetapi
        memperlihatkan dari mana setiap angka dalam jawaban itu berasal, sehingga kamu bisa menirunya sendiri di ujian.
      </p>
      <div className="row">
        <button onClick={() => go('materi', { lesson: 0 })}>Mulai dari materi</button>
        <button className="ghost" onClick={() => go('solver')}>Coba penyelesai</button>
      </div>

      <div className="about-sec">
        <h3>Tiga bagian utama</h3>
        <div className="about-grid">
          <div className="about-card v">
            <h4>Materi</h4>
            <p>{LESSONS.length} materi berurutan, dari arti turunan sebagai kemiringan garis singgung sampai aturan rantai, trigonometri, dan turunan tingkat tinggi. Tiap materi berisi rumus dan contoh yang dikerjakan.</p>
          </div>
          <div className="about-card c">
            <h4>Latihan</h4>
            <p>Soal dibuat acak untuk lima topik: pangkat, perkalian, hasil bagi, rantai, dan trigonometri. Jawabanmu diperiksa otomatis, lalu pembahasan lengkap ditampilkan.</p>
          </div>
          <div className="about-card s">
            <h4>Penyelesai</h4>
            <p>Ketik fungsi apa saja atau foto soalnya, pilih jalur penyelesaian dan orde turunan (1 sampai 5), lalu bedah langkahnya satu per satu.</p>
          </div>
        </div>
      </div>

      <div className="about-sec">
        <h3>Bagaimana pembahasan dibuat</h3>
        <p>
          Pembahasan dihitung oleh mesin kalkulus simbolik yang menerapkan aturan turunan, bukan jawaban hafalan dan bukan teks yang dihasilkan model bahasa.
          Karena itu soal apa pun yang didukung mendapat pembahasan sesuai bentuknya sendiri. Urutannya selalu sama:
        </p>
        <ol className="about-flow">
          <li><b>Pilih aturan.</b> Mesin melihat bentuk fungsi, misalnya hasil kali dua faktor yang sama-sama memuat x, lalu memakai aturan perkalian.</li>
          <li><b>Misalkan bagian-bagiannya.</b> Fungsi dipecah menjadi u dan v supaya masing-masing bisa diturunkan sendiri.</li>
          <li><b>Kerjakan bagian dalam.</b> Turunan u dan v dicari dulu, dan bila perlu dipecah lagi dengan aturan lain.</li>
          <li><b>Gabungkan.</b> Hasil bagian dalam dimasukkan ke rumus aturannya.</li>
          <li><b>Sederhanakan.</b> Bentuk mentah dirapikan bertahap. Nilainya tidak berubah, hanya penampilannya.</li>
        </ol>
        <p className="muted">Teks seperti "dari langkah 3" di pembahasan menunjukkan asal sebuah nilai, dan bisa diketuk untuk melompat ke langkah itu.</p>
      </div>

      <div className="about-sec">
        <h3>Bagaimana jawabanmu diperiksa</h3>
        <p>
          Saat kamu meminta soal, server hanya mengirim soalnya, bukan kunci. Saat kamu menjawab, server membuat ulang soal yang sama dari kode acaknya,
          menghitung turunannya sendiri, lalu membandingkan jawabanmu dengan hasilnya di beberapa titik uji.
        </p>
        <p>
          Yang dibandingkan adalah nilainya, bukan tulisannya. Jadi <code>2x(x+1)</code> dan <code>2x^2 + 2x</code> sama-sama dianggap benar. Kalau salah, pembahasan
          ditampilkan supaya kamu bisa melihat di langkah mana jawabanmu menyimpang.
        </p>
      </div>

      <div className="about-sec">
        <h3>Tiga jalur penyelesaian</h3>
        <p>Soal ujian sering meminta cara tertentu, jadi penyelesai menyediakan tiga jalur.</p>
        <div className="about-scroll">
          <table className="about-table">
            <thead>
              <tr><th>Jalur</th><th>Cara kerja</th><th>Cocok untuk</th></tr>
            </thead>
            <tbody>
              {METHODS.map((m) => (
                <tr key={m.name}><td><b>{m.name}</b></td><td>{m.how}</td><td>{m.fit}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="about-sec">
        <h3>Cara menulis soal</h3>
        <div className="about-scroll">
          <table className="about-table">
            <thead>
              <tr><th>Bentuk</th><th>Cara menulis</th><th>Contoh</th></tr>
            </thead>
            <tbody>
              {INPUTS.map((r) => (
                <tr key={r.what}><td><b>{r.what}</b></td><td>{r.write}</td><td><code>{r.ex}</code></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="about-two">
          <div>
            <h4 className="about-sub">Sudah didukung</h4>
            <ul className="about-list">
              <li>Polinomial dan pangkat bilangan bulat, termasuk pangkat negatif</li>
              <li>Pecahan dan akar</li>
              <li>Fungsi trigonometri: sin, cos, tan, sec, csc, cot</li>
              <li>Aturan jumlah, selisih, perkalian, hasil bagi, dan rantai</li>
              <li>Turunan ke-1 sampai ke-5</li>
            </ul>
          </div>
          <div>
            <h4 className="about-sub">Belum didukung</h4>
            <ul className="about-list">
              <li>Fungsi eksponen dan logaritma (e^x, ln x)</li>
              <li>Pangkat yang eksponennya memuat x, misalnya 2^x</li>
              <li>Fungsi trigonometri invers</li>
              <li>Variabel selain x</li>
              <li>Turunan implisit</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="about-sec">
        <h3>Soal dari foto</h3>
        <p>
          Di Penyelesai, soal bisa difoto atau dipilih dari galeri. Foto dibaca di perangkatmu dengan OCR biasa, bukan AI, dan tidak diunggah ke server mana pun.
          Yang dikirim ke server hanya teks soal yang sudah muncul di kolom f(x).
        </p>
        <p>
          OCR tidak mengerti matematika, jadi hasilnya perlu diperiksa. Kesalahan yang paling sering: huruf x miring terbaca angka 2, dan pangkat kecil terbaca sebagai
          angka biasa. Aplikasi memperbaiki pola-pola umum itu dan menampilkan daftar perbaikannya, tetapi kolom f(x) selalu bisa kamu ubah sebelum menekan Hitung.
        </p>
        <p className="muted">Hasil terbaik: satu soal per foto, cahaya terang, tanpa bayangan, dan tulisan cetak.</p>
      </div>

      <div className="about-sec">
        <h3>Data dan privasi</h3>
        <ul className="about-list">
          <li>Tidak perlu akun.</li>
          <li>XP, level, dan streak latihan disimpan di browser perangkat ini, jadi tidak ikut pindah ke perangkat lain.</li>
          <li>Server tidak menyimpan soal maupun jawabanmu. Ia hanya menghitung dan membalas.</li>
          <li>Pertama kali memakai foto soal, browser mengunduh data huruf OCR sekali, lalu menyimpannya untuk pemakaian berikutnya.</li>
        </ul>
      </div>

      <div className="about-sec">
        <h3>Dibuat dengan</h3>
        <p>
          Antarmuka memakai React dan KaTeX untuk rumus. Mesin kalkulus ditulis dengan Rust tanpa pustaka tambahan, berjalan sebagai Cloudflare Worker, dan pembaca foto
          memakai Tesseract.js. learnkulus dibuat oleh Ricardo Gellael untuk belajar kalkulus dengan cara yang lebih menyenangkan.
        </p>
        <p className="muted">Menemukan hasil yang keliru? Catat soalnya beserta jalur dan orde yang dipilih, lalu sampaikan ke pembuat supaya bisa diperbaiki.</p>
      </div>
    </section>
  )
}
