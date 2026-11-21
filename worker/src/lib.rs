use engine::{check_derivative_lang, generator::{generate, TOPICS}, parser::parse_lang, solve_lang, Lang, Method as SolveMethod};
use serde::Deserialize;
use serde_json::{json, Value};
use worker::*;

#[derive(Deserialize)]
struct SolveReq {
    expr: String,
    #[serde(default = "one")]
    order: usize,
    #[serde(default)]
    method: String,
    /// "id" (bawaan) atau "en"
    #[serde(default)]
    lang: String,
}

fn one() -> usize {
    1
}

#[derive(Deserialize)]
struct CheckReq {
    topic: String,
    seed: u64,
    answer: String,
    #[serde(default)]
    lang: String,
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

fn solution_json(expr: &str, order: usize, method: &str, lang: Lang) -> std::result::Result<Value, String> {
    let s = solve_lang(expr, order, SolveMethod::parse(method), lang)?;
    let steps: Vec<Value> = s
        .steps
        .iter()
        .map(|t| {
            json!({
                "kind": t.kind,
                "rule": t.rule,
                "formula": t.formula,
                "why": t.why,
                "appliedTo": t.applied_to,
                "details": t.details,
                "result": t.result,
                "depth": t.depth
            })
        })
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
        (Method::Get, "/") => Response::ok("learnkulus api"),

        // Soal acak dari topik + seed. Kunci TIDAK dikirim.
        (Method::Get, "/problem") => {
            let url = req.url()?;
            let (mut topic, mut seed, mut lang) = ("power".to_string(), 0u64, Lang::Id);
            for (k, v) in url.query_pairs() {
                match k.as_ref() {
                    "topic" => topic = v.to_string(),
                    "seed" => seed = v.parse().unwrap_or(0),
                    "lang" => lang = Lang::parse(&v),
                    _ => {}
                }
            }
            if !TOPICS.contains(&topic.as_str()) {
                bad(&lang.p(format!("Topik tidak dikenal: {}", topic), format!("Unknown topic: {}", topic)))
            } else {
                match generate(&topic, seed) {
                    Ok(expr) => {
                        let latex = parse_lang(&expr, lang).map(|e| e.latex()).unwrap_or_default();
                        Response::from_json(
                            &json!({ "topic": topic, "seed": seed, "expr": expr, "latex": latex }),
                        )
                    }
                    Err(m) => bad(&m),
                }
            }
        }

        // Penyelesai bebas: ekspresi apa pun + orde turunan.
        (Method::Post, "/solve") => match req.json::<SolveReq>().await {
            Ok(b) => {
                let lang = Lang::parse(&b.lang);
                match solution_json(&b.expr, b.order, &b.method, lang) {
                    Ok(v) => Response::from_json(&v),
                    Err(m) => bad(&m),
                }
            }
            Err(_) => bad("Body JSON tidak valid / Invalid JSON body"),
        },

        // Cek jawaban: soal dibuat ulang dari seed, kunci dihitung server.
        (Method::Post, "/check") => match req.json::<CheckReq>().await {
            Ok(b) => {
                let lang = Lang::parse(&b.lang);
                if !TOPICS.contains(&b.topic.as_str()) {
                    bad(&lang.p(format!("Topik tidak dikenal: {}", b.topic), format!("Unknown topic: {}", b.topic)))
                } else {
                    match generate(&b.topic, b.seed) {
                        Err(m) => bad(&m),
                        Ok(expr) => match check_derivative_lang(&expr, &b.answer, 1, lang) {
                            Err(m) => bad(&lang.p(format!("Jawaban tidak bisa dibaca: {}", m), format!("Your answer could not be read: {}", m))),
                            Ok(correct) => {
                                let sol = solution_json(&expr, 1, "auto", lang).unwrap_or(Value::Null);
                                Response::from_json(&json!({ "correct": correct, "solution": sol }))
                            }
                        },
                    }
                }
            }
            Err(_) => bad("Body JSON tidak valid / Invalid JSON body"),
        },

        _ => Response::error("Not found", 404),
    }?;
    cors(resp)
}
