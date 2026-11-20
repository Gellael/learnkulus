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
                ("Aturan jumlah", r"(u+v)' = u' + v'", "Fungsi ini berupa penjumlahan dua bagian. Beri nama u dan v, turunkan masing-masing, lalu jumlahkan hasilnya.")
            } else {
                ("Aturan selisih", r"(u-v)' = u' - v'", "Fungsi ini berupa pengurangan dua bagian. Beri nama u dan v, turunkan masing-masing, lalu kurangkan hasilnya.")
            };
            let i = begin(st, e, rule, formula, why, depth);
            let (da, ra) = child(a, st, dp)?;
            let (db, rb) = child(b, st, dp)?;
            let out = if plus { add(da.clone(), db.clone()) } else { sub(da.clone(), db.clone()) };
            finish(st, i, vec![kv("u", a), kv("v", b), dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out);
            out
        }
        Expr::Mul(a, b) => {
            if !a.has_x() || !b.has_x() {
                let (c, u) = if !a.has_x() { (a, b) } else { (b, a) };
                let i = begin(
                    st, e, "Aturan kelipatan konstanta", r"(c\,u)' = c\,u'",
                    "Ada faktor konstanta c yang tidak memuat x. Konstanta itu dibiarkan, lalu cukup turunkan faktor lainnya (u) dan kalikan kembali dengan c.",
                    depth,
                );
                let (du, ru) = child(u, st, dp)?;
                let out = mul(c.as_ref().clone(), du.clone());
                finish(st, i, vec![kv("c", c), kv("u", u), dk("u", u, &du, ru), arrow(&out)], &out);
                out
            } else {
                let i = begin(
                    st, e, "Aturan perkalian", r"(uv)' = u'v + uv'",
                    "Fungsi ini adalah hasil kali dua faktor yang sama-sama memuat x. Misalkan u faktor pertama dan v faktor kedua. Cari u' dan v' lebih dulu (rinciannya di langkah berikutnya), lalu masukkan ke rumus u'v + uv'.",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let (db, rb) = child(b, st, dp)?;
                let out = add(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone()));
                finish(st, i, vec![kv("u", a), kv("v", b), dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out);
                out
            }
        }
        Expr::Div(a, b) => {
            if !b.has_x() {
                let i = begin(
                    st, e, "Aturan kelipatan konstanta", r"\left(\frac{u}{c}\right)' = \frac{u'}{c}",
                    "Penyebutnya konstanta c. Cukup turunkan pembilang (u), lalu bagi dengan c.",
                    depth,
                );
                let (du, ru) = child(a, st, dp)?;
                let out = div(du.clone(), b.as_ref().clone());
                finish(st, i, vec![kv("u", a), kv("c", b), dk("u", a, &du, ru), arrow(&out)], &out);
                out
            } else {
                let i = begin(
                    st, e, "Aturan hasil bagi", r"\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^{2}}",
                    "Fungsi ini berbentuk pecahan dengan x di penyebut. Misalkan u pembilang dan v penyebut. Cari u' dan v', lalu masukkan ke rumus (u'v − uv') / v². Urutan pengurangan tidak boleh tertukar.",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let (db, rb) = child(b, st, dp)?;
                let out = div(
                    sub(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone())),
                    pow(b.as_ref().clone(), 2.0),
                );
                finish(st, i, vec![kv("u", a), kv("v", b), dk("u", a, &da, ra), dk("v", b, &db, rb), arrow(&out)], &out);
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
                    "Bentuknya x pangkat n. Pangkat n turun menjadi pengali di depan, dan pangkat barunya n − 1.",
                    depth,
                );
                let out = mul(num(n), pow(Expr::X, n - 1.0));
                finish(st, i, vec![kv("n", &num(n)), arrow(&out)], &out);
                out
            } else {
                let i = begin(
                    st, e, "Aturan rantai (pangkat)", r"(u^{n})' = n\,u^{n-1}\cdot u'",
                    "Yang dipangkatkan bukan x saja, melainkan sebuah fungsi u. Pakai aturan rantai: turunkan pangkatnya seperti biasa dengan u dipertahankan, lalu kalikan dengan turunan u (u').",
                    depth,
                );
                let (da, ra) = child(a, st, dp)?;
                let out = mul(mul(num(n), pow(a.as_ref().clone(), n - 1.0)), da.clone());
                finish(st, i, vec![kv("u", a), kv("n", &num(n)), dk("u", a, &da, ra), arrow(&out)], &out);
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
                ("Turunan fungsi dasar", format!("Ini turunan dasar fungsi {} yang perlu dihafal. Karena di dalamnya hanya x, aturan rantai tidak diperlukan.", nm))
            } else {
                ("Aturan rantai", format!("Di dalam fungsi {} ada bentuk u yang bukan sekadar x, jadi dipakai aturan rantai: turunkan fungsi luar ({}) dengan u dipertahankan, lalu kalikan dengan turunan bagian dalam u'.", nm, nm))
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
            let mut det = Vec::new();
            if !simple {
                det.push(kv("u", &u));
                det.push(dk("u", &u, &du, ru));
            }
            det.push(arrow(&out));
            finish(st, i, det, &out);
            out
        }
    })
}
