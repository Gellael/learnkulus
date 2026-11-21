import { useI18n } from './i18n'
import { useTheme } from './theme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const { t } = useI18n()
  const dark = theme === 'dark'
  const label = dark ? t('theme.toLight') : t('theme.toDark')

  return (
    <button type="button" className="themebtn" onClick={toggle} aria-label={label} title={label}>
      {dark ? (
        // matahari: tampil saat tema gelap, artinya "klik untuk terang"
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6" />
        </svg>
      ) : (
        // bulan sabit: tampil saat tema terang, artinya "klik untuk gelap"
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7Z" />
        </svg>
      )}
    </button>
  )
}
