import { useI18n } from './i18n'

/** Saklar bahasa: ID di kiri, EN di kanan. */
export default function LangToggle() {
  const { lang, t, setLang } = useI18n()
  const en = lang === 'en'
  return (
    <button
      type="button"
      role="switch"
      aria-checked={en}
      className="langsw"
      onClick={() => setLang(en ? 'id' : 'en')}
      aria-label={t('lang.switch')}
      title={t('lang.title')}
    >
      <span className="langsw-opt" aria-hidden="true">ID</span>
      <span className="langsw-opt" aria-hidden="true">EN</span>
      <span className="langsw-thumb" aria-hidden="true" />
    </button>
  )
}
