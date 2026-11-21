//! Bahasa keluaran engine: teks pembahasan dan pesan galat tersedia dalam Indonesia dan Inggris.

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Lang {
    Id,
    En,
}

impl Lang {
    /// "en", "en-US", dst. menjadi Inggris; selain itu Indonesia.
    pub fn parse(s: &str) -> Lang {
        if s.to_ascii_lowercase().starts_with("en") {
            Lang::En
        } else {
            Lang::Id
        }
    }

    /// Pilih teks sesuai bahasa. Kedua argumen dihitung dulu, biayanya sangat kecil.
    pub fn p<A: Into<String>, B: Into<String>>(self, id: A, en: B) -> String {
        match self {
            Lang::Id => id.into(),
            Lang::En => en.into(),
        }
    }
}
