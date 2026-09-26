import { createContext, useContext, useEffect, useState } from 'react'
import { ar } from '../i18n'

const LanguageContext = createContext(null)

const LANG_KEY = 'campus_helpdesk_lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(LANG_KEY) || 'ar'
    } catch {
      return 'ar'
    }
  })

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      // storage unavailable — language still applies for this session
    }
  }, [lang])

  // English source strings are the keys; Arabic comes from the dictionary.
  const t = (key) => {
    if (lang === 'ar') return ar[key] ?? key
    return key
  }

  const toggle = () => setLang((l) => (l === 'ar' ? 'en' : 'ar'))

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
