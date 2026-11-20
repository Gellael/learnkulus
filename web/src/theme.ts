import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const KEY = 'theme'
const META_COLOR: Record<Theme, string> = { light: '#f1f5f2', dark: '#0d1220' }

/** Pilihan yang disimpan pengguna, atau null jika belum pernah memilih (ikut pengaturan perangkat). */
export function storedTheme(): Theme | null {
  try {
    const v = localStorage.getItem(KEY)
    return v === 'light' || v === 'dark' ? v : null
  } catch {
    return null
  }
}

export function systemTheme(): Theme {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Pasang tema ke <html>: CSS membaca atribut data-theme, dan color-scheme mengatur tampilan bawaan browser. */
export function applyTheme(t: Theme) {
  const el = document.documentElement
  el.dataset.theme = t
  el.style.colorScheme = t
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[t])
}

/** Dipanggil sekali sebelum React dirender supaya halaman tidak berkedip terang dulu. */
export function initTheme() {
  applyTheme(storedTheme() ?? systemTheme())
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? storedTheme() ?? systemTheme(),
  )

  const set = useCallback((t: Theme) => {
    applyTheme(t)
    setTheme(t)
    try {
      localStorage.setItem(KEY, t)
    } catch {
      /* penyimpanan diblokir: tema tetap berlaku untuk sesi ini */
    }
  }, [])

  const toggle = useCallback(() => set(theme === 'dark' ? 'light' : 'dark'), [set, theme])

  useEffect(() => {
    // Selama pengguna belum memilih sendiri, ikuti perubahan pengaturan perangkat.
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onSystem = () => {
      if (storedTheme()) return
      const t = systemTheme()
      applyTheme(t)
      setTheme(t)
    }
    // Sinkronkan antar tab.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return
      const t = storedTheme() ?? systemTheme()
      applyTheme(t)
      setTheme(t)
    }
    mq.addEventListener('change', onSystem)
    window.addEventListener('storage', onStorage)
    return () => {
      mq.removeEventListener('change', onSystem)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  return { theme, toggle }
}
