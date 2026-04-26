// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

// SEO/AEO Optimized: Title 50~60 chars, Description 150~160 chars
export const SITE_TITLE = 'Kim Jangwook | Personal Tech Blog';
export const SITE_DESCRIPTION = 'Personal notes on AI agents, automation, developer tools, and building software. Practical experiments, implementation logs, and lessons learned by Kim Jangwook.';

// Language-specific site metadata for RSS feeds and SEO
// AEO Optimized: Each language with proper title (50~60 chars) and description (150~160 chars)
export const SITE_META = {
	ko: {
		title: '김장욱 | AI 에이전트와 개발 기록',
		description: 'AI 에이전트, 자동화, 개발 도구, 소프트웨어 제작 과정을 기록하는 김장욱의 개인 기술 블로그입니다. 실험, 구현 로그, 운영 경험을 공유합니다.'
	},
	en: {
		title: 'Kim Jangwook | AI Agents & Software Notes',
		description: 'Personal notes on AI agents, automation, developer tools, and building software. Practical experiments, implementation logs, and lessons learned by Kim Jangwook.'
	},
	ja: {
		title: 'Kim Jangwook | AIエージェントと開発記録',
		description: 'AIエージェント、自動化、開発ツール、ソフトウェア開発の過程を記録するKim Jangwookの個人技術ブログです。実験、実装ログ、運用経験を共有します。'
	},
	zh: {
		title: 'Kim Jangwook | AI 代理与软件笔记',
		description: 'Kim Jangwook 的个人技术博客，记录 AI 代理、自动化、开发工具和软件构建过程，分享实验、实现日志和运营经验。'
	}
};

// Author information for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)
export const AUTHOR = {
	name: 'Kim Jangwook',
	jobTitle: 'Full-Stack Developer & AI Specialist',
	description: 'Building AI agent systems, LLM applications, and automation solutions with 10+ years of web development experience.',
	url: 'https://jangwook.net/en/about',
	image: 'https://jangwook.net/favicon.svg',
	sameAs: [
		'https://github.com/kimjangwook',
		'https://linkedin.com/in/jangwook-kim-2590a1174',
		'https://x.com/Kim_Jangwook',
		'https://medium.com/@kim-jangwook',
		'https://www.youtube.com/@kim-jangwook'
	],
	knowsAbout: [
		'AI/LLM',
		'Claude Code',
		'MCP (Model Context Protocol)',
		'RAG Systems',
		'Web Development',
		'TypeScript',
		'Python',
		'Astro'
	]
};

// Organization information for structured data
export const ORGANIZATION = {
	name: 'jangwook.net',
	url: 'https://jangwook.net',
	logo: 'https://jangwook.net/favicon.svg',
	description: 'Personal technology blog by Kim Jangwook',
	foundingDate: '2024',
	sameAs: [
		'https://github.com/kimjangwook',
		'https://x.com/Kim_Jangwook'
	]
};
