//! Generator soal deterministik: topik + seed -> soal yang sama setiap kali.
//! Server tidak perlu menyimpan apa pun; kunci dihitung ulang oleh `solve`.

struct Rng(u64);

impl Rng {
    fn new(seed: u64) -> Self {
        Rng(seed.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407))
    }
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        self.0 >> 33
    }
    /// Bilangan bulat di [lo, hi].
    fn range(&mut self, lo: i64, hi: i64) -> i64 {
        lo + (self.next() % (hi - lo + 1) as u64) as i64
    }
}

pub const TOPICS: [&str; 5] = ["power", "product", "quotient", "chain", "trig"];

pub fn generate(topic: &str, seed: u64) -> Result<String, String> {
    let mut r = Rng::new(seed);
    Ok(match topic {
        "power" => {
            let (a, n) = (r.range(2, 9), r.range(3, 6));
            let (b, m) = (r.range(1, 8), r.range(2, n - 1));
            let c = r.range(1, 9);
            format!("{}x^{} - {}x^{} + {}x + {}", a, n, b, m, c, r.range(1, 9))
        }
        "product" => {
            let (n, a, b) = (r.range(2, 4), r.range(1, 6), r.range(1, 6));
            format!("(x^{} + {})(x - {})", n, a, b)
        }
        "quotient" => {
            let (a, b) = (r.range(1, 6), r.range(1, 6));
            match r.range(0, 1) {
                0 => format!("(x + {})/(x^2 + {})", a, b),
                _ => format!("x^2/(x - {})", a),
            }
        }
        "chain" => {
            let (a, b, n) = (r.range(2, 5), r.range(1, 6), r.range(3, 5));
            match r.range(0, 2) {
                0 => format!("({}x + {})^{}", a, b, n),
                1 => format!("sqrt(x^2 + {})", b),
                _ => format!("(x^2 + {})^{}", b, n),
            }
        }
        "trig" => {
            let (a, n) = (r.range(2, 5), r.range(2, 4));
            match r.range(0, 3) {
                0 => format!("sin {}x", a),
                1 => format!("cos(x^{})", n),
                2 => format!("x^{} cos x", n),
                _ => format!("sin x / x^{}", n),
            }
        }
        _ => return Err(format!("Topik tidak dikenal: {}", topic)),
    })
}
