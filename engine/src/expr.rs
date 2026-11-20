//! Pohon ekspresi (AST), konstruktor singkat, dan pembuat LaTeX.

pub type B = Box<Expr>;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum F {
    Sin,
    Cos,
    Tan,
    Sec,
    Csc,
    Cot,
    Sqrt,
}

impl F {
    pub fn name(self) -> &'static str {
        match self {
            F::Sin => "sin",
            F::Cos => "cos",
            F::Tan => "tan",
            F::Sec => "sec",
            F::Csc => "csc",
            F::Cot => "cot",
            F::Sqrt => "sqrt",
        }
    }

    /// Jika teks diawali nama fungsi, kembalikan fungsi dan panjang namanya.
    pub fn prefix(s: &str) -> Option<(F, usize)> {
        const ALL: [F; 7] = [F::Sqrt, F::Sin, F::Cos, F::Tan, F::Sec, F::Csc, F::Cot];
        ALL.iter()
            .find(|f| s.starts_with(f.name()))
            .map(|f| (*f, f.name().len()))
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum Expr {
    Num(f64),
    X,
    Neg(B),
    Add(B, B),
    Sub(B, B),
    Mul(B, B),
    Div(B, B),
    Pow(B, B),
    Call(F, B),
}

pub fn num(n: f64) -> Expr {
    Expr::Num(n)
}
pub fn neg(a: Expr) -> Expr {
    Expr::Neg(Box::new(a))
}
pub fn add(a: Expr, b: Expr) -> Expr {
    Expr::Add(Box::new(a), Box::new(b))
}
pub fn sub(a: Expr, b: Expr) -> Expr {
    Expr::Sub(Box::new(a), Box::new(b))
}
pub fn mul(a: Expr, b: Expr) -> Expr {
    Expr::Mul(Box::new(a), Box::new(b))
}
pub fn div(a: Expr, b: Expr) -> Expr {
    Expr::Div(Box::new(a), Box::new(b))
}
pub fn pow(a: Expr, n: f64) -> Expr {
    Expr::Pow(Box::new(a), Box::new(Expr::Num(n)))
}
pub fn pow_e(a: Expr, b: Expr) -> Expr {
    Expr::Pow(Box::new(a), Box::new(b))
}
pub fn call(f: F, a: Expr) -> Expr {
    Expr::Call(f, Box::new(a))
}

fn fmt_num(n: f64) -> String {
    if n.fract() == 0.0 && n.abs() < 1e15 {
        format!("{}", n as i64)
    } else {
        format!("{}", n)
    }
}

fn neg_lead(e: &Expr) -> bool {
    match e {
        Expr::Neg(_) => true,
        Expr::Num(n) => *n < 0.0,
        Expr::Mul(a, _) => neg_lead(a),
        _ => false,
    }
}

fn starts_num(e: &Expr) -> bool {
    match e {
        Expr::Num(_) => true,
        Expr::Mul(a, _) | Expr::Pow(a, _) => starts_num(a),
        _ => false,
    }
}

fn prec(e: &Expr) -> u8 {
    match e {
        Expr::Num(n) if *n < 0.0 => 1,
        Expr::Num(_) | Expr::X => 6,
        Expr::Add(..) | Expr::Sub(..) => 1,
        Expr::Mul(..) | Expr::Neg(_) | Expr::Div(..) => 2,
        Expr::Call(F::Sqrt, _) => 6,
        Expr::Call(..) => 3,
        Expr::Pow(..) => 4,
    }
}

impl Expr {
    /// Apakah ekspresi memuat variabel x?
    pub fn has_x(&self) -> bool {
        match self {
            Expr::Num(_) => false,
            Expr::X => true,
            Expr::Neg(a) | Expr::Call(_, a) => a.has_x(),
            Expr::Add(a, b)
            | Expr::Sub(a, b)
            | Expr::Mul(a, b)
            | Expr::Div(a, b)
            | Expr::Pow(a, b) => a.has_x() || b.has_x(),
        }
    }

    pub fn latex(&self) -> String {
        self.tex(0)
    }

    fn tex(&self, min: u8) -> String {
        let s = match self {
            Expr::Num(n) => fmt_num(*n),
            Expr::X => "x".to_string(),
            Expr::Neg(a) => format!("-{}", a.tex(2)),
            Expr::Add(a, b) => match &**b {
                Expr::Neg(c) => format!("{} - {}", a.tex(1), c.tex(2)),
                _ => format!("{} + {}", a.tex(1), b.tex(1)),
            },
            Expr::Sub(a, b) => format!("{} - {}", a.tex(1), b.tex(2)),
            Expr::Mul(a, b) => {
                let neg_b = neg_lead(b);
                match (&**a, &**b) {
                    (Expr::Num(n), r) if !matches!(r, Expr::Num(_)) && !neg_b && !starts_num(r) => {
                        format!("{}{}", fmt_num(*n), r.tex(2))
                    }
                    _ => {
                        let bt = if neg_b {
                            format!("\\left({}\\right)", b.tex(0))
                        } else {
                            b.tex(2)
                        };
                        format!("{} \\cdot {}", a.tex(2), bt)
                    }
                }
            }
            Expr::Div(a, b) => format!("\\frac{{{}}}{{{}}}", a.tex(0), b.tex(0)),
            Expr::Pow(a, b) => format!("{}^{{{}}}", a.tex(5), b.tex(0)),
            Expr::Call(F::Sqrt, a) => format!("\\sqrt{{{}}}", a.tex(0)),
            Expr::Call(f, a) => format!("\\{}\\left({}\\right)", f.name(), a.tex(0)),
        };
        if prec(self) < min {
            format!("\\left({}\\right)", s)
        } else {
            s
        }
    }
}
