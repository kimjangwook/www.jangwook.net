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

// AEO Optimized: Title 50~60 chars, Description 150~160 chars for each language
export const ui = {
  ko: {
    "nav.home": "홈",
    "nav.blog": "블로그",
    "nav.about": "소개",
    "nav.contact": "문의하기",
    "nav.social": "소셜",
    "nav.improvementHistory": "개선 히스토리",
    "site.title": "EffiFlow | AI 자동화 & 개발자 생산성 기술 블로그",
    "site.description": "Claude Code, MCP, 워크플로우 자동화, AI 기반 개발에 대한 실용적인 가이드와 심층 분석. LLM 통합으로 개발 생산성을 높이는 방법을 공유합니다.",
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
    "site.title": "EffiFlow | AI Automation & Developer Productivity Tech Blog",
    "site.description": "Explore Claude Code, MCP (Model Context Protocol), workflow automation, and AI-powered development. Practical guides and deep dives into LLM integration for developers.",
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
    "site.title": "EffiFlow | AI自動化＆開発者生産性技術ブログ",
    "site.description": "Claude Code、MCP、ワークフロー自動化、AI駆動開発の実践ガイドと深掘り記事。LLM統合で開発生産性を向上させる方法を共有します。",
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
    "site.title": "EffiFlow | AI自动化与开发者生产力技术博客",
    "site.description": "探索 Claude Code、MCP（模型上下文协议）、工作流自动化和 AI 驱动开发。为开发者提供 LLM 集成的实用指南和深度分析。",
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
