use engine::{check_derivative, generator::generate, parser::parse, solve};
use serde::Deserialize;
use serde_json::{json, Value};
use worker::*;

#[derive(Deserialize)]
struct SolveReq {
    expr: String,
    #[serde(default = "one")]
    order: usize,
}

fn one() -> usize {
    1
}

#[derive(Deserialize)]
struct CheckReq {
    topic: String,
    seed: u64,
    answer: String,
}

fn cors(mut r: Response) -> Result<Response> {
    let h = r.headers_mut();
    h.set("Access-Control-Allow-Origin", "*")?;
    h.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")?;
    h.set("Access-Control-Allow-Headers", "Content-Type")?;
    Ok(r)
}

fn bad(msg: &str) -> Result<Response> {
    Ok(Response::from_json(&json!({ "error": msg }))?.with_status(400))
}

fn solution_json(expr: &str, order: usize) -> std::result::Result<Value, String> {
    let s = solve(expr, order)?;
    let steps: Vec<Value> = s
        .steps
        .iter()
        .map(|t| json!({ "rule": t.rule, "formula": t.formula, "appliedTo": t.applied_to }))
        .collect();
    Ok(json!({ "input": s.input_latex, "derivative": s.derivative_latex, "steps": steps }))
}

#[event(fetch)]
async fn fetch(mut req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    if req.method() == Method::Options {
        return cors(Response::empty()?);
    }
    let path = req.path();
    let resp = match (req.method(), path.as_str()) {
        (Method::Get, "/") => Response::ok("kalkulus api"),

        // Soal acak dari topik + seed. Kunci TIDAK dikirim.
        (Method::Get, "/problem") => {
            let url = req.url()?;
            let (mut topic, mut seed) = ("power".to_string(), 0u64);
            for (k, v) in url.query_pairs() {
                match k.as_ref() {
                    "topic" => topic = v.to_string(),
                    "seed" => seed = v.parse().unwrap_or(0),
                    _ => {}
                }
            }
            match generate(&topic, seed) {
                Ok(expr) => {
                    let latex = parse(&expr).map(|e| e.latex()).unwrap_or_default();
                    Response::from_json(
                        &json!({ "topic": topic, "seed": seed, "expr": expr, "latex": latex }),
                    )
                }
                Err(m) => bad(&m),
            }
        }

        // Penyelesai bebas: ekspresi apa pun + orde turunan.
        (Method::Post, "/solve") => match req.json::<SolveReq>().await {
            Ok(b) => match solution_json(&b.expr, b.order) {
                Ok(v) => Response::from_json(&v),
                Err(m) => bad(&m),
            },
            Err(_) => bad("Body JSON tidak valid"),
        },

        // Cek jawaban: soal dibuat ulang dari seed, kunci dihitung server.
        (Method::Post, "/check") => match req.json::<CheckReq>().await {
            Ok(b) => match generate(&b.topic, b.seed) {
                Err(m) => bad(&m),
                Ok(expr) => match check_derivative(&expr, &b.answer, 1) {
                    Err(m) => bad(&format!("Jawaban tidak bisa dibaca: {}", m)),
                    Ok(correct) => {
                        let sol = solution_json(&expr, 1).unwrap_or(Value::Null);
                        Response::from_json(&json!({ "correct": correct, "solution": sol }))
                    }
                },
            },
            Err(_) => bad("Body JSON tidak valid"),
        },

        _ => Response::error("Not found", 404),
    }?;
    cors(resp)
}
