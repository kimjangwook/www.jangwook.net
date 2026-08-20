# SEO Component Usage Examples

## Basic Usage

```svelte
<script>
	import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
	title="免税処理OCR"
	description="パスポートと免税書類をAIで自動処理。正確で高速な免税手続きを実現します。"
	canonical="https://agent-effi-flow.jangwook.net/services/tax-free-ocr"
/>
```

## With Custom OG Image

```svelte
<SEO
	title="経理OCR"
	description="領収書・請求書をAI OCRで自動データ化。経理業務の効率化を実現します。"
	canonical="https://agent-effi-flow.jangwook.net/services/accounting-ocr"
	ogImage="https://agent-effi-flow.jangwook.net/og-accounting.png"
/>
```

## Article Type (Blog Post)

```svelte
<SEO
	title="AI OCRの活用事例"
	description="免税処理と経理業務におけるAI OCR導入事例をご紹介します。"
	canonical="https://agent-effi-flow.jangwook.net/blog/ai-ocr-case-study"
	ogType="article"
/>
```

## Private/Admin Page (No Index)

```svelte
<SEO
	title="API キー管理"
	description="API キーの作成・管理画面"
	canonical="https://agent-effi-flow.jangwook.net/agents/api_keys"
	noindex={true}
/>
```

## Generated Meta Tags

### Basic Meta Tags

```html
<title>免税処理OCR | Agent Effi Flow</title>
<meta
	name="description"
	content="パスポートと免税書類をAIで自動処理。正確で高速な免税手続きを実現します。"
/>
<link rel="canonical" href="https://agent-effi-flow.jangwook.net/services/tax-free-ocr" />
```

### OGP Tags

```html
<meta property="og:type" content="website" />
<meta property="og:url" content="https://agent-effi-flow.jangwook.net/services/tax-free-ocr" />
<meta property="og:title" content="免税処理OCR | Agent Effi Flow" />
<meta
	property="og:description"
	content="パスポートと免税書類をAIで自動処理。正確で高速な免税手続きを実現します。"
/>
<meta property="og:image" content="https://agent-effi-flow.jangwook.net/og-default.png" />
<meta property="og:site_name" content="Agent Effi Flow" />
<meta property="og:locale" content="ja_JP" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:locale:alternate" content="ko_KR" />
<meta property="og:locale:alternate" content="zh_CN" />
<meta property="og:locale:alternate" content="es_ES" />
```

### Twitter Card

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="免税処理OCR | Agent Effi Flow" />
<meta
	name="twitter:description"
	content="パスポートと免税書類をAIで自動処理。正確で高速な免税手続きを実現します。"
/>
<meta name="twitter:image" content="https://agent-effi-flow.jangwook.net/og-default.png" />
```

### Hreflang Tags

```html
<link
	rel="alternate"
	hreflang="ja"
	href="https://agent-effi-flow.jangwook.net/ja/services/tax-free-ocr"
/>
<link
	rel="alternate"
	hreflang="en"
	href="https://agent-effi-flow.jangwook.net/en/services/tax-free-ocr"
/>
<link
	rel="alternate"
	hreflang="ko"
	href="https://agent-effi-flow.jangwook.net/ko/services/tax-free-ocr"
/>
<link
	rel="alternate"
	hreflang="zh"
	href="https://agent-effi-flow.jangwook.net/zh/services/tax-free-ocr"
/>
<link
	rel="alternate"
	hreflang="es"
	href="https://agent-effi-flow.jangwook.net/es/services/tax-free-ocr"
/>
<link
	rel="alternate"
	hreflang="x-default"
	href="https://agent-effi-flow.jangwook.net/services/tax-free-ocr"
/>
```

### Robots (when noindex=true)

```html
<meta name="robots" content="noindex, nofollow" />
```

## Features

1. **Auto Site Name**: Automatically appends "Agent Effi Flow" to title if not already present
2. **Full OGP Support**: Complete Open Graph Protocol implementation
3. **Twitter Card**: Optimized for Twitter sharing with large image
4. **Multi-language**: Hreflang tags for 5 languages (ja, en, ko, zh, es)
5. **Canonical URLs**: Prevents duplicate content issues
6. **SEO Control**: Optional noindex for admin/private pages
