export const languages = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
} as const;

export const defaultLang = "ko" as const;

export type Language = keyof typeof languages;

export function isValidLanguage(lang: string): lang is Language {
  return lang in languages;
}

export const ui = {
  ko: {
    "nav.home": "홈",
    "nav.blog": "블로그",
    "nav.about": "소개",
    "nav.contact": "문의하기",
    "nav.social": "소셜",
    "nav.improvementHistory": "개선 히스토리",
    "site.title": "EffiFlow",
    "site.description": "AI로 만드는 효율의 흐름",
    "blog.readTime": "분 소요",
    "blog.publishedOn": "게시일",
    "blog.updatedOn": "수정일",
    "footer.allRightsReserved": "모든 권리 보유",
  },
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.social": "Social",
    "nav.improvementHistory": "Improvement History",
    "site.title": "EffiFlow",
    "site.description": "Creating the Flow of Efficiency with AI",
    "blog.readTime": "min read",
    "blog.publishedOn": "Published on",
    "blog.updatedOn": "Updated on",
    "footer.allRightsReserved": "All rights reserved",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.blog": "ブログ",
    "nav.about": "紹介",
    "nav.contact": "お問い合わせ",
    "nav.social": "ソーシャル",
    "nav.improvementHistory": "改善履歴",
    "site.title": "EffiFlow",
    "site.description": "AIで創る効率の流れ",
    "blog.readTime": "分",
    "blog.publishedOn": "公開日",
    "blog.updatedOn": "更新日",
    "footer.allRightsReserved": "All rights reserved",
  },
} as const;

export function useTranslations(lang: Language) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function getLangFromUrl(url: URL): Language {
  const [, lang] = url.pathname.split("/");
  if (isValidLanguage(lang)) {
    return lang;
  }
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Language): string {
  return `/${lang}${path}`;
}
