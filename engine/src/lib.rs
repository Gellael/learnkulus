//! Mesin kalkulus: parse -> turunkan (dengan langkah) -> sederhanakan -> cek jawaban.
//! Tanpa dependensi, jadi bisa dipakai di Cloudflare Worker maupun dikompilasi ke WASM.

pub mod diff;
pub mod eval;
pub mod expr;
pub mod generator;
pub mod parser;
pub mod simplify;

pub use diff::Step;
use expr::Expr;

#[derive(Debug, Clone)]
pub struct Solution {
    pub input_latex: String,
    pub derivative: Expr,
    pub derivative_latex: String,
    pub steps: Vec<Step>,
}

/// Turunan ke-`order` (1..=5) dari `input`, lengkap dengan langkah.
pub fn solve(input: &str, order: usize) -> Result<Solution, String> {
    if order == 0 || order > 5 {
        return Err("Orde turunan harus 1 sampai 5".into());
    }
    let parsed = parser::parse(input)?;
    let input_latex = parsed.latex();
    let mut cur = parsed;
    let mut steps = Vec::new();
    for k in 1..=order {
        if order > 1 {
            steps.push(Step::marker(format!("Turunan ke-{}", k), cur.latex()));
        }
        let d = diff::diff(&cur, &mut steps)?;
        let simplified = simplify::simplify(&d);
        if d.latex() != simplified.latex() {
            let mut s = Step::marker("Sederhanakan".to_string(), String::new());
            s.details = vec![format!("{} = {}", d.latex(), simplified.latex())];
            steps.push(s);
        }
        cur = simplified;
    }
    Ok(Solution {
        input_latex,
        derivative_latex: cur.latex(),
        derivative: cur,
        steps,
    })
}

/// Apakah `answer` setara dengan turunan ke-`order` dari `problem`?
pub fn check_derivative(problem: &str, answer: &str, order: usize) -> Result<bool, String> {
    let sol = solve(problem, order)?;
    let ans = parser::parse(answer)?;
    Ok(eval::equivalent(&sol.derivative, &ans))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ok(problem: &str, key: &str) {
        assert!(
            check_derivative(problem, key, 1).unwrap(),
            "f(x) = {}  seharusnya f'(x) = {}, hasil engine: {}",
            problem,
            key,
            solve(problem, 1).unwrap().derivative_latex
        );
    }

    #[test]
    fn pangkat_dan_jumlah() {
        ok("x^5", "5x^4");
        ok("3x^4 - 2x^2 + 7", "12x^3 - 4x");
        ok("1/x^2", "-2/x^3");
        ok("x^-3", "-3/x^4");
        ok("sqrt x", "1/(2 sqrt x)");
    }

    #[test]
    fn perkalian_dan_hasil_bagi() {
        ok("(x^2+1)(x-3)", "3x^2 - 6x + 1");
        ok("(x^2+1)/(x-1)", "(x^2-2x-1)/(x-1)^2");
        ok("x/(x^2+4)", "(4-x^2)/(x^2+4)^2");
    }

    #[test]
    fn aturan_rantai() {
        ok("(3x-2)^4", "12(3x-2)^3");
        ok("sqrt(x^2+1)", "x/sqrt(x^2+1)");
        ok("(x^2+3)^5", "10x(x^2+3)^4");
    }

    #[test]
    fn trigonometri() {
        ok("sin 3x", "3cos 3x");
        ok("cos(x^2)", "-2x sin(x^2)");
        ok("sec 2x", "2 sec 2x tan 2x");
        ok("sin(x)^2", "2 sin x cos x");
        ok("x^2 cos x", "2x cos x - x^2 sin x");
        ok("sec x", "sec x tan x");
        ok("cot x", "-csc(x)^2");
        ok("sin x / x", "(x cos x - sin x)/x^2");
    }

    #[test]
    fn turunan_tingkat_tinggi() {
        assert!(check_derivative("x^4 - 3x^2", "12x^2 - 6", 2).unwrap());
        assert!(check_derivative("x^4", "24x", 3).unwrap());
    }

    #[test]
    fn jawaban_salah_ditolak() {
        assert!(!check_derivative("x^2", "x", 1).unwrap());
        assert!(!check_derivative("sin x", "-cos x", 1).unwrap());
    }

    #[test]
    fn langkah_dan_latex() {
        let s = solve("(x^2+3)^5", 1).unwrap();
        assert!(s.steps.iter().any(|st| st.rule.contains("rantai")));
        assert!(s.derivative_latex.contains("10"));
        assert!(s.steps.iter().any(|st| st.depth > 0));
        println!("{}", s.derivative_latex);
    }

    #[test]
    fn generator_selalu_menghasilkan_soal_yang_bisa_diselesaikan() {
        for topic in generator::TOPICS {
            for seed in 0..300 {
                let p = generator::generate(topic, seed).unwrap();
                assert!(solve(&p, 1).is_ok(), "{} seed {} -> {}", topic, seed, p);
                assert_eq!(p, generator::generate(topic, seed).unwrap());
            }
        }
        assert!(generator::generate("zzz", 1).is_err());
    }

    #[test]
    fn langkah_terperinci() {
        let s = solve("7x^2 cos 10x", 1).unwrap();
        assert_eq!(s.steps[0].rule, "Aturan perkalian");
        assert_eq!(s.steps[0].details.len(), 5);
        assert!(s.steps.iter().any(|t| t.rule == "Aturan rantai" && t.depth == 1));
        assert_eq!(s.steps.last().unwrap().rule, "Sederhanakan");
        let all: String = s.steps.iter().flat_map(|t| t.details.clone()).collect::<Vec<_>>().join(" | ");
        assert!(all.contains("u = 7x^{2}"));
        assert!(all.contains("14x"));
        assert!(check_derivative("7x^2 cos 10x", "14x cos 10x - 70x^2 sin 10x", 1).unwrap());
        for t in &s.steps {
            println!("{}{} | {:?} | {}", "  ".repeat(t.depth), t.rule, t.details, t.result);
        }
    }

    #[test]
    fn input_buruk() {
        assert!(solve("", 1).is_err());
        assert!(solve("x +", 1).is_err());
        assert!(solve("foo(x)", 1).is_err());
        assert!(solve("2^x", 1).is_err());
    }
}
