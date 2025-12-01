/**
 * FAQ Data for AEO (Answer Engine Optimization)
 *
 * These FAQs are optimized for:
 * - Google AI Overview
 * - ChatGPT / Perplexity / Claude
 * - Voice Search
 * - Featured Snippets
 *
 * Guidelines:
 * - Questions should be natural language queries users might ask
 * - Answers should be concise (30-70 words) but comprehensive
 * - Include relevant keywords naturally
 */

export interface FAQItem {
	question: string;
	answer: string;
}

export const homeFAQ: Record<'ko' | 'en' | 'ja' | 'zh', FAQItem[]> = {
	ko: [
		{
			question: 'EffiFlow는 어떤 블로그인가요?',
			answer: 'EffiFlow는 <strong>AI 자동화와 개발자 생산성</strong>에 초점을 맞춘 기술 블로그입니다. Claude Code, MCP(Model Context Protocol), 워크플로우 자동화, LLM 통합 등 최신 AI 기술에 대한 실용적인 가이드와 심층 분석을 제공합니다.'
		},
		{
			question: 'Claude Code란 무엇인가요?',
			answer: 'Claude Code는 Anthropic이 개발한 <strong>AI 코딩 어시스턴트</strong>입니다. 터미널에서 직접 실행되며, 코드 작성, 디버깅, 리팩토링, 테스트 작성 등 다양한 개발 작업을 자동화할 수 있습니다. MCP를 통해 외부 도구와 통합도 가능합니다.'
		},
		{
			question: 'MCP(Model Context Protocol)는 무엇인가요?',
			answer: 'MCP는 <strong>AI 모델과 외부 도구를 연결하는 개방형 프로토콜</strong>입니다. 데이터베이스, API, 파일 시스템 등 다양한 소스에 AI가 접근할 수 있게 해주며, Claude Code와 같은 AI 도구의 기능을 크게 확장합니다.'
		},
		{
			question: '블로그에서 다루는 주요 주제는 무엇인가요?',
			answer: 'EffiFlow에서 다루는 주요 주제: <strong>1)</strong> Claude Code 활용법 <strong>2)</strong> MCP 서버 개발 <strong>3)</strong> AI 워크플로우 자동화 <strong>4)</strong> LLM 애플리케이션 개발 <strong>5)</strong> 개발자 생산성 도구. 실전에서 바로 적용할 수 있는 실용적인 내용을 제공합니다.'
		},
		{
			question: '블로그 저자는 누구인가요?',
			answer: 'Kim Jangwook은 <strong>10년 이상의 웹 개발 경험</strong>을 가진 풀스택 개발자이자 AI 전문가입니다. 현재 AI 기반 OCR 자동화 플랫폼 Agent Effi Flow를 개발하고 있으며, Laravel, Vue.js, Python, SvelteKit 등 다양한 기술 스택에 전문성을 보유하고 있습니다.'
		}
	],
	en: [
		{
			question: 'What is EffiFlow?',
			answer: 'EffiFlow is a technical blog focused on <strong>AI automation and developer productivity</strong>. We provide practical guides and deep dives into cutting-edge AI technologies including Claude Code, MCP (Model Context Protocol), workflow automation, and LLM integration.'
		},
		{
			question: 'What is Claude Code?',
			answer: 'Claude Code is an <strong>AI coding assistant</strong> developed by Anthropic. It runs directly in your terminal and can automate various development tasks including code writing, debugging, refactoring, and test creation. It integrates with external tools through MCP.'
		},
		{
			question: 'What is MCP (Model Context Protocol)?',
			answer: 'MCP is an <strong>open protocol that connects AI models with external tools</strong>. It enables AI to access various sources like databases, APIs, and file systems, significantly extending the capabilities of AI tools like Claude Code.'
		},
		{
			question: 'What topics does the blog cover?',
			answer: 'EffiFlow covers: <strong>1)</strong> Claude Code usage <strong>2)</strong> MCP server development <strong>3)</strong> AI workflow automation <strong>4)</strong> LLM application development <strong>5)</strong> Developer productivity tools. We focus on practical, immediately applicable content.'
		},
		{
			question: 'Who is the blog author?',
			answer: 'Kim Jangwook is a full-stack developer and AI specialist with <strong>over 10 years of web development experience</strong>. Currently developing Agent Effi Flow, an AI-powered OCR automation platform. Expertise includes Laravel, Vue.js, Python, and SvelteKit.'
		}
	],
	ja: [
		{
			question: 'EffiFlowとは何ですか？',
			answer: 'EffiFlowは<strong>AI自動化と開発者生産性</strong>に焦点を当てた技術ブログです。Claude Code、MCP（Model Context Protocol）、ワークフロー自動化、LLM統合など、最先端AI技術に関する実践ガイドと深掘り記事を提供しています。'
		},
		{
			question: 'Claude Codeとは何ですか？',
			answer: 'Claude CodeはAnthropicが開発した<strong>AIコーディングアシスタント</strong>です。ターミナルで直接実行され、コード作成、デバッグ、リファクタリング、テスト作成など、さまざまな開発タスクを自動化できます。MCPを通じて外部ツールとの統合も可能です。'
		},
		{
			question: 'MCP（Model Context Protocol）とは何ですか？',
			answer: 'MCPは<strong>AIモデルと外部ツールを接続するオープンプロトコル</strong>です。データベース、API、ファイルシステムなど、さまざまなソースへのAIアクセスを可能にし、Claude Codeなどのツールの機能を大幅に拡張します。'
		},
		{
			question: 'ブログで扱う主なトピックは何ですか？',
			answer: 'EffiFlowの主なトピック：<strong>1)</strong> Claude Code活用法 <strong>2)</strong> MCPサーバー開発 <strong>3)</strong> AIワークフロー自動化 <strong>4)</strong> LLMアプリケーション開発 <strong>5)</strong> 開発者生産性ツール。すぐに実践できる実用的な内容を提供しています。'
		},
		{
			question: 'ブログの著者は誰ですか？',
			answer: 'Kim Jangwookは<strong>10年以上のWeb開発経験</strong>を持つフルスタック開発者でありAI専門家です。現在、AI搭載OCR自動化プラットフォームAgent Effi Flowを開発中。Laravel、Vue.js、Python、SvelteKitなどの技術に精通しています。'
		}
	],
	zh: [
		{
			question: 'EffiFlow 是什么？',
			answer: 'EffiFlow 是一个专注于<strong>AI 自动化和开发者生产力</strong>的技术博客。我们提供关于 Claude Code、MCP（模型上下文协议）、工作流自动化和 LLM 集成等前沿 AI 技术的实用指南和深度分析。'
		},
		{
			question: 'Claude Code 是什么？',
			answer: 'Claude Code 是 Anthropic 开发的<strong>AI 编程助手</strong>。它直接在终端中运行，可以自动化代码编写、调试、重构和测试创建等各种开发任务。通过 MCP 还可以与外部工具集成。'
		},
		{
			question: 'MCP（模型上下文协议）是什么？',
			answer: 'MCP 是一个<strong>连接 AI 模型与外部工具的开放协议</strong>。它使 AI 能够访问数据库、API、文件系统等各种资源，大大扩展了 Claude Code 等 AI 工具的功能。'
		},
		{
			question: '博客涵盖哪些主题？',
			answer: 'EffiFlow 涵盖的主题：<strong>1)</strong> Claude Code 使用方法 <strong>2)</strong> MCP 服务器开发 <strong>3)</strong> AI 工作流自动化 <strong>4)</strong> LLM 应用开发 <strong>5)</strong> 开发者生产力工具。专注于可立即应用的实用内容。'
		},
		{
			question: '博客作者是谁？',
			answer: 'Kim Jangwook 是一位拥有<strong>超过 10 年 Web 开发经验</strong>的全栈开发者和 AI 专家。目前正在开发 AI 驱动的 OCR 自动化平台 Agent Effi Flow。精通 Laravel、Vue.js、Python 和 SvelteKit 等技术。'
		}
	]
};

// Export for use in BaseHead.astro faqData prop
export function getFAQItems(lang: 'ko' | 'en' | 'ja' | 'zh'): FAQItem[] {
	return homeFAQ[lang] || homeFAQ.en;
}
