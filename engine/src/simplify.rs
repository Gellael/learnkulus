//! Penyederhanaan dasar: lipat konstanta, buang 0 dan 1, rapikan tanda dan koefisien.

use crate::expr::*;
use Expr::*;

pub fn simplify(e: &Expr) -> Expr {
    let mut cur = e.clone();
    for _ in 0..30 {
        let next = pass(&cur);
        if next == cur {
            break;
        }
        cur = next;
    }
    cur
}

/// Seperti `simplify`, tetapi mengembalikan tiap bentuk antara (satu per putaran),
/// elemen pertama adalah ekspresi awal dan elemen terakhir adalah hasil akhir.
pub fn simplify_stages(e: &Expr) -> Vec<Expr> {
    let mut out = vec![e.clone()];
    let mut cur = e.clone();
    for _ in 0..30 {
        let next = pass(&cur);
        if next == cur {
            break;
        }
        out.push(next.clone());
        cur = next;
    }
    out
}

fn pass(e: &Expr) -> Expr {
    match e {
        Num(_) | X => e.clone(),
        Neg(a) => match pass(a) {
            Num(n) => Num(-n),
            Neg(b) => *b,
            a => neg(a),
        },
        Add(a, b) => {
            let (a, b) = (pass(a), pass(b));
            match (&a, &b) {
                (Num(x), Num(y)) => Num(x + y),
                (Num(z), _) if *z == 0.0 => b.clone(),
                (_, Num(z)) if *z == 0.0 => a.clone(),
                (_, Neg(c)) => sub(a.clone(), (**c).clone()),
                (_, Num(y)) if *y < 0.0 => sub(a.clone(), Num(-y)),
                (_, Mul(c, r)) if matches!(**c, Num(k) if k < 0.0) => match **c {
                    Num(k) => sub(a.clone(), mul(Num(-k), (**r).clone())),
                    _ => add(a.clone(), b.clone()),
                },
                _ => add(a, b),
            }
        }
        Sub(a, b) => {
            let (a, b) = (pass(a), pass(b));
            match (&a, &b) {
                (Num(x), Num(y)) => Num(x - y),
                (_, Num(z)) if *z == 0.0 => a.clone(),
                (Num(z), _) if *z == 0.0 => neg(b.clone()),
                (_, Neg(c)) => add(a.clone(), (**c).clone()),
                _ => sub(a, b),
            }
        }
        Mul(a, b) => {
            let (a, b) = (pass(a), pass(b));
            match (&a, &b) {
                (Num(x), Num(y)) => Num(x * y),
                (Num(z), _) | (_, Num(z)) if *z == 0.0 => Num(0.0),
                (Num(o), _) if *o == 1.0 => b.clone(),
                (_, Num(o)) if *o == 1.0 => a.clone(),
                (Num(m), _) if *m == -1.0 => neg(b.clone()),
                (Num(c), Neg(r)) => mul(Num(-c), (**r).clone()),
                (Neg(r), _) => neg(mul((**r).clone(), b.clone())),
                (_, Neg(r)) => neg(mul(a.clone(), (**r).clone())),
                (Num(c), Mul(d, r)) if matches!(**d, Num(_)) => match **d {
                    Num(k) => mul(Num(c * k), (**r).clone()),
                    _ => mul(a.clone(), b.clone()),
                },
                (Mul(c, r), Mul(d, s))
                    if matches!(**c, Num(_)) && matches!(**d, Num(_)) =>
                {
                    match (&**c, &**d) {
                        (Num(p), Num(q)) => mul(Num(p * q), mul((**r).clone(), (**s).clone())),
                        _ => mul(a.clone(), b.clone()),
                    }
                }
                (Mul(c, r), _) if matches!(**c, Num(_)) => {
                    mul((**c).clone(), mul((**r).clone(), b.clone()))
                }
                (_, Mul(d, s)) if matches!(**d, Num(_)) => {
                    mul((**d).clone(), mul(a.clone(), (**s).clone()))
                }
                (_, Num(c)) => mul(Num(*c), a.clone()),
                _ => mul(a, b),
            }
        }
        Div(a, b) => {
            let (a, b) = (pass(a), pass(b));
            match (&a, &b) {
                (Num(x), Num(y)) if *y != 0.0 && (x / y).fract() == 0.0 => Num(x / y),
                (_, Num(o)) if *o == 1.0 => a.clone(),
                (Num(z), _) if *z == 0.0 => Num(0.0),
                (Neg(r), _) => neg(div((**r).clone(), b.clone())),
                (_, Neg(r)) => neg(div(a.clone(), (**r).clone())),
                _ => div(a, b),
            }
        }
        Pow(a, b) => {
            let (a, b) = (pass(a), pass(b));
            match (&a, &b) {
                (_, Num(o)) if *o == 1.0 => a.clone(),
                (_, Num(z)) if *z == 0.0 => Num(1.0),
                (Num(x), Num(y)) if x.powf(*y).is_finite() => Num(x.powf(*y)),
                _ => pow_e(a, b),
            }
        }
        Call(f, a) => call(*f, pass(a)),
    }
}
