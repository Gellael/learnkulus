//! Aljabar polinom dua peubah (x dan h) untuk metode "definisi limit" dan "jabarkan dulu".

use crate::diff::Step;
use crate::eval::eval;
use crate::expr::*;
use std::cmp::Reverse;
use std::collections::BTreeMap;

type Poly = BTreeMap<(u32, u32), f64>; // (pangkat x, pangkat h) -> koefisien

const NOT_POLY: &str = "Metode ini hanya untuk polinomial (pangkat bulat tanpa pecahan, akar, atau trigonometri). Gunakan metode Otomatis.";

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

fn to_poly(e: &Expr, x: &Poly) -> Result<Poly, String> {
    Ok(match e {
        Expr::Num(n) => konst(*n),
        Expr::X => x.clone(),
        Expr::Neg(a) => lin(&Poly::new(), &to_poly(a, x)?, -1.0),
        Expr::Add(a, b) => lin(&to_poly(a, x)?, &to_poly(b, x)?, 1.0),
        Expr::Sub(a, b) => lin(&to_poly(a, x)?, &to_poly(b, x)?, -1.0),
        Expr::Mul(a, b) => pmul(&to_poly(a, x)?, &to_poly(b, x)?),
        Expr::Div(a, b) if !b.has_x() => {
            let d = eval(b, 0.0);
            if d == 0.0 {
                return Err("Pembagi tidak boleh nol".into());
            }
            pmul(&to_poly(a, x)?, &konst(1.0 / d))
        }
        Expr::Pow(a, b) if !b.has_x() => {
            let n = eval(b, 0.0);
            if n.fract() != 0.0 || !(0.0..=12.0).contains(&n) {
                return Err(NOT_POLY.into());
            }
            let base = to_poly(a, x)?;
            let mut r = konst(1.0);
            for _ in 0..n as u32 {
                r = pmul(&r, &base);
            }
            r
        }
        _ => return Err(NOT_POLY.into()),
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

fn st(rule: &str, formula: &str, why: &str, details: Vec<String>, result: String) -> Step {
    Step {
        rule: rule.into(),
        formula: formula.into(),
        applied_to: String::new(),
        why: why.into(),
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
pub fn by_definition(e: &Expr) -> Result<(Expr, Vec<Step>), String> {
    let mut xh = x_only();
    xh.insert((0, 1), 1.0);
    let fxh = to_poly(e, &xh)?;
    let fx = to_poly(e, &x_only())?;
    let diff = lin(&fxh, &fx, -1.0);
    let quot: Poly = diff.iter().filter(|(k, _)| k.1 >= 1).map(|(k, c)| ((k.0, k.1 - 1), *c)).collect();
    let lim: Poly = quot.iter().filter(|(k, _)| k.1 == 0).map(|(k, c)| (*k, *c)).collect();
    let el = e.latex();
    let steps = vec![
        st(
            "Tulis definisi turunan",
            r"f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}",
            "Turunan adalah kemiringan garis singgung, yaitu limit kemiringan garis sekan saat jarak h mendekati 0. Kita hitung limit itu langkah demi langkah.",
            vec![format!("f(x) = {}", el)],
            String::new(),
        ),
        st(
            "Hitung f(x + h)",
            "",
            "Ganti setiap x pada f(x) dengan (x + h), lalu jabarkan.",
            vec![format!("f(x+h) = {}", el.replace('x', "(x+h)")), format!("= {}", poly_latex(&fxh))],
            String::new(),
        ),
        st(
            "Hitung f(x + h) − f(x)",
            "",
            "Kurangkan f(x). Suku yang tidak memuat h saling menghapus, sehingga setiap suku yang tersisa memuat h.",
            vec![
                format!("f(x+h)-f(x) = \\left({}\\right) - \\left({}\\right)", poly_latex(&fxh), poly_latex(&fx)),
                format!("= {}", poly_latex(&diff)),
            ],
            String::new(),
        ),
        st(
            "Bagi dengan h",
            "",
            "Setiap suku memuat h, jadi h bisa dikeluarkan dan dicoret dengan h di penyebut.",
            vec![
                format!("\\frac{{f(x+h)-f(x)}}{{h}} = \\frac{{{}}}{{h}}", poly_latex(&diff)),
                format!("= {}", poly_latex(&quot)),
            ],
            String::new(),
        ),
        st(
            "Ambil limit h → 0",
            "",
            "Sekarang h boleh diganti 0. Semua suku yang masih memuat h menjadi 0, dan yang tersisa adalah turunannya.",
            vec![format!("f'(x) = \\lim_{{h\\to 0}}\\left({}\\right) = {}", poly_latex(&quot), poly_latex(&lim))],
            poly_latex(&lim),
        ),
    ];
    Ok((poly_to_expr(&lim), steps))
}

/// Jabarkan menjadi jumlah suku, lalu turunkan tiap suku dengan aturan pangkat (khusus polinomial).
pub fn by_expansion(e: &Expr) -> Result<(Expr, Vec<Step>), String> {
    let fx = to_poly(e, &x_only())?;
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
        st(
            "Jabarkan fungsi",
            "",
            "Alih-alih memakai aturan perkalian atau aturan rantai, jabarkan dulu fungsinya menjadi jumlah suku-suku berpangkat x. Setelah itu tiap suku mudah diturunkan.",
            vec![format!("f(x) = {}", e.latex()), format!("= {}", poly_latex(&fx))],
            String::new(),
        ),
        st(
            "Turunkan tiap suku",
            r"(c\,x^{n})' = c\,n\,x^{n-1}",
            "Setiap suku c·xⁿ diturunkan dengan aturan pangkat: pangkat n turun menjadi pengali dan pangkat baru n − 1. Suku konstanta turunannya 0.",
            lines,
            String::new(),
        ),
        st(
            "Gabungkan hasilnya",
            "",
            "Jumlahkan turunan semua suku.",
            vec![format!("f'(x) = {}", poly_latex(&dp))],
            poly_latex(&dp),
        ),
    ];
    Ok((poly_to_expr(&dp), steps))
}
