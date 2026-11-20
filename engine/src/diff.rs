//! Turunan simbolik dengan pencatatan langkah (aturan yang dipakai).

use crate::eval::eval;
use crate::expr::*;

#[derive(Debug, Clone)]
pub struct Step {
    pub rule: String,
    /// Rumus aturan, dalam LaTeX.
    pub formula: String,
    /// Bagian ekspresi yang sedang diturunkan, dalam LaTeX.
    pub applied_to: String,
}

fn rec(st: &mut Vec<Step>, e: &Expr, rule: &str, formula: &str) {
    st.push(Step {
        rule: rule.to_string(),
        formula: formula.to_string(),
        applied_to: e.latex(),
    });
}

pub fn diff(e: &Expr, st: &mut Vec<Step>) -> Result<Expr, String> {
    if !e.has_x() {
        return Ok(num(0.0));
    }
    Ok(match e {
        Expr::Num(_) => num(0.0),
        Expr::X => num(1.0),
        Expr::Neg(a) => neg(diff(a, st)?),
        Expr::Add(a, b) => {
            rec(st, e, "Aturan jumlah", r"(u+v)' = u' + v'");
            add(diff(a, st)?, diff(b, st)?)
        }
        Expr::Sub(a, b) => {
            rec(st, e, "Aturan selisih", r"(u-v)' = u' - v'");
            sub(diff(a, st)?, diff(b, st)?)
        }
        Expr::Mul(a, b) => {
            if !a.has_x() {
                rec(st, e, "Aturan kelipatan konstanta", r"(c\,u)' = c\,u'");
                mul(a.as_ref().clone(), diff(b, st)?)
            } else if !b.has_x() {
                rec(st, e, "Aturan kelipatan konstanta", r"(c\,u)' = c\,u'");
                mul(b.as_ref().clone(), diff(a, st)?)
            } else {
                rec(st, e, "Aturan perkalian", r"(uv)' = u'v + uv'");
                let (da, db) = (diff(a, st)?, diff(b, st)?);
                add(mul(da, b.as_ref().clone()), mul(a.as_ref().clone(), db))
            }
        }
        Expr::Div(a, b) => {
            if !b.has_x() {
                rec(st, e, "Aturan kelipatan konstanta", r"\left(\frac{u}{c}\right)' = \frac{u'}{c}");
                div(diff(a, st)?, b.as_ref().clone())
            } else {
                rec(
                    st,
                    e,
                    "Aturan hasil bagi",
                    r"\left(\frac{u}{v}\right)' = \frac{u'v - uv'}{v^{2}}",
                );
                let (da, db) = (diff(a, st)?, diff(b, st)?);
                div(
                    sub(mul(da, b.as_ref().clone()), mul(a.as_ref().clone(), db)),
                    pow(b.as_ref().clone(), 2.0),
                )
            }
        }
        Expr::Pow(a, b) => {
            if b.has_x() {
                return Err("Pangkat dengan eksponen berisi x belum didukung".into());
            }
            let n = eval(b, 0.0);
            if matches!(**a, Expr::X) {
                rec(st, e, "Aturan pangkat", r"(x^{n})' = n\,x^{n-1}");
                mul(num(n), pow(Expr::X, n - 1.0))
            } else {
                rec(
                    st,
                    e,
                    "Aturan rantai (pangkat)",
                    r"(u^{n})' = n\,u^{n-1}\cdot u'",
                );
                let da = diff(a, st)?;
                mul(mul(num(n), pow(a.as_ref().clone(), n - 1.0)), da)
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
            let rule = if matches!(**a, Expr::X) {
                "Turunan fungsi dasar"
            } else {
                "Aturan rantai"
            };
            rec(st, e, rule, formula);
            let u = a.as_ref().clone();
            let du = diff(a, st)?;
            let outer = match f {
                F::Sin => call(F::Cos, u),
                F::Cos => neg(call(F::Sin, u)),
                F::Tan => pow(call(F::Sec, u), 2.0),
                F::Sec => mul(call(F::Sec, u.clone()), call(F::Tan, u)),
                F::Csc => neg(mul(call(F::Csc, u.clone()), call(F::Cot, u))),
                F::Cot => neg(pow(call(F::Csc, u), 2.0)),
                F::Sqrt => return Ok(div(du, mul(num(2.0), call(F::Sqrt, u)))),
            };
            mul(outer, du)
        }
    })
}
