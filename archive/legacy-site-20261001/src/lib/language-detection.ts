/**
 * Language Detection Utility
 *
 * Provides client-side language detection and preference management
 * for multilingual blog routing.
 */

// Supported languages in the blog
export const SUPPORTED_LANGUAGES = ['ko', 'en', 'ja', 'zh'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// Language mapping from browser locale codes to supported languages
const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  'ko': 'ko',
  'ko-KR': 'ko',
  'ko-KP': 'ko',

  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'en-CA': 'en',
  'en-AU': 'en',
  'en-NZ': 'en',
  'en-IE': 'en',
  'en-ZA': 'en',

  'ja': 'ja',
  'ja-JP': 'ja',

  'zh': 'zh',
  'zh-CN': 'zh',
  'zh-TW': 'zh',
  'zh-HK': 'zh',
  'zh-SG': 'zh',
  'zh-Hans': 'zh',
  'zh-Hant': 'zh',
};

// Cookie name for language preference
const LANGUAGE_COOKIE_NAME = 'preferred-language';
// Cookie expiry in days
const COOKIE_EXPIRY_DAYS = 365;

/**
 * Detects the user's browser language and maps it to a supported language
 *
 * @returns {SupportedLanguage} The detected supported language or 'en' as fallback
 */
export function detectBrowserLanguage(): SupportedLanguage {
  // Check if running in browser environment
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'en';
  }

  // Try navigator.languages first (returns array of preferred languages)
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      const normalized = normalizeLangCode(lang);
      const mapped = LANGUAGE_MAP[normalized];
      if (mapped) {
        return mapped;
      }
    }
  }

  // Fallback to navigator.language
  if (navigator.language) {
    const normalized = normalizeLangCode(navigator.language);
    const mapped = LANGUAGE_MAP[normalized];
    if (mapped) {
      return mapped;
    }
  }

  // Default fallback to English
  return 'en';
}

/**
 * Normalizes browser language code to match our mapping keys
 *
 * @param {string} langCode - Raw language code from browser
 * @returns {string} Normalized language code
 */
function normalizeLangCode(langCode: string): string {
  return langCode.trim();
}

/**
 * Gets a cookie value by name
 *
 * @param {string} name - Cookie name
 * @returns {string | null} Cookie value or null if not found
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Sets a cookie with the given name, value, and expiry
 *
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {number} days - Expiry in days
 */
function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

/**
 * Retrieves the saved language preference from cookie
 * Priority: Cookie > Browser locale > 'en'
 *
 * @returns {SupportedLanguage | null} Saved language or null if not found
 */
export function getSavedLanguagePreference(): SupportedLanguage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = getCookie(LANGUAGE_COOKIE_NAME);
    if (saved && isSupportedLanguage(saved)) {
      return saved as SupportedLanguage;
    }
  } catch (error) {
    // Cookie might be disabled or throw errors
    console.warn('Failed to read language preference from cookie:', error);
  }

  return null;
}

/**
 * Saves the language preference to cookie
 * This is called when user manually changes language via the switcher
 *
 * @param {SupportedLanguage} lang - Language to save
 */
export function saveLanguagePreference(lang: SupportedLanguage): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    setCookie(LANGUAGE_COOKIE_NAME, lang, COOKIE_EXPIRY_DAYS);
  } catch (error) {
    // Cookie might be full or disabled
    console.warn('Failed to save language preference to cookie:', error);
  }
}

/**
 * Type guard to check if a string is a supported language
 *
 * @param {string} lang - Language code to check
 * @returns {boolean} True if the language is supported
 */
function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Determines the recommended language based on saved preference and browser detection
 * Priority: 1. Saved preference 2. Browser language 3. English default
 *
 * @returns {SupportedLanguage} The recommended language
 */
export function getRecommendedLanguage(): SupportedLanguage {
  // 1. Check saved preference first
  const saved = getSavedLanguagePreference();
  if (saved) {
    return saved;
  }

  // 2. Detect browser language
  const detected = detectBrowserLanguage();
  if (detected) {
    return detected;
  }

  // 3. Default to English
  return 'en';
}

/**
 * Gets the current language from the URL path
 * Expects URL structure: /[lang]/... or /[lang]
 *
 * @param {string} pathname - Current URL pathname
 * @returns {SupportedLanguage | null} Current language or null if not found
 */
export function getCurrentLanguageFromPath(pathname: string): SupportedLanguage | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0 && isSupportedLanguage(segments[0])) {
    return segments[0] as SupportedLanguage;
  }
  return null;
}

/**
 * Checks if the current page should show language suggestion
 * Only show on root page (/) and not on language-specific pages
 *
 * @param {string} pathname - Current URL pathname
 * @returns {boolean} True if should show suggestion
 */
export function shouldShowLanguageSuggestion(pathname: string): boolean {
  // Only show on root page
  return pathname === '/' || pathname === '';
}

/**
 * Language metadata for display purposes
 */
export const LANGUAGE_META: Record<SupportedLanguage, {
  name: string;
  nativeName: string;
  flag: string;
  path: string;
}> = {
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    path: '/ko/',
  },
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    path: '/en/',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    path: '/ja/',
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    path: '/zh/',
  },
};
