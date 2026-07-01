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
    "site.title": "김장욱 | AI 에이전트와 개발 기록",
    "site.description": "AI 에이전트, 자동화, 개발 도구, 소프트웨어 제작 과정을 기록하는 김장욱의 개인 기술 블로그입니다. 실험, 구현 로그, 운영 경험을 공유합니다.",
    "blog.readTime": "분 소요",
    "blog.readMore": "더 읽기",
    "blog.publishedOn": "게시일",
    "blog.updatedOn": "수정일",
    "blog.latestPosts": "최신 포스트",
    "blog.viewAll": "모두 보기",
    "blog.description": "AI 에이전트, 자동화, 개발 도구를 다룬 모든 글의 아카이브입니다. 실험 기록과 구현 로그를 최신순으로 모았습니다.",
    "about.description": "김장욱 소개. AI 에이전트와 자동화 서비스를 만드는 풀스택 개발자입니다. InsightForge와 Agent Effi Flow를 운영하며 쌓은 경험과 기술 스택을 소개합니다.",
    "contact.description": "김장욱에게 연락하기. 협업, 기술 문의, AI 에이전트 및 자동화 프로젝트에 관한 문의를 환영합니다.",
    "social.description": "김장욱의 소셜 채널 모음. GitHub와 기술 블로그 등에서 AI 에이전트와 개발 관련 콘텐츠를 팔로우하세요.",
    "footer.allRightsReserved": "모든 권리 보유",
    "a11y.skipToContent": "본문으로 건너뛰기",
  },
  en: {
    "nav.home": "Home",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.social": "Social",
    "nav.improvementHistory": "Improvement History",
    "site.title": "Kim Jangwook | AI Agents & Software Notes",
    "site.description": "Personal notes on AI agents, automation, developer tools, and building software. Practical experiments, implementation logs, and lessons learned by Kim Jangwook.",
    "blog.readTime": "min read",
    "blog.readMore": "Read more",
    "blog.publishedOn": "Published on",
    "blog.updatedOn": "Updated on",
    "blog.latestPosts": "Latest Posts",
    "blog.viewAll": "View All",
    "blog.description": "The full archive of articles on AI agents, automation, and developer tools. Every experiment log and build note, newest first.",
    "about.description": "About Kim Jangwook, a full-stack developer building AI agents and automation. Background, projects like InsightForge and Agent Effi Flow, and the tech stack.",
    "contact.description": "Get in touch with Kim Jangwook. Open to collaboration, technical questions, and inquiries about AI agents and automation projects.",
    "social.description": "Find Kim Jangwook across the web: GitHub, the tech blog, and other channels sharing AI agents and developer content.",
    "footer.allRightsReserved": "All rights reserved",
    "a11y.skipToContent": "Skip to main content",
  },
  ja: {
    "nav.home": "ホーム",
    "nav.blog": "ブログ",
    "nav.about": "紹介",
    "nav.contact": "お問い合わせ",
    "nav.social": "ソーシャル",
    "nav.improvementHistory": "改善履歴",
    "site.title": "Kim Jangwook | AIエージェントと開発記録",
    "site.description": "AIエージェント、自動化、開発ツール、ソフトウェア開発の過程を記録するKim Jangwookの個人技術ブログです。実験、実装ログ、運用経験を共有します。",
    "blog.readTime": "分",
    "blog.readMore": "続きを読む",
    "blog.publishedOn": "公開日",
    "blog.updatedOn": "更新日",
    "blog.latestPosts": "最新の投稿",
    "blog.viewAll": "すべて見る",
    "blog.description": "AIエージェント、自動化、開発ツールに関する全記事のアーカイブです。実験記録と実装ログを新着順にまとめています。",
    "about.description": "Kim Jangwook について。AIエージェントと自動化サービスを作るフルスタック開発者です。InsightForgeやAgent Effi Flowの運営経験と技術スタックを紹介します。",
    "contact.description": "Kim Jangwook への連絡。コラボレーション、技術的な質問、AIエージェントや自動化プロジェクトに関するお問い合わせを歓迎します。",
    "social.description": "Kim Jangwook のソーシャルチャンネル。GitHubや技術ブログなどでAIエージェントと開発関連のコンテンツをフォローできます。",
    "footer.allRightsReserved": "全著作権所有",
    "a11y.skipToContent": "本文へスキップ",
  },
  zh: {
    "nav.home": "首页",
    "nav.blog": "博客",
    "nav.about": "关于",
    "nav.contact": "联系方式",
    "nav.social": "社交媒体",
    "nav.improvementHistory": "改进历史",
    "site.title": "Kim Jangwook | AI 代理与软件笔记",
    "site.description": "Kim Jangwook 的个人技术博客，记录 AI 代理、自动化、开发工具和软件构建过程，分享实验、实现日志和运营经验。",
    "blog.readTime": "分钟阅读",
    "blog.readMore": "继续阅读",
    "blog.publishedOn": "发布日期",
    "blog.updatedOn": "更新日期",
    "blog.latestPosts": "最新文章",
    "blog.viewAll": "查看全部",
    "blog.description": "AI 代理、自动化和开发工具相关全部文章的归档，按最新顺序汇总实验记录与实现日志。",
    "about.description": "关于 Kim Jangwook。构建 AI 代理与自动化服务的全栈开发者，介绍 InsightForge、Agent Effi Flow 等项目经验与技术栈。",
    "contact.description": "联系 Kim Jangwook。欢迎合作、技术咨询，以及有关 AI 代理和自动化项目的问询。",
    "social.description": "Kim Jangwook 的社交频道。在 GitHub、技术博客等渠道关注 AI 代理与开发相关内容。",
    "footer.allRightsReserved": "保留所有权利",
    "a11y.skipToContent": "跳转到主要内容",
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
