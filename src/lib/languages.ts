/**
 * 22 Scheduled Indian Languages + English
 * - `native`: Endonym in its own script.
 * - `voice`: True if Web Speech API supports speech recognition and synthesis.
 * - `uiTranslated`: True if verified UI strings are provided.
 * - `rtl`: True for right-to-left scripts (Urdu, Kashmiri, Sindhi).
 * - `locale`: BCP-47 language tag for Web Speech and HTML lang.
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
  { code: "hi", name: "Hindi", native: "हिन्दी", voice: true, uiTranslated: true, locale: "hi-IN" },
  { code: "bn", name: "Bengali", native: "বাংলা", voice: true, uiTranslated: true, locale: "bn-IN" },
  { code: "mr", name: "Marathi", native: "मराठी", voice: true, uiTranslated: true, locale: "mr-IN" },
  { code: "te", name: "Telugu", native: "తెలుగు", voice: true, uiTranslated: true, locale: "te-IN" },
  { code: "ta", name: "Tamil", native: "தமிழ்", voice: true, uiTranslated: true, locale: "ta-IN" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", voice: true, uiTranslated: true, locale: "gu-IN" },
  { code: "ur", name: "Urdu", native: "اردو", rtl: true, voice: true, uiTranslated: true, locale: "ur-IN" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", voice: true, uiTranslated: true, locale: "kn-IN" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", voice: true, uiTranslated: true, locale: "ml-IN" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ", voice: true, uiTranslated: true, locale: "pa-IN" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", voice: false, uiTranslated: false, locale: "or-IN" },
  { code: "as", name: "Assamese", native: "অসমীয়া", voice: false, uiTranslated: false, locale: "as-IN" },
  { code: "mai", name: "Maithili", native: "मैथिली", voice: false, uiTranslated: false, locale: "mai-IN" },
  { code: "sat", name: "Santali", native: "ᱥᱟᱱᱛᱟᱲᱤ", voice: false, uiTranslated: false, locale: "sat-IN" },
  { code: "ks", name: "Kashmiri", native: "کٲشُر", rtl: true, voice: false, uiTranslated: false, locale: "ks-IN" },
  { code: "ne", name: "Nepali", native: "नेपाली", voice: true, uiTranslated: false, locale: "ne-NP" },
  { code: "kok", name: "Konkani", native: "कोंकणी", voice: false, uiTranslated: false, locale: "kok-IN" },
  { code: "sd", name: "Sindhi", native: "سنڌي", rtl: true, voice: false, uiTranslated: false, locale: "sd-IN" },
  { code: "doi", name: "Dogri", native: "डोगरी", voice: false, uiTranslated: false, locale: "doi-IN" },
  { code: "mni", name: "Manipuri (Meitei)", native: "মৈতৈলোন্", voice: false, uiTranslated: false, locale: "mni-IN" },
  { code: "brx", name: "Bodo", native: "बड़ो", voice: false, uiTranslated: false, locale: "brx-IN" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्", voice: false, uiTranslated: false, locale: "sa-IN" },
];

export const LANG_MAP: Record<string, LanguageDef> = Object.fromEntries(LANGUAGES.map((l) => [l.code, l]));

export function dirFor(code: string): "rtl" | "ltr" {
  return LANG_MAP[code]?.rtl ? "rtl" : "ltr";
}

export function localeFor(code: string): string {
  return LANG_MAP[code]?.locale ?? "en-IN";
}
