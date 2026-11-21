//! Aljabar polinom dua peubah (x dan h) untuk metode "definisi limit" dan "jabarkan dulu".

use crate::diff::Step;
use crate::eval::eval;
use crate::expr::*;
use crate::lang::Lang;
use std::cmp::Reverse;
use std::collections::BTreeMap;

type Poly = BTreeMap<(u32, u32), f64>; // (pangkat x, pangkat h) -> koefisien

fn not_poly(l: Lang) -> String {
    l.p(
        "Metode ini hanya untuk polinomial (pangkat bulat tanpa pecahan, akar, atau trigonometri). Gunakan metode Otomatis.",
        "This method only works for polynomials (whole-number powers, with no fractions, roots, or trigonometry). Use the Auto method.",
    )
}

fn clean(mut p: Poly) -> Poly {
    p.retain(|_, c| c.abs() > 1e-9);
    p
}
fn konst(c: f64) -> Poly {
    let mut p = Poly::new();
    p.insert((0, 0), c);
    clean(p)
}
fn lin(a: &Poly, b: &Poly, s: f64) -> Poly {
    let mut r = a.clone();
    for (k, c) in b {
        *r.entry(*k).or_insert(0.0) += s * c;
    }
    clean(r)
}
fn pmul(a: &Poly, b: &Poly) -> Poly {
    let mut r = Poly::new();
    for (ka, ca) in a {
        for (kb, cb) in b {
            *r.entry((ka.0 + kb.0, ka.1 + kb.1)).or_insert(0.0) += ca * cb;
        }
    }
    clean(r)
}

fn to_poly(e: &Expr, x: &Poly, l: Lang) -> Result<Poly, String> {
    Ok(match e {
        Expr::Num(n) => konst(*n),
        Expr::X => x.clone(),
        Expr::Neg(a) => lin(&Poly::new(), &to_poly(a, x, l)?, -1.0),
        Expr::Add(a, b) => lin(&to_poly(a, x, l)?, &to_poly(b, x, l)?, 1.0),
        Expr::Sub(a, b) => lin(&to_poly(a, x, l)?, &to_poly(b, x, l)?, -1.0),
        Expr::Mul(a, b) => pmul(&to_poly(a, x, l)?, &to_poly(b, x, l)?),
        Expr::Div(a, b) if !b.has_x() => {
            let d = eval(b, 0.0);
            if d == 0.0 {
                return Err(l.p("Pembagi tidak boleh nol", "The divisor cannot be zero"));
            }
            pmul(&to_poly(a, x, l)?, &konst(1.0 / d))
        }
        Expr::Pow(a, b) if !b.has_x() => {
            let n = eval(b, 0.0);
            if n.fract() != 0.0 || !(0.0..=12.0).contains(&n) {
                return Err(not_poly(l));
            }
            let base = to_poly(a, x, l)?;
            let mut r = konst(1.0);
            for _ in 0..n as u32 {
                r = pmul(&r, &base);
            }
            r
        }
        _ => return Err(not_poly(l)),
    })
}

fn term(c: f64, xp: u32, hp: u32) -> String {
    let a = c.abs();
    let mut s = String::new();
    if (a - 1.0).abs() > 1e-12 || (xp == 0 && hp == 0) {
        s += &fmt_num(a);
    }
    for (v, p) in [("x", xp), ("h", hp)] {
        if p > 0 {
            s += v;
            if p > 1 {
                s += &format!("^{{{}}}", p);
            }
        }
    }
    s
}

fn poly_latex(p: &Poly) -> String {
    if p.is_empty() {
        return "0".into();
    }
    let mut t: Vec<_> = p.iter().collect();
    t.sort_by_key(|(k, _)| (Reverse(k.0), k.1));
    let mut out = String::new();
    for (i, (k, c)) in t.iter().enumerate() {
        out += match (i, **c < 0.0) {
            (0, true) => "-",
            (0, false) => "",
            (_, true) => " - ",
            (_, false) => " + ",
        };
        out += &term(**c, k.0, k.1);
    }
    out
}

fn poly_to_expr(p: &Poly) -> Expr {
    let mut t: Vec<_> = p.iter().filter(|(k, _)| k.1 == 0).collect();
    t.sort_by_key(|(k, _)| Reverse(k.0));
    let mut acc: Option<Expr> = None;
    for (k, c) in t {
        let e = match k.0 {
            0 => num(*c),
            1 => mul(num(*c), Expr::X),
            n => mul(num(*c), pow(Expr::X, n as f64)),
        };
        acc = Some(match acc {
            None => e,
            Some(a) => add(a, e),
        });
    }
    acc.unwrap_or(num(0.0))
}

fn step(kind: &str, rule: String, formula: &str, why: String, details: Vec<String>, result: String) -> Step {
    Step {
        kind: kind.to_string(),
        rule,
        formula: formula.into(),
        applied_to: String::new(),
        why,
        details,
        result,
        depth: 0,
    }
}

fn x_only() -> Poly {
    let mut p = Poly::new();
    p.insert((1, 0), 1.0);
    p
}

/// Turunan lewat definisi limit (khusus polinomial).
pub fn by_definition(e: &Expr, l: Lang) -> Result<(Expr, Vec<Step>), String> {
    let mut xh = x_only();
    xh.insert((0, 1), 1.0);
    let fxh = to_poly(e, &xh, l)?;
    let fx = to_poly(e, &x_only(), l)?;
    let diff = lin(&fxh, &fx, -1.0);
    let quot: Poly = diff.iter().filter(|(k, _)| k.1 >= 1).map(|(k, c)| ((k.0, k.1 - 1), *c)).collect();
    let lim: Poly = quot.iter().filter(|(k, _)| k.1 == 0).map(|(k, c)| (*k, *c)).collect();
    let el = e.latex();
    let steps = vec![
        step(
            "def",
            l.p("Tulis definisi turunan", "Write the definition of the derivative"),
            r"f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}",
            l.p(
                "Turunan adalah kemiringan garis singgung. Kita 'menangkapnya' dengan garis sekan lewat dua titik yang berjarak h, lalu merapatkan titik kedua sampai h mendekati 0 (coba slider di Beranda!).\nDi cara ini tidak ada jalan pintas: kita hitung limitnya langkah demi langkah.",
                "The derivative is the slope of the tangent line. We 'catch' it with a secant line through two points a distance h apart, then bring the second point closer until h approaches 0 (try the slider on the Home page!).\nThis method has no shortcuts: we compute the limit step by step.",
            ),
            vec![format!("f(x) = {}", el)],
            String::new(),
        ),
        step(
            "fxh",
            l.p("Hitung f(x + h)", "Compute f(x + h)"),
            "",
            l.p(
                "Ganti setiap x pada f(x) dengan (x + h), lalu jabarkan. Artinya kita melangkah sejauh h ke kanan, lalu melihat tinggi kurvanya di sana.",
                "Replace every x in f(x) with (x + h), then expand. This means we step h to the right and look at the height of the curve there.",
            ),
            vec![format!("f(x+h) = {}", el.replace('x', "(x+h)")), format!("= {}", poly_latex(&fxh))],
            String::new(),
        ),
        step(
            "fdiff",
            l.p("Hitung f(x + h) − f(x)", "Compute f(x + h) − f(x)"),
            "",
            l.p(
                "Kurangkan f(x) untuk mendapat 'tambahan tinggi' saat melangkah sejauh h. Suku yang tidak memuat h saling menghapus, sehingga setiap suku yang tersisa memuat h.\nIni penting: tanpa itu, h tidak bisa dicoret di langkah berikutnya.",
                "Subtract f(x) to get the 'extra height' gained by stepping h. Terms without h cancel each other, so every remaining term contains h.\nThis matters: without it, h cannot be cancelled in the next step.",
            ),
            vec![
                format!("f(x+h)-f(x) = \\left({}\\right) - \\left({}\\right)", poly_latex(&fxh), poly_latex(&fx)),
                format!("= {}", poly_latex(&diff)),
            ],
            String::new(),
        ),
        step(
            "divh",
            l.p("Bagi dengan h", "Divide by h"),
            "",
            l.p(
                "Setiap suku memuat h, jadi h bisa dikeluarkan lalu dicoret dengan h di penyebut. Inilah trik yang membuat limitnya tidak lagi berbentuk 0/0.",
                "Every term contains h, so h can be factored out and cancelled with the h in the denominator. This is the trick that makes the limit stop being of the form 0/0.",
            ),
            vec![
                format!("\\frac{{f(x+h)-f(x)}}{{h}} = \\frac{{{}}}{{h}}", poly_latex(&diff)),
                format!("= {}", poly_latex(&quot)),
            ],
            String::new(),
        ),
        step(
            "limit",
            l.p("Ambil limit h → 0", "Take the limit as h → 0"),
            "",
            l.p(
                "Sekarang h aman diganti 0. Semua suku yang masih memuat h lenyap, dan yang tersisa adalah turunannya: kemiringan garis singgung di setiap titik x.",
                "Now h can safely be replaced by 0. All terms that still contain h vanish, and what remains is the derivative: the slope of the tangent line at every point x.",
            ),
            vec![format!("f'(x) = \\lim_{{h\\to 0}}\\left({}\\right) = {}", poly_latex(&quot), poly_latex(&lim))],
            poly_latex(&lim),
        ),
    ];
    Ok((poly_to_expr(&lim), steps))
}

/// Jabarkan menjadi jumlah suku, lalu turunkan tiap suku dengan aturan pangkat (khusus polinomial).
pub fn by_expansion(e: &Expr, l: Lang) -> Result<(Expr, Vec<Step>), String> {
    let fx = to_poly(e, &x_only(), l)?;
    let mut terms: Vec<_> = fx.iter().collect();
    terms.sort_by_key(|(k, _)| Reverse(k.0));
    let mut dp = Poly::new();
    let mut lines = Vec::new();
    for (k, c) in terms {
        let mut single = Poly::new();
        single.insert(*k, *c);
        let mut d = Poly::new();
        if k.0 > 0 {
            d.insert((k.0 - 1, 0), c * k.0 as f64);
            dp.insert((k.0 - 1, 0), c * k.0 as f64);
        }
        lines.push(format!("\\left({}\\right)' = {}", poly_latex(&single), poly_latex(&d)));
    }
    let steps = vec![
        step(
            "expand",
            l.p("Jabarkan fungsi", "Expand the function"),
            "",
            l.p(
                "Alih-alih memakai aturan perkalian atau aturan rantai, kita ratakan dulu fungsinya menjadi jumlah suku-suku berpangkat x. Setelah rata, tiap suku mudah diturunkan satu per satu.\nCara ini cocok kalau soal meminta penjabaran, atau kalau kamu ingin memeriksa hasil dengan jalur lain.",
                "Instead of using the product rule or chain rule, we first flatten the function into a sum of powers of x. Once flat, each term is easy to differentiate one by one.\nThis way suits problems that ask for expansion, or when you want to check your result by another route.",
            ),
            vec![format!("f(x) = {}", e.latex()), format!("= {}", poly_latex(&fx))],
            String::new(),
        ),
        step(
            "each-term",
            l.p("Turunkan tiap suku", "Differentiate each term"),
            r"(c\,x^{n})' = c\,n\,x^{n-1}",
            l.p(
                "Setiap suku c·xⁿ diturunkan dengan aturan pangkat: pangkat n turun menjadi pengali (ikut dikalikan dengan c), dan pangkat barunya n − 1.\nSuku konstanta turunannya 0, karena nilainya tidak pernah berubah.",
                "Each term c·xⁿ is differentiated with the power rule: the exponent n comes down as a multiplier (multiplied with c), and the new exponent is n − 1.\nA constant term has derivative 0, because its value never changes.",
            ),
            lines,
            String::new(),
        ),
        step(
            "combine",
            l.p("Gabungkan hasilnya", "Combine the results"),
            "",
            l.p(
                "Jumlahkan turunan semua suku tadi, dan jadilah turunan fungsinya. Coba cocokkan dengan hasil metode 'Aturan turunan': harus sama!",
                "Add up the derivatives of all those terms, and that is the derivative of the function. Try comparing with the result of the 'Derivative rules' method: it must match!",
            ),
            vec![format!("f'(x) = {}", poly_latex(&dp))],
            poly_latex(&dp),
        ),
    ];
    Ok((poly_to_expr(&dp), steps))
}
