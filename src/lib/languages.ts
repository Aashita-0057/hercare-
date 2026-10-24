/**
 * Language registry for this build: English + Kannada.
 * - `native`: Endonym in its own script.
 * - `voice`: True if Web Speech API supports speech recognition and synthesis.
 * - `uiTranslated`: True if verified UI strings are provided.
 * - `locale`: BCP-47 language tag for Web Speech and HTML lang.
 * More languages can be re-enabled by extending this list and adding a
 * dictionary in translations.ts.
 */

export interface LanguageDef {
  code: string;
  name: string;
  native: string;
  rtl?: boolean;
  voice?: boolean;
  uiTranslated?: boolean;
  locale: string;
}

export const LANGUAGES: LanguageDef[] = [
  { code: "en", name: "English", native: "English", voice: true, uiTranslated: true, locale: "en-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", voice: true, uiTranslated: true, locale: "kn-IN" },
];

export const LANG_MAP: Record<string, LanguageDef> = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));

export function dirFor(code: string): "rtl" | "ltr" {
  return LANG_MAP[code]?.rtl ? "rtl" : "ltr";
}

export function localeFor(code: string): string {
  return LANG_MAP[code]?.locale ?? "en-IN";
}
