// fechas en el idioma de la interfaz, sin depender de la zona del navegador para lo que no la necesita
export function formatDate(iso: string, language: string): string {
  return new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso))
}

export function languageName(code: string, inLanguage: string): string {
  try {
    return new Intl.DisplayNames([inLanguage], { type: 'language' }).of(code) ?? code
  } catch {
    return code
  }
}
