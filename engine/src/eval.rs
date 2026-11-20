//! Evaluasi numerik dan pengecekan kesetaraan dua ekspresi.

use crate::expr::*;

pub fn eval(e: &Expr, x: f64) -> f64 {
    match e {
        Expr::Num(n) => *n,
        Expr::X => x,
        Expr::Neg(a) => -eval(a, x),
        Expr::Add(a, b) => eval(a, x) + eval(b, x),
        Expr::Sub(a, b) => eval(a, x) - eval(b, x),
        Expr::Mul(a, b) => eval(a, x) * eval(b, x),
        Expr::Div(a, b) => eval(a, x) / eval(b, x),
        Expr::Pow(a, b) => eval(a, x).powf(eval(b, x)),
        Expr::Call(f, a) => {
            let v = eval(a, x);
            match f {
                F::Sin => v.sin(),
                F::Cos => v.cos(),
                F::Tan => v.tan(),
                F::Sec => 1.0 / v.cos(),
                F::Csc => 1.0 / v.sin(),
                F::Cot => 1.0 / v.tan(),
                F::Sqrt => v.sqrt(),
            }
        }
    }
}

/// Dua ekspresi dianggap setara jika nilainya sama di banyak titik uji.
pub fn equivalent(a: &Expr, b: &Expr) -> bool {
    const PTS: [f64; 8] = [0.31, 0.7, 1.3, 2.1, 3.4, -0.6, -1.7, -2.9];
    let mut compared = 0;
    for &x in PTS.iter() {
        let (u, v) = (eval(a, x), eval(b, x));
        if u.is_finite() && v.is_finite() {
            let tol = 1e-6 * 1.0_f64.max(u.abs()).max(v.abs());
            if (u - v).abs() > tol {
                return false;
            }
            compared += 1;
        } else if u.is_finite() != v.is_finite() {
            return false;
        }
    }
    compared >= 3
}
