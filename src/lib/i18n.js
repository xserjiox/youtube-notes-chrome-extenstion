import { LOCALES, LOCALE_LABELS } from './locales/index.js';

const STORAGE_KEY = 'settings:locale';
const RTL_LOCALES = new Set(['ar']);

let _locale = 'en';
let _listeners = [];

function notify() {
  for (const fn of _listeners) fn(_locale);
}

/**
 * Subscribe to locale changes. Returns an unsubscribe function.
 */
export function onLocaleChange(fn) {
  _listeners.push(fn);
  return () => {
    _listeners = _listeners.filter((f) => f !== fn);
  };
}

/**
 * Resolve Chrome UI language to a supported locale code.
 */
function resolveUILanguage() {
  try {
    const uiLang = chrome.i18n.getUILanguage();
    if (!uiLang) return 'en';
    // Direct match (e.g. "fr", "de")
    if (LOCALES[uiLang]) return uiLang;
    // zh-CN / zh_CN → zh_CN
    const normalized = uiLang.replace('-', '_');
    if (LOCALES[normalized]) return normalized;
    // Base language match (e.g. "fr-FR" → "fr")
    const base = uiLang.split(/[-_]/)[0];
    if (LOCALES[base]) return base;
    // Special: any zh variant → zh_CN
    if (base === 'zh') return 'zh_CN';
  } catch {
    // chrome.i18n may not be available in all contexts
  }
  return 'en';
}

/**
 * Initialize locale from storage, falling back to Chrome UI language, then English.
 * Call once at app startup before mounting.
 */
export async function initLocale() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    if (stored && LOCALES[stored]) {
      _locale = stored;
    } else {
      _locale = resolveUILanguage();
    }
  } catch {
    _locale = resolveUILanguage();
  }
  applyDir();
}

/**
 * Set document direction based on current locale.
 */
function applyDir() {
  const dir = isRTL() ? 'rtl' : 'ltr';
  try {
    document.documentElement.dir = dir;
    document.documentElement.lang = _locale.replace('_', '-');
  } catch {
    // May fail in service worker context
  }
}

/**
 * Get current locale code.
 */
export function currentLocale() {
  return _locale;
}

/**
 * Set locale, persist to storage, update direction, and notify listeners.
 */
export async function setLocale(code) {
  if (!LOCALES[code]) return;
  _locale = code;
  applyDir();
  notify();
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: code });
  } catch {
    // Storage may not be available
  }
}

/**
 * Get translated message for current locale, with optional substitutions.
 * Falls back to English if key is missing in current locale.
 * Substitutions replace $1, $2, etc.
 */
export function msg(key, ...substitutions) {
  const dict = LOCALES[_locale] || LOCALES.en;
  let str = dict[key] ?? LOCALES.en[key] ?? key;
  for (let i = 0; i < substitutions.length; i++) {
    str = str.replace(`$${i + 1}`, String(substitutions[i]));
  }
  return str;
}

/**
 * CLDR plural category for a given locale and count.
 */
function pluralCategory(locale, count) {
  const n = Math.abs(count);
  const base = locale.split('_')[0];

  // Chinese, Japanese — single form
  if (base === 'zh' || base === 'ja') return 'other';

  // Arabic — 6 forms
  if (base === 'ar') {
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    const mod100 = n % 100;
    if (mod100 >= 3 && mod100 <= 10) return 'few';
    if (mod100 >= 11 && mod100 <= 99) return 'many';
    return 'other';
  }

  // Polish, Ukrainian — 3 forms (one, few, other)
  if (base === 'pl' || base === 'uk') {
    if (n === 1) return 'one';
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return 'few';
    return 'other';
  }

  // Default (en, fr, de, it) — 2 forms
  if (n === 1) return 'one';
  return 'other';
}

/**
 * Get pluralized message.
 * Looks up `${baseKey}_${category}` and substitutes $1 with count.
 */
export function plural(baseKey, count) {
  const category = pluralCategory(_locale, count);
  const key = `${baseKey}_${category}`;
  const dict = LOCALES[_locale] || LOCALES.en;
  // Try locale-specific plural form, fall back to 'other', then English
  const str = dict[key] ?? dict[`${baseKey}_other`] ?? LOCALES.en[key] ?? LOCALES.en[`${baseKey}_other`] ?? baseKey;
  return str.replace('$1', String(count));
}

/**
 * Whether the current locale is RTL.
 */
export function isRTL() {
  return RTL_LOCALES.has(_locale.split('_')[0]);
}

export { LOCALE_LABELS };
