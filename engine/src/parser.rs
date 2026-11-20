//! Parser teks -> Expr. Mendukung: angka, x, + - * / ^, kurung,
//! sin cos tan sec csc cot sqrt, serta perkalian implisit ("3x", "x sin x", "sin 3x").

use crate::expr::*;

#[derive(Debug, Clone, PartialEq)]
enum Tok {
    Num(f64),
    X,
    Func(F),
    Plus,
    Minus,
    Star,
    Slash,
    Caret,
    LP,
    RP,
}

type R = Result<Expr, String>;

fn lex(s: &str) -> Result<Vec<Tok>, String> {
    let c: Vec<char> = s.chars().collect();
    let mut i = 0;
    let mut t = Vec::new();
    while i < c.len() {
        let ch = c[i];
        if ch.is_whitespace() {
            i += 1;
            continue;
        }
        if ch.is_ascii_digit() || ch == '.' {
            let st = i;
            while i < c.len() && (c[i].is_ascii_digit() || c[i] == '.') {
                i += 1;
            }
            let txt: String = c[st..i].iter().collect();
            let n = txt.parse().map_err(|_| format!("Angka tidak valid: {}", txt))?;
            t.push(Tok::Num(n));
            continue;
        }
        if ch.is_alphabetic() {
            let st = i;
            while i < c.len() && c[i].is_alphabetic() {
                i += 1;
            }
            let word: String = c[st..i].iter().collect();
            let mut rest = word.as_str();
            while !rest.is_empty() {
                if let Some((f, len)) = F::prefix(rest) {
                    t.push(Tok::Func(f));
                    rest = &rest[len..];
                } else if rest.starts_with('x') {
                    t.push(Tok::X);
                    rest = &rest[1..];
                } else {
                    return Err(format!("Simbol tidak dikenal: {}", rest));
                }
            }
            continue;
        }
        t.push(match ch {
            '+' => Tok::Plus,
            '-' | '−' => Tok::Minus,
            '*' | '·' | '×' => Tok::Star,
            '/' => Tok::Slash,
            '^' => Tok::Caret,
            '(' => Tok::LP,
            ')' => Tok::RP,
            _ => return Err(format!("Karakter tidak dikenal: {}", ch)),
        });
        i += 1;
    }
    Ok(t)
}

struct P {
    t: Vec<Tok>,
    p: usize,
    depth: usize,
}

impl P {
    fn peek(&self) -> Option<&Tok> {
        self.t.get(self.p)
    }

    fn expr(&mut self) -> R {
        self.depth += 1;
        if self.depth > 64 {
            return Err("Ekspresi terlalu dalam".into());
        }
        let mut l = self.term()?;
        loop {
            match self.peek() {
                Some(Tok::Plus) => {
                    self.p += 1;
                    l = add(l, self.term()?);
                }
                Some(Tok::Minus) => {
                    self.p += 1;
                    l = sub(l, self.term()?);
                }
                _ => break,
            }
        }
        self.depth -= 1;
        Ok(l)
    }

    fn term(&mut self) -> R {
        let mut l = self.unary()?;
        loop {
            match self.peek() {
                Some(Tok::Star) => {
                    self.p += 1;
                    l = mul(l, self.unary()?);
                }
                Some(Tok::Slash) => {
                    self.p += 1;
                    l = div(l, self.unary()?);
                }
                // perkalian implisit
                Some(Tok::Num(_)) | Some(Tok::X) | Some(Tok::Func(_)) | Some(Tok::LP) => {
                    l = mul(l, self.unary()?);
                }
                _ => break,
            }
        }
        Ok(l)
    }

    fn unary(&mut self) -> R {
        if let Some(Tok::Minus) = self.peek() {
            self.p += 1;
            return Ok(neg(self.unary()?));
        }
        self.power()
    }

    fn power(&mut self) -> R {
        let base = self.atom()?;
        if let Some(Tok::Caret) = self.peek() {
            self.p += 1;
            let e = self.unary()?;
            return Ok(pow_e(base, e));
        }
        Ok(base)
    }

    fn atom(&mut self) -> R {
        let tok = self.peek().cloned().ok_or("Ekspresi berakhir terlalu cepat")?;
        self.p += 1;
        match tok {
            Tok::Num(n) => Ok(num(n)),
            Tok::X => Ok(Expr::X),
            Tok::LP => {
                let e = self.expr()?;
                self.close()?;
                Ok(e)
            }
            Tok::Func(f) => {
                let arg = self.func_arg()?;
                Ok(call(f, arg))
            }
            other => Err(format!("Token tidak terduga: {:?}", other)),
        }
    }

    fn close(&mut self) -> Result<(), String> {
        match self.peek() {
            Some(Tok::RP) => {
                self.p += 1;
                Ok(())
            }
            _ => Err("Kurung tutup ')' tidak ditemukan".into()),
        }
    }

    /// Argumen fungsi: "(...)" atau suku sederhana seperti "3x", "x^2".
    fn func_arg(&mut self) -> R {
        if let Some(Tok::LP) = self.peek() {
            self.p += 1;
            let e = self.expr()?;
            self.close()?;
            return Ok(e);
        }
        let first = self.power()?;
        if matches!(first, Expr::Num(_)) && matches!(self.peek(), Some(Tok::X)) {
            let rest = self.power()?;
            return Ok(mul(first, rest));
        }
        Ok(first)
    }
}

pub fn parse(input: &str) -> R {
    if input.chars().count() > 300 {
        return Err("Ekspresi terlalu panjang".into());
    }
    let t = lex(input)?;
    if t.is_empty() {
        return Err("Ekspresi kosong".into());
    }
    let mut p = P { t, p: 0, depth: 0 };
    let e = p.expr()?;
    if p.p < p.t.len() {
        return Err("Ada bagian ekspresi yang tidak dikenali".into());
    }
    Ok(e)
}
