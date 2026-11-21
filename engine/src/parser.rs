//! Parser teks -> Expr. Mendukung: angka, x, + - * / ^, kurung,
//! sin cos tan sec csc cot sqrt, serta perkalian implisit ("3x", "x sin x", "sin 3x").

use crate::expr::*;
use crate::lang::Lang;

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

fn lex(s: &str, l: Lang) -> Result<Vec<Tok>, String> {
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
            let n = txt.parse().map_err(|_| l.p(format!("Angka tidak valid: {}", txt), format!("Invalid number: {}", txt)))?;
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
                    return Err(l.p(format!("Simbol tidak dikenal: {}", rest), format!("Unknown symbol: {}", rest)));
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
            _ => return Err(l.p(format!("Karakter tidak dikenal: {}", ch), format!("Unknown character: {}", ch))),
        });
        i += 1;
    }
    Ok(t)
}

struct P {
    t: Vec<Tok>,
    p: usize,
    depth: usize,
    l: Lang,
}

impl P {
    fn peek(&self) -> Option<&Tok> {
        self.t.get(self.p)
    }

    fn expr(&mut self) -> R {
        self.depth += 1;
        if self.depth > 64 {
            return Err(self.l.p("Ekspresi terlalu dalam", "Expression is too deeply nested"));
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
        let l = self.l;
        let tok = self.peek().cloned().ok_or_else(|| l.p("Ekspresi berakhir terlalu cepat", "The expression ended too early"))?;
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
            other => Err(self.l.p(format!("Token tidak terduga: {:?}", other), format!("Unexpected token: {:?}", other))),
        }
    }

    fn close(&mut self) -> Result<(), String> {
        match self.peek() {
            Some(Tok::RP) => {
                self.p += 1;
                Ok(())
            }
            _ => Err(self.l.p("Kurung tutup ')' tidak ditemukan", "Closing parenthesis ')' not found")),
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
    parse_lang(input, Lang::Id)
}

pub fn parse_lang(input: &str, l: Lang) -> R {
    if input.chars().count() > 300 {
        return Err(l.p("Ekspresi terlalu panjang", "Expression is too long"));
    }
    let t = lex(input, l)?;
    if t.is_empty() {
        return Err(l.p("Ekspresi kosong", "Expression is empty"));
    }
    let mut p = P { t, p: 0, depth: 0, l };
    let e = p.expr()?;
    if p.p < p.t.len() {
        return Err(l.p("Ada bagian ekspresi yang tidak dikenali", "Part of the expression was not recognized"));
    }
    Ok(e)
}
