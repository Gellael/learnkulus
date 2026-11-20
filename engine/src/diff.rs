//! Turunan simbolik dengan langkah terperinci (u, v, turunannya, substitusi).

use crate::eval::eval;
use crate::expr::*;
use crate::simplify::simplify;

#[derive(Debug, Clone)]
pub struct Step {
    pub rule: String,
    /// Rumus aturan (LaTeX).
    pub formula: String,
    /// Penjelasan: kenapa aturan ini dipakai dan cara memakainya.
    pub why: String,
    /// Bagian ekspresi yang sedang diturunkan (LaTeX).
    pub applied_to: String,
    /// Baris-baris rincian: u, v, u', v', substitusi (LaTeX).
    pub details: Vec<String>,
    /// Turunan bagian ini setelah disederhanakan (LaTeX).
    pub result: String,
    /// Kedalaman bersarang (0 = langkah utama).
    pub depth: usize,
}

impl Step {
    pub fn marker(rule: String, applied_to: String) -> Step {
        Step { rule, formula: String::new(), applied_to, why: String::new(), details: vec![], result: String::new(), depth: 0 }
    }
}

fn kv(name: &str, e: &Expr) -> String {
    format!("{} = {}", name, e.latex())
}

fn arrow(e: &Expr) -> String {
    format!("\\Rightarrow\\; {}", e.latex())
}

fn begin(st: &mut Vec<Step>, e: &Expr, rule: &str, formula: &str, why: &str, depth: usize) -> usize {
    st.push(Step {
        rule: rule.to_string(),
        formula: formula.to_string(),
        why: why.to_string(),
        applied_to: e.latex(),
        details: vec![],
        result: String::new(),
        depth,
    });
    st.len() - 1
}

fn finish(st: &mut Vec<Step>, i: usize, details: Vec<String>, out: &Expr) {
    st[i].details = details;
    st[i].result = simplify(out).latex();
}

/// Selesaikan kartu induk. Jika ada kartu rincian anak, kartu induk hanya memuat "rencana"
/// (u, v, ...), lalu kartu "Gabungkan" diletakkan SETELAH rincian anak supaya alurnya
/// terbaca berurutan: rencana -> cari bagian-bagiannya -> masukkan ke rumus.
fn finish_split(st: &mut Vec<Step>, i: usize, plan: Vec<String>, give: Vec<String>, out: &Expr, kids: bool, depth: usize, todo: &str) {
    if !kids {
        let mut all = plan;
        all.extend(give);
        finish(st, i, all, out);
        return;
    }
    let mut plan = plan;
    plan.push(format!("\\text{{Berikutnya, cari turunannya: }}{}", todo));
    st[i].details = plan;
    let merge = Step {
        rule: format!("Gabungkan: {}", st[i].rule),
        formula: st[i].formula.clone(),
        why: format!("Rincian di atas sudah selesai. Sekarang kembali ke langkah {}: masukkan nilai-nilai berikut ke rumusnya.", i + 1),
        applied_to: st[i].applied_to.clone(),
        details: give,
        result: simplify(out).latex(),
        depth,
    };
    st.push(merge);
}

/// Baris "u' = ... (asalnya)" yang menunjukkan dari mana nilai turunan itu berasal.
fn dk(name: &str, child: &Expr, d: &Expr, r: Option<usize>) -> String {
    let note = match r {
        Some(n) => format!("(hasil langkah {})", n),
        None if child.has_x() => "(turunan x adalah 1)".to_string(),
        None => "(konstanta, turunannya 0)".to_string(),
    };
    format!("{}' = {}\\quad\\text{{{}}}", name, d.latex(), note)
}

/// Turunkan bagian anak; kembalikan hasil disederhanakan dan nomor langkah rinciannya.
fn child(e: &Expr, st: &mut Vec<Step>, depth: usize) -> Result<(Expr, Option<usize>), String> {
    let n = st.len();
    let d = simplify(&go(e, st, depth)?);
    Ok((d, if st.len() > n { Some(n + 1) } else { None }))
}

pub fn diff(e: &Expr, st: &mut Vec<Step>) -> Result<Expr, String> {
    go(e, st, 0)
}

fn go(e: &Expr, st: &mut Vec<Step>, depth: usize) -> Result<Expr, String> {
    if !e.has_x() {
        return Ok(num(0.0));
    }
    let dp = depth + 1;
    Ok(match e {
        Expr::Num(_) => num(0.0),
        Expr::X => num(1.0),
        Expr::Neg(a) => neg(go(a, st, depth)?),
        Expr::Add(a, b) | Expr::Sub(a, b) => {
            let plus = matches!(e, Expr::Add(..));
            let (rule, formula, why) = if plus {
                ("Aturan jumlah", r"(u+v)' = u' + v'", "Fungsi ini gabungan dua bagian yang dijumlahkan. Kabar baiknya: turunan itu 'ramah' pada penjumlahan, jadi tiap bagian boleh dikerjakan sendiri-sendiri.\nCaranya: beri nama bagian pertama u dan bagian kedua v, turunkan masing-masing, lalu jumlahkan hasilnya.")
            } else {
                ("Aturan selisih", r"(u-v)' = u' - v'", "Mirip penjumlahan, hanya saja ada tanda minus di tengah. Tiap bagian tetap boleh dikerjakan sendiri-sendiri.\nCaranya: beri nama u dan v, turunkan masing-masing, lalu kurangkan hasilnya.\nAwas: tanda minus berlaku untuk seluruh turunan v, bukan hanya suku pertamanya.")
            };
            let i = begin(st, e, rule, formula, why, depth);
            let (da, ra) = child(a, st, dp)?;
            let (db, rb) = child(b, st, dp)?;
            let out = if plus { add(da.clone(), db.clone()) } else { sub(da.clone(), db.clone()) };
            finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, r"u' \text{ dan } v'");
            out
        }
        Expr::Mul(a, b) => {
            if !a.has_x() || !b.has_x() {
                let (c, u) = if !a.has_x() { (a, b) } else { (b, a) };
                let i = begin(
                    st, e, "Aturan kelipatan konstanta", r"(c\,u)' = c\,u'",
                    "Ada angka c yang tidak memuat x. Anggap c itu penumpang yang cuma ikut naik: ia tidak berubah saat diturunkan.\nCaranya: biarkan c di tempatnya, turunkan faktor lainnya (u), lalu kalikan lagi dengan c.",
                    depth,
                );
                let (du, ru) = child(u, st, dp)?;
                let out = mul(c.as_ref().clone(), du.clone());
                finish_split(st, i, vec![kv("c", c), kv("u", u)], vec![dk("u", u, &du, ru), arrow(&out)], &out, ru.is_some(), depth, "u'");
                out
            } else {
                let i = begin(
                    st, e, "Aturan perkalian", r"(uv)' = u'v + uv'",
                    "Dua faktor di sini sama-sama memuat x, jadi keduanya ikut 'bergerak'. Karena itu turunan hasil kali BUKAN u'·v' (jebakan paling populer!). Pakai rumus u'v + uv': giliran pertama, turunkan u saja sementara v diam; giliran kedua, turunkan v saja sementara u diam; lalu jumlahkan.\nCaranya: misalkan u faktor pertama dan v faktor kedua. Cari u' dan v' lebih dulu (rinciannya di langkah berikutnya), lalu masukkan ke rumus.",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let (db, rb) = child(b, st, dp)?;
                let out = add(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone()));
                finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, r"u' \text{ dan } v'");
                out
            }
        }
        Expr::Div(a, b) => {
            if !b.has_x() {
                let i = begin(
                    st, e, "Aturan kelipatan konstanta", r"\left(\frac{u}{c}\right)' = \frac{u'}{c}",
                    "Penyebutnya hanya angka c, jadi tidak ada x di bawah yang perlu diurus. Membagi dengan c sama saja dengan mengalikan 1/c.\nCaranya: turunkan pembilang (u), lalu bagi dengan c.",
                    depth,
                );
                let (du, ru) = child(a, st, dp)?;
                let out = div(du.clone(), b.as_ref().clone());
                finish_split(st, i, vec![kv("u", a), kv("c", b)], vec![dk("u", a, &du, ru), arrow(&out)], &out, ru.is_some(), depth, "u'");
                out
            } else {
                let i = begin(
                    st, e, "Aturan hasil bagi", r"\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^{2}}",
                    "Ada x di penyebut, jadi pecahan ini berubah dari atas dan dari bawah sekaligus. Polanya mudah diingat: bawah kali turunan atas, dikurangi atas kali turunan bawah, semuanya dibagi bawah kuadrat.\nCaranya: misalkan u pembilang (atas) dan v penyebut (bawah). Cari u' dan v', lalu masukkan ke rumus (u'v − uv') / v².\nAwas: urutan pengurangan tidak boleh tertukar. Yang pertama selalu u'v.",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let (db, rb) = child(b, st, dp)?;
                let out = div(
                    sub(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone())),
                    pow(b.as_ref().clone(), 2.0),
                );
                finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, r"u' \text{ dan } v'");
                out
            }
        }
        Expr::Pow(a, b) => {
            if b.has_x() {
                return Err("Pangkat dengan eksponen berisi x belum didukung".into());
            }
            let n = eval(b, 0.0);
            if matches!(**a, Expr::X) {
                let i = begin(
                    st, e, "Aturan pangkat", r"(x^{n})' = n\,x^{n-1}",
                    "Inilah jurus paling sering dipakai. Bayangkan pangkat n sebagai 'tiket' yang turun ke depan menjadi pengali, lalu pangkat barunya dikurangi 1.\nContoh cepat: x⁵ menjadi 5x⁴. Kalikan pangkatnya, lalu kurangi pangkatnya.",
                    depth,
                );
                let out = mul(num(n), pow(Expr::X, n - 1.0));
                finish(st, i, vec![kv("n", &num(n)), arrow(&out)], &out);
                out
            } else {
                let i = begin(
                    st, e, "Aturan rantai (pangkat)", r"(u^{n})' = n\,u^{n-1}\cdot u'",
                    "Yang dipangkatkan bukan x polos, melainkan sebuah 'paket' u. Bayangkan kado berlapis: buka bungkus luarnya dulu (turunkan pangkatnya, isi u dibiarkan utuh), lalu kalikan dengan turunan isi kado itu (u').\nCaranya: n·uⁿ⁻¹, lalu kalikan dengan u'.\nAwas: lupa mengalikan u' adalah kesalahan nomor satu pada aturan rantai!",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let out = mul(mul(num(n), pow(a.as_ref().clone(), n - 1.0)), da.clone());
                finish_split(st, i, vec![kv("u", a), kv("n", &num(n))], vec![dk("u", a, &da, ra), arrow(&out)], &out, ra.is_some(), depth, "u'");
                out
            }
        }
        Expr::Call(f, a) => {
            let formula = match f {
                F::Sin => r"(\sin u)' = \cos u \cdot u'",
                F::Cos => r"(\cos u)' = -\sin u \cdot u'",
                F::Tan => r"(\tan u)' = \sec^{2} u \cdot u'",
                F::Sec => r"(\sec u)' = \sec u \tan u \cdot u'",
                F::Csc => r"(\csc u)' = -\csc u \cot u \cdot u'",
                F::Cot => r"(\cot u)' = -\csc^{2} u \cdot u'",
                F::Sqrt => r"(\sqrt{u})' = \frac{u'}{2\sqrt{u}}",
            };
            let nm = if *f == F::Sqrt { "akar".to_string() } else { f.name().to_string() };
            let simple = matches!(**a, Expr::X);
            let (rule, why) = if simple {
                let hint = match f {
                    F::Sqrt => "Ingat: akar u sama dengan u pangkat ½. Hasilnya u' dibagi 2√u.",
                    F::Cos | F::Csc | F::Cot => "Trik hafal: fungsi berawalan 'co' (cos, csc, cot) turunannya selalu bertanda minus.",
                    _ => "Trik hafal: pasangan 'co' (cos, csc, cot) bertanda minus, sedangkan sin, tan, sec tidak.",
                };
                (
                    "Turunan fungsi dasar",
                    format!("Ini turunan dasar fungsi {} yang memang perlu dihafal. Karena di dalamnya hanya x polos, aturan rantai belum diperlukan.\n{}", nm, hint),
                )
            } else {
                (
                    "Aturan rantai",
                    format!("Di dalam fungsi {} ada \'isi\' u yang bukan x polos. Bayangkan boneka matryoshka: buka lapisan luar ({}) dengan isinya u dibiarkan utuh, lalu kalikan dengan turunan isinya (u').\nCaranya: cari u' dulu, lalu susun (turunan fungsi luar) × u'.", nm, nm),
                )
            };
            let i = begin(st, e, rule, formula, &why, depth);
            let u = a.as_ref().clone();
            let (du, ru) = child(a, st, dp)?;
            let outer = match f {
                F::Sin => call(F::Cos, u.clone()),
                F::Cos => neg(call(F::Sin, u.clone())),
                F::Tan => pow(call(F::Sec, u.clone()), 2.0),
                F::Sec => mul(call(F::Sec, u.clone()), call(F::Tan, u.clone())),
                F::Csc => neg(mul(call(F::Csc, u.clone()), call(F::Cot, u.clone()))),
                F::Cot => neg(pow(call(F::Csc, u.clone()), 2.0)),
                F::Sqrt => num(0.0),
            };
            let out = if *f == F::Sqrt {
                div(du.clone(), mul(num(2.0), call(F::Sqrt, u.clone())))
            } else {
                mul(outer, du.clone())
            };
            let (plan, give) = if simple {
                (vec![], vec![arrow(&out)])
            } else {
                (vec![kv("u", &u)], vec![dk("u", &u, &du, ru), arrow(&out)])
            };
            finish_split(st, i, plan, give, &out, ru.is_some(), depth, "u'");
            out
        }
    })
}
