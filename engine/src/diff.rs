//! Turunan simbolik dengan langkah terperinci (u, v, turunannya, substitusi).

use crate::eval::eval;
use crate::expr::*;
use crate::lang::Lang;
use crate::simplify::simplify;

#[derive(Debug, Clone)]
pub struct Step {
    /// Penanda jenis langkah yang tidak bergantung bahasa (product, chain, merge:product, simplify, marker, ...).
    pub kind: String,
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
        Step { kind: "marker".to_string(), rule, formula: String::new(), applied_to, why: String::new(), details: vec![], result: String::new(), depth: 0 }
    }
}

fn kv(name: &str, e: &Expr) -> String {
    format!("{} = {}", name, e.latex())
}

fn arrow(e: &Expr) -> String {
    format!("\\Rightarrow\\; {}", e.latex())
}

fn uv_todo(l: Lang) -> String {
    l.p(r"u' \text{ dan } v'", r"u' \text{ and } v'")
}

fn begin(st: &mut Vec<Step>, e: &Expr, kind: &str, rule: &str, formula: &str, why: &str, depth: usize) -> usize {
    st.push(Step {
        kind: kind.to_string(),
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
fn finish_split(st: &mut Vec<Step>, i: usize, plan: Vec<String>, give: Vec<String>, out: &Expr, kids: bool, depth: usize, todo: &str, l: Lang) {
    if !kids {
        let mut all = plan;
        all.extend(give);
        finish(st, i, all, out);
        return;
    }
    let mut plan = plan;
    plan.push(l.p(
        format!("\\text{{Berikutnya, cari turunannya: }}{}", todo),
        format!("\\text{{Next, find the derivatives: }}{}", todo),
    ));
    st[i].details = plan;
    let rule = st[i].rule.clone();
    let merge = Step {
        kind: format!("merge:{}", st[i].kind),
        rule: l.p(format!("Gabungkan: {}", rule), format!("Combine: {}", rule)),
        formula: st[i].formula.clone(),
        why: l.p(
            format!("Rincian di atas sudah selesai. Sekarang kembali ke langkah {}: masukkan nilai-nilai berikut ke rumusnya.", i + 1),
            format!("The detail above is done. Back to step {}: plug the following values into its formula.", i + 1),
        ),
        applied_to: st[i].applied_to.clone(),
        details: give,
        result: simplify(out).latex(),
        depth,
    };
    st.push(merge);
}

/// Baris "u' = ... (asalnya)" yang menunjukkan dari mana nilai turunan itu berasal.
fn dk(name: &str, child: &Expr, d: &Expr, r: Option<usize>, l: Lang) -> String {
    let note = match r {
        Some(n) => l.p(format!("hasil langkah {}", n), format!("result of step {}", n)),
        None if child.has_x() => l.p("turunan x adalah 1", "derivative of x is 1"),
        None => l.p("konstanta, turunannya 0", "constant, derivative is 0"),
    };
    format!("{}' = {}\\quad\\text{{({})}}", name, d.latex(), note)
}

/// Turunkan bagian anak; kembalikan hasil disederhanakan dan nomor langkah rinciannya.
fn child(e: &Expr, st: &mut Vec<Step>, depth: usize, l: Lang) -> Result<(Expr, Option<usize>), String> {
    let n = st.len();
    let d = simplify(&go(e, st, depth, l)?);
    Ok((d, if st.len() > n { Some(n + 1) } else { None }))
}

pub fn diff(e: &Expr, st: &mut Vec<Step>, l: Lang) -> Result<Expr, String> {
    go(e, st, 0, l)
}

fn go(e: &Expr, st: &mut Vec<Step>, depth: usize, l: Lang) -> Result<Expr, String> {
    if !e.has_x() {
        return Ok(num(0.0));
    }
    let dp = depth + 1;
    Ok(match e {
        Expr::Num(_) => num(0.0),
        Expr::X => num(1.0),
        Expr::Neg(a) => neg(go(a, st, depth, l)?),
        Expr::Add(a, b) | Expr::Sub(a, b) => {
            let plus = matches!(e, Expr::Add(..));
            let (kind, rule, formula, why) = if plus {
                (
                    "sum",
                    l.p("Aturan jumlah", "Sum rule"),
                    r"(u+v)' = u' + v'",
                    l.p(
                        "Kapan: fungsi berupa dua bagian yang dijumlahkan.\nCara: beri nama u dan v untuk kedua bagian, turunkan masing-masing, lalu jumlahkan hasilnya.",
                        "When: the function is two parts added together.\nHow: name the parts u and v, differentiate each, then add the results.",
                    ),
                )
            } else {
                (
                    "diff",
                    l.p("Aturan selisih", "Difference rule"),
                    r"(u-v)' = u' - v'",
                    l.p(
                        "Kapan: fungsi berupa dua bagian yang dikurangkan.\nCara: beri nama u dan v, turunkan masing-masing, lalu kurangkan hasilnya.\nAwas: tanda minus berlaku untuk seluruh v', bukan hanya suku pertamanya.",
                        "When: the function is two parts subtracted.\nHow: name the parts u and v, differentiate each, then subtract the results.\nWatch out: the minus sign applies to all of v', not only its first term.",
                    ),
                )
            };
            let i = begin(st, e, kind, &rule, formula, &why, depth);
            let (da, ra) = child(a, st, dp, l)?;
            let (db, rb) = child(b, st, dp, l)?;
            let out = if plus { add(da.clone(), db.clone()) } else { sub(da.clone(), db.clone()) };
            finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra, l), dk("v", b, &db, rb, l), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, &uv_todo(l), l);
            out
        }
        Expr::Mul(a, b) => {
            if !a.has_x() || !b.has_x() {
                let (c, u) = if !a.has_x() { (a, b) } else { (b, a) };
                let rule = l.p("Aturan kelipatan konstanta", "Constant multiple rule");
                let why = l.p(
                    "Kapan: ada faktor angka c yang tidak memuat x.\nCara: biarkan c di tempatnya, turunkan faktor lainnya (u), lalu kalikan lagi dengan c.",
                    "When: there is a numeric factor c without x.\nHow: leave c where it is, differentiate the other factor (u), then multiply by c again.",
                );
                let i = begin(st, e, "const-mult", &rule, r"(c\,u)' = c\,u'", &why, depth);
                let (du, ru) = child(u, st, dp, l)?;
                let out = mul(c.as_ref().clone(), du.clone());
                finish_split(st, i, vec![kv("c", c), kv("u", u)], vec![dk("u", u, &du, ru, l), arrow(&out)], &out, ru.is_some(), depth, "u'", l);
                out
            } else {
                let rule = l.p("Aturan perkalian", "Product rule");
                let why = l.p(
                    "Kapan: fungsi berupa hasil kali dua faktor yang sama-sama memuat x.\nCara: misalkan faktor pertama u dan faktor kedua v. Cari u' dan v' dulu, lalu masukkan ke rumus u'v + uv'.\nAwas: turunan hasil kali bukan u'·v'. Ini kesalahan yang paling sering terjadi.",
                    "When: the function is a product of two factors that both contain x.\nHow: let the first factor be u and the second v. Find u' and v' first, then plug them into u'v + uv'.\nWatch out: the derivative of a product is not u'·v'. This is the most common mistake.",
                );
                let i = begin(st, e, "product", &rule, r"(uv)' = u'v + uv'", &why, depth);
                let (da, ra) = child(a, st, dp, l)?;
                let (db, rb) = child(b, st, dp, l)?;
                let out = add(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone()));
                finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra, l), dk("v", b, &db, rb, l), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, &uv_todo(l), l);
                out
            }
        }
        Expr::Div(a, b) => {
            if !b.has_x() {
                let rule = l.p("Aturan kelipatan konstanta", "Constant multiple rule");
                let why = l.p(
                    "Kapan: penyebutnya hanya angka c, tanpa x.\nCara: turunkan pembilang (u), lalu bagi dengan c.",
                    "When: the denominator is just a number c, with no x.\nHow: differentiate the numerator (u), then divide by c.",
                );
                let i = begin(st, e, "const-mult", &rule, r"\left(\frac{u}{c}\right)' = \frac{u'}{c}", &why, depth);
                let (du, ru) = child(a, st, dp, l)?;
                let out = div(du.clone(), b.as_ref().clone());
                finish_split(st, i, vec![kv("u", a), kv("c", b)], vec![dk("u", a, &du, ru, l), arrow(&out)], &out, ru.is_some(), depth, "u'", l);
                out
            } else {
                let rule = l.p("Aturan hasil bagi", "Quotient rule");
                let why = l.p(
                    "Kapan: ada x di penyebut.\nCara: misalkan u pembilang dan v penyebut. Cari u' dan v', lalu masukkan ke rumus (u'v − uv') / v².\nAwas: urutan pengurangan tidak boleh tertukar. Suku pertama selalu u'v.",
                    "When: there is x in the denominator.\nHow: let u be the numerator and v the denominator. Find u' and v', then plug them into (u'v − uv') / v².\nWatch out: the order of subtraction must not be swapped. The first term is always u'v.",
                );
                let i = begin(st, e, "quotient", &rule, r"\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^{2}}", &why, depth);
                let (da, ra) = child(a, st, dp, l)?;
                let (db, rb) = child(b, st, dp, l)?;
                let out = div(
                    sub(mul(da.clone(), b.as_ref().clone()), mul(a.as_ref().clone(), db.clone())),
                    pow(b.as_ref().clone(), 2.0),
                );
                finish_split(st, i, vec![kv("u", a), kv("v", b)], vec![dk("u", a, &da, ra, l), dk("v", b, &db, rb, l), arrow(&out)], &out, ra.is_some() || rb.is_some(), depth, &uv_todo(l), l);
                out
            }
        }
        Expr::Pow(a, b) => {
            if b.has_x() {
                return Err(l.p("Pangkat dengan eksponen berisi x belum didukung", "Exponents that contain x are not supported yet"));
            }
            let n = eval(b, 0.0);
            if matches!(**a, Expr::X) {
                let rule = l.p("Aturan pangkat", "Power rule");
                let why = l.p(
                    "Kapan: x dipangkatkan bilangan tetap n.\nCara: pangkat n turun menjadi pengali di depan, lalu pangkat barunya n − 1.\nContoh: x⁵ menjadi 5x⁴.",
                    "When: x is raised to a fixed number n.\nHow: the exponent n comes down as a multiplier, and the new exponent is n − 1.\nExample: x⁵ becomes 5x⁴.",
                );
                let i = begin(st, e, "power", &rule, r"(x^{n})' = n\,x^{n-1}", &why, depth);
                let out = mul(num(n), pow(Expr::X, n - 1.0));
                finish(st, i, vec![kv("n", &num(n)), arrow(&out)], &out);
                out
            } else {
                let rule = l.p("Aturan rantai (pangkat)", "Chain rule (power)");
                let why = l.p(
                    "Kapan: yang dipangkatkan bukan x polos, melainkan ekspresi u.\nCara: turunkan pangkatnya seperti biasa dengan u dibiarkan utuh (n·uⁿ⁻¹), lalu kalikan dengan u', turunan dari u.\nAwas: lupa mengalikan u' adalah kesalahan paling umum pada aturan rantai.",
                    "When: what is raised to the power is not plain x but an expression u.\nHow: differentiate the power as usual, leaving u intact (n·uⁿ⁻¹), then multiply by u', the derivative of u.\nWatch out: forgetting to multiply by u' is the most common chain rule mistake.",
                );
                let i = begin(st, e, "chain-power", &rule, r"(u^{n})' = n\,u^{n-1}\cdot u'", &why, depth);
                let (da, ra) = child(a, st, dp, l)?;
                let out = mul(mul(num(n), pow(a.as_ref().clone(), n - 1.0)), da.clone());
                finish_split(st, i, vec![kv("u", a), kv("n", &num(n))], vec![dk("u", a, &da, ra, l), arrow(&out)], &out, ra.is_some(), depth, "u'", l);
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
            let nm = if *f == F::Sqrt { l.p("akar", "square root") } else { f.name().to_string() };
            let simple = matches!(**a, Expr::X);
            let (kind, rule, why) = if simple {
                let hint = match f {
                    F::Sqrt => l.p(
                        "Ingat: akar u sama dengan u pangkat ½. Hasilnya u' dibagi 2√u.",
                        "Remember: the square root of u is u to the power ½. The result is u' divided by 2√u.",
                    ),
                    F::Cos | F::Csc | F::Cot => l.p(
                        "Trik hafal: fungsi berawalan 'co' (cos, csc, cot) turunannya selalu bertanda minus.",
                        "Memory trick: functions starting with 'co' (cos, csc, cot) always have a minus sign in their derivative.",
                    ),
                    _ => l.p(
                        "Trik hafal: pasangan 'co' (cos, csc, cot) bertanda minus, sedangkan sin, tan, sec tidak.",
                        "Memory trick: the 'co' functions (cos, csc, cot) get a minus sign, while sin, tan, sec do not.",
                    ),
                };
                (
                    "basic",
                    l.p("Turunan fungsi dasar", "Basic function derivative"),
                    l.p(
                        format!("Kapan: fungsi {} dengan x polos di dalamnya.\nCara: pakai turunan dasarnya langsung. Aturan rantai belum diperlukan.\n{}", nm, hint),
                        format!("When: a {} function with plain x inside.\nHow: use its basic derivative directly. The chain rule is not needed yet.\n{}", nm, hint),
                    ),
                )
            } else {
                (
                    "chain",
                    l.p("Aturan rantai", "Chain rule"),
                    l.p(
                        format!("Kapan: di dalam fungsi {} ada ekspresi u yang bukan x polos.\nCara: turunkan fungsi luarnya dengan u dibiarkan utuh, lalu kalikan dengan u', turunan dari u.", nm),
                        format!("When: inside the {} function there is an expression u that is not plain x.\nHow: differentiate the outer function leaving u intact, then multiply by u', the derivative of u.", nm),
                    ),
                )
            };
            let i = begin(st, e, kind, &rule, formula, &why, depth);
            let u = a.as_ref().clone();
            let (du, ru) = child(a, st, dp, l)?;
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
                (vec![kv("u", &u)], vec![dk("u", &u, &du, ru, l), arrow(&out)])
            };
            finish_split(st, i, plan, give, &out, ru.is_some(), depth, "u'", l);
            out
        }
    })
}
