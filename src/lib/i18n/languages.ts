export const languages = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
  zh: "简体中文",
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
    "blog.latestPosts": "최신 포스트",
    "blog.viewAll": "모두 보기",
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
    "blog.latestPosts": "Latest Posts",
    "blog.viewAll": "View All",
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
    "blog.latestPosts": "最新の投稿",
    "blog.viewAll": "すべて見る",
    "footer.allRightsReserved": "All rights reserved",
  },
  zh: {
    "nav.home": "首页",
    "nav.blog": "博客",
    "nav.about": "关于",
    "nav.contact": "联系方式",
    "nav.social": "社交媒体",
    "nav.improvementHistory": "改进历史",
    "site.title": "EffiFlow",
    "site.description": "用AI创造效率之流",
    "blog.readTime": "分钟阅读",
    "blog.publishedOn": "发布日期",
    "blog.updatedOn": "更新日期",
    "blog.latestPosts": "最新文章",
    "blog.viewAll": "查看全部",
    "footer.allRightsReserved": "保留所有权利",
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
