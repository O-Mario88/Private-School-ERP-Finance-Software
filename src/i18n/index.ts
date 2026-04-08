/**
 * MAPLE SCHOOL FINANCE ERP
 * i18n Translation Engine
 *
 * Offline-first, key-based translation system.
 * No network calls — language packs are statically bundled.
 */

import { en } from './locales/en';
import { fr } from './locales/fr';
import type {
  SupportedLocale,
  TranslationSchema,
  TranslationKey,
  TranslateOptions,
} from './types';
export { SUPPORTED_LOCALES, LOCALE_NAMES } from './types';
export type { SupportedLocale, TranslationKey, TranslateOptions };

// ---------------------------------------------------------------------------
// Language pack registry
// ---------------------------------------------------------------------------

const PACKS: Record<SupportedLocale, TranslationSchema> = { en, fr };

// ---------------------------------------------------------------------------
// Active locale state (module-level singleton — fast, no external deps)
// ---------------------------------------------------------------------------

let _activeLocale: SupportedLocale = 'en';
const _listeners: Set<() => void> = new Set();

/** Get the currently active locale */
export function getLocale(): SupportedLocale {
  return _activeLocale;
}

/** Set the active locale. All future t() calls will use this language. */
export function setLocale(locale: SupportedLocale): void {
  if (locale === _activeLocale) return;
  _activeLocale = locale;
  _listeners.forEach((fn) => fn());
}

/** Subscribe to locale changes. Returns an unsubscribe function. */
export function onLocaleChange(fn: () => void): () => void {
  _listeners.add(fn);
  return () => {
    _listeners.delete(fn);
  };
}

// ---------------------------------------------------------------------------
// Translation resolver
// ---------------------------------------------------------------------------

/**
 * Resolve a nested value from an object using a dot-notation path.
 * Returns undefined if any segment is missing.
 */
function resolve(obj: Record<string, unknown>, path: string): string | undefined {
  const segments = path.split('.');
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur === null || cur === undefined || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[seg];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Primary translation function.
 *
 * Usage:
 *   t('common.buttons.save')                      → "Save" / "Enregistrer"
 *   t('billing.outstanding', { amount: '50,000' }) → "Outstanding: 50,000"
 *
 * Fallback chain:
 *   1. Active language pack
 *   2. English pack (fallback)
 *   3. Raw key string (should never happen if packs are complete)
 */
export function t(key: TranslationKey, options?: TranslateOptions): string {
  let text = resolve(PACKS[_activeLocale] as unknown as Record<string, unknown>, key);

  // Fallback to English
  if (text === undefined && _activeLocale !== 'en') {
    text = resolve(PACKS.en as unknown as Record<string, unknown>, key);
  }

  // Last resort – return the key itself so nothing is blank
  if (text === undefined) return key;

  // Interpolation: replace {{name}} placeholders
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      text = text.replace(new RegExp(`\\{\\{\\s*${k}\\s*\\}\\}`, 'g'), String(v));
    }
  }

  return text;
}

/**
 * Get the full language pack for a locale — useful for components that
 * need to iterate over a section (e.g., rendering all sidebar items).
 */
export function getTranslations(locale?: SupportedLocale): TranslationSchema {
  return PACKS[locale ?? _activeLocale];
}
