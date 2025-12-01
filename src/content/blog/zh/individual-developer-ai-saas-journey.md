---
title: '独立开发者的AI SaaS构建之旅:3天完成生产环境上线'
description: >-
  使用SvelteKit、Supabase和Google Gemini API构建的B2B AI OCR服务的实战开发记录。技术选型理由、实现过程、业务战略,独立开发者的真实经验分享。
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: llm-page-migration-standardization
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 涵盖自动化、Web开发、AI/ML、DevOps、架构等领域的相似主题,难度相当。
  - slug: claude-code-parallel-testing
    score: 0.95
    reason:
      ko: '자동화, 웹 개발, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML, DevOps,
        architecture with comparable difficulty.
      zh: 涵盖自动化、Web开发、AI/ML、DevOps、架构等领域的相似主题,难度相当。
  - slug: google-analytics-mcp-automation
    score: 0.94
    reason:
      ko: '자동화, AI/ML, DevOps, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、DevOps、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, DevOps, architecture with
        comparable difficulty.
      zh: 涵盖自动化、AI/ML、DevOps、架构等领域的相似主题,难度相当。
  - slug: ai-content-recommendation-system
    score: 0.94
    reason:
      ko: '자동화, 웹 개발, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、Web開発、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, web development, AI/ML,
        architecture with comparable difficulty.
      zh: 涵盖自动化、Web开发、AI/ML、架构等领域的相似主题,难度相当。
  - slug: specification-driven-development
    score: 0.94
    reason:
      ko: '자동화, AI/ML, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: 自動化、AI/ML、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in automation, AI/ML, architecture with comparable
        difficulty.
      zh: 涵盖自动化、AI/ML、架构等领域的相似主题,难度相当。
---

## 概述

我在3天内完成了一个基于AI的B2B SaaS产品从开发到生产环境上线。这个名为<a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>的服务提供免税处理OCR和财务OCR两种AI自动化工具,目标客户是日本入境旅游业务和中小企业财务团队。

本文分享的不是"理论上可行",而是<strong>实际落地的经验</strong>。包括技术栈选择理由、核心实现细节、遇到的挑战,以及3个月的KPI目标,全部真实呈现。

## 为什么要做这个SaaS

### 问题定义

在日本工作期间发现的B2B自动化需求:

1. <strong>免税处理业务依赖人工操作</strong>:需要人工核对护照和免税单据并手工录入
2. <strong>财务工作重复性高</strong>:收据OCR后仍需手动整理数据
3. <strong>现有解决方案的局限性</strong>:要么是昂贵的企业级方案,要么是精度低的通用OCR

作为独立开发者,差异化的关键在于<strong>利用AI提取结构化数据</strong>。不仅仅是文字OCR,而是通过Google Gemini API的Structured Output功能获取类型安全的JSON响应,提供可以直接用于业务逻辑的数据。

## 技术栈选择

### 为什么选择SvelteKit

选择SvelteKit而不是Next.js的理由:

**1. Svelte 5的革命性响应式系统**

```typescript
// Svelte 5 Runes: $state和$derived
let count = $state(0);
let doubled = $derived(count * 2);

// 比React hooks更直观,样板代码更少
```

**2. 打包体积和性能**

- Svelte在编译时移除框架代码
- 客户端bundle比React小40%
- Time to Interactive明显更快

**3. 开发者体验**

- 学习曲线平缓,代码易读
- TypeScript支持优秀
- 基于Vite的HMR速度快

### 为什么选择Supabase作为后端

选择Supabase而不是Firebase:

**1. PostgreSQL的强大功能**

```sql
-- 通过Row Level Security实现多租户
CREATE POLICY "Users can only access their own data"
ON credits FOR SELECT
USING (auth.uid() = user_id);
```

**2. 集成化功能**

- Auth:即开即用的邮箱/社交登录
- Database:支持实时订阅的PostgreSQL
- Storage:文件上传和CDN
- Edge Functions:基于Deno的Serverless函数

**3. 开源和定价**

- 完全开源(可自托管)
- 慷慨的免费套餐(50,000 MAU,500MB数据库)
- 无需担心供应商锁定

### 为什么选择Google Gemini API作为AI模型

选择Gemini而不是OpenAI GPT:

**1. 成本效益**

```
Gemini 2.5 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

GPT-4 Turbo:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

→ 约便宜100倍
```

**2. Structured Output支持**

```typescript
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER }
        }
      }
    },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// 强制响应遵循schema
const result = await model.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});
```

**3. 多模态性能**

- 图像OCR质量优秀(OmniDocBench基准测试第一名)
- 在处理护照、收据等复杂布局方面表现出色

### 为什么选择Vercel作为部署平台

**1. SvelteKit优化**

- Vercel创建了SvelteKit并提供直接支持
- 自动SSR/Edge Function部署
- 构建缓存使部署速度更快

**2. Serverless架构**

- API路由自动部署为serverless function
- 按使用量计费(无流量时几乎零成本)
- 全球Edge Network

## 核心实现

### 1. OCR API with Structured Output

**实际代码** (`src/routes/api/receipt-ocr/+server.ts`):

```typescript
import { GoogleGenerativeAI, SchemaType as Type } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp'
});

// 通过schema定义确保类型安全
const responseSchema = {
  type: Type.OBJECT,
  required: ['store_name', 'purchase_date', 'items', 'tax', 'total_with_tax'],
  properties: {
    store_name: {
      type: Type.STRING,
      description: '商店名称'
    },
    purchase_date: {
      type: Type.STRING,
      description: 'YYYY-MM-DD格式的购买日期'
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          quantity: { type: Type.NUMBER },
          unit_price: { type: Type.NUMBER },
          total_price: { type: Type.NUMBER }
        }
      }
    },
    subtotal: { type: Type.NUMBER },
    tax: { type: Type.NUMBER },
    total_with_tax: { type: Type.NUMBER }
  }
};

// 将图像编码为base64
const imageBase64 = await fileToBase64(imageFile);

const result = await model.generateContent({
  contents: [
    {
      role: 'user',
      parts: [
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64
          }
        },
        {
          text: `分析以下收据图像并以结构化JSON返回。

          要求:
          1. 提取商店名称、购买日期、商品列表
          2. 每个商品的名称、数量、单价、总价
          3. 税额和最终合计
          4. 日期转换为YYYY-MM-DD格式
          `
        }
      ]
    }
  ],
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema
  }
});

const parsedData = JSON.parse(result.response.text());
// parsedData已经是遵循schema的类型安全对象
```

**核心优势**:

- <strong>类型安全</strong>:通过schema强制响应结构
- <strong>消除解析错误</strong>:JSON解析几乎不会失败
- <strong>即可使用</strong>:直接用于数据库存储或API响应

### 2. Credit System (积分系统)

**Stripe Checkout集成**:

```typescript
// src/routes/agents/credits/+page.server.ts
import Stripe from 'stripe';

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const actions = {
  purchase: async ({ request, locals }) => {
    const data = await request.formData();
    const planId = data.get('plan_id');

    const plans = {
      starter: { price: 2000, credits: 1000 },
      pro: { price: 10000, credits: 5500 },
      business: { price: 40000, credits: 23000 }
    };

    const selectedPlan = plans[planId];

    // 创建Stripe Checkout会话
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${planId.toUpperCase()} 套餐 - ${selectedPlan.credits} 积分`
            },
            unit_amount: selectedPlan.price
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${url.origin}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${url.origin}/credits`,
      metadata: {
        user_id: locals.user.id,
        credits: selectedPlan.credits,
        plan_id: planId
      }
    });

    return { session_url: session.url };
  }
};
```

**通过Webhook发放积分**:

```typescript
// src/routes/api/webhooks/stripe/+server.ts
export const POST = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  // 验证Stripe webhook
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, credits } = session.metadata;

    // 向Supabase添加积分
    await supabase
      .from('credits')
      .insert({
        user_id,
        amount: parseInt(credits),
        type: 'purchase',
        description: `Purchased ${credits} credits`
      });
  }

  return new Response(JSON.stringify({ received: true }));
};
```

### 3. API Authentication (API认证)

**API密钥发放和验证**:

```typescript
// API密钥生成
export const actions = {
  createApiKey: async ({ locals }) => {
    const apiKey = `effi_${crypto.randomUUID()}`;

    await supabase
      .from('api_keys')
      .insert({
        user_id: locals.user.id,
        key: apiKey,
        created_at: new Date().toISOString()
      });

    return { apiKey };
  }
};

// API密钥验证(在所有API请求中执行)
async function validateApiKey(request: Request) {
  const apiKey = request.headers.get('X-API-Key');

  if (!apiKey) {
    throw error(401, 'API key required');
  }

  const { data: keyData } = await supabase
    .from('api_keys')
    .select('user_id, is_active')
    .eq('key', apiKey)
    .single();

  if (!keyData || !keyData.is_active) {
    throw error(401, 'Invalid or inactive API key');
  }

  return keyData.user_id;
}

// 扣除积分前检查余额
async function checkAndDeductCredits(userId: string, amount: number) {
  const { data: balance } = await supabase
    .rpc('get_credit_balance', { user_id: userId });

  if (balance < amount) {
    throw error(402, 'Insufficient credits');
  }

  await supabase
    .from('credits')
    .insert({
      user_id: userId,
      amount: -amount,
      type: 'usage',
      description: 'OCR API call'
    });
}
```

### 4. Multi-language Support (多语言支持)

**使用Paraglide实现i18n**:

```typescript
// src/lib/i18n.ts
import { paraglide } from '@inlang/paraglide-sveltekit';

export const i18n = paraglide({
  project: './project.inlang',
  outdir: './src/paraglide',
  defaultLocale: 'ja'
});

// 支持语言: ko, en, ja, zh, es
```

**按语言路由**:

```typescript
// src/routes/[lang]/+layout.server.ts
export const load = async ({ params }) => {
  const lang = params.lang || 'ja';

  return {
    lang,
    translations: await import(`../../locales/${lang}.json`)
  };
};
```

## 令牌使用量跟踪和成本优化

**实时令牌监控**:

```typescript
const result = await model.generateContent({...});

// Gemini API返回令牌使用量
const usage = result.response.usageMetadata;

await supabase
  .from('api_usage')
  .insert({
    user_id,
    input_tokens: usage.promptTokenCount,
    output_tokens: usage.candidatesTokenCount,
    total_tokens: usage.totalTokenCount,
    estimated_cost: calculateCost(usage)
  });

function calculateCost(usage) {
  const INPUT_COST = 0.075 / 1_000_000; // $0.075 per 1M tokens
  const OUTPUT_COST = 0.30 / 1_000_000; // $0.30 per 1M tokens

  return (
    usage.promptTokenCount * INPUT_COST +
    usage.candidatesTokenCount * OUTPUT_COST
  );
}
```

## 业务战略

### Target Customers (目标客户)

1. <strong>日本入境旅游业务</strong>
   - 免税店、药妆店、百货商店
   - 月处理1,000笔以上免税业务

2. <strong>中小企业财务团队</strong>
   - 月处理500笔以上收据
   - 需要对接会计软件

3. <strong>税务师事务所</strong>
   - 代理客户公司财务
   - 需要精确数据

### SEO/AEO-Driven Acquisition (基于搜索的客户获取)

**内容营销策略**:

1. <strong>利用jangwook.net博客</strong>
   - 通过技术博客建立品牌信任度
   - 针对OCR、AI自动化相关关键词
   - 本文也是其中一环

2. <strong>日语关键词优化</strong>
   - "免税OCR"(免税 OCR)
   - "财务自动化"(経理 自動化)
   - "收据AI"(領収書 AI)

3. <strong>通过FAQ页面应对AEO</strong>
   - "OCR准确率?"→ 结构化回答
   - "API对接方法?"→ 开发者文档
   - "价格?"→ 透明价格表

### 3-Month KPI Targets (3个月KPI目标)

**独立开发者的现实目标**:

| 指标 | 目标 | 测量方法 |
|-----|-----|---------|
| 月访问量 | 500+ | Google Analytics |
| 用户注册 | 30人 | Supabase Auth表 |
| 付费转化 | 5人 | Stripe Dashboard |
| MRR | ¥30,000 | Stripe订阅总计 |
| OCR API调用 | 1,000次 | api_usage表 |

**Why These Numbers?**

- 500访问量 → 通过SEO可达成的现实数字
- 6%转化率(30/500) → B2B SaaS平均值
- 16.7%付费转化(5/30) → 高端定位
- ¥6,000 ARPU → 适合中小企业预算

## 开发日程

### Day 1 (2025-11-24): Foundation

**完成事项**:
- 项目初始化(SvelteKit + TypeScript)
- Supabase集成(Auth + Database)
- 首个服务实现:Receipt OCR for Tax Refund
- 护照+免税单据自动识别
- Structured Output schema验证

**代码量**: ~800行

### Day 2 (2025-11-25): Payment & Second Service

**完成事项**:
- 添加Accounting OCR服务
- Stripe Checkout集成
- 实现积分系统
- 通过Webhook自动充值
- 编写法律页面
  - 特定商业交易法(特定商取引法)
  - 隐私政策
  - 使用条款
- 集成Google Analytics

**代码量**: ~1,200行

### Day 3 (2025-11-26): Polish & Launch

**完成事项**:
- 服务说明页面
- API文档编写
- 着陆页优化
- 生产环境部署(Vercel)
- DNS配置

**代码量**: ~600行

**总计**: 3天,约2,600行代码

## 经验总结

### 1. SvelteKit 5的响应式系统是游戏改变者

**Before (React hooks)**:

```typescript
const [credits, setCredits] = useState(0);

useEffect(() => {
  const doubled = credits * 2;
  setDoubled(doubled);
}, [credits]);
```

**After (Svelte 5 runes)**:

```typescript
let credits = $state(0);
let doubled = $derived(credits * 2);
// 自动处理响应式,无需useEffect
```

**实际体会**:
- 样板代码减少70%
- 调试更容易(无需显式依赖)
- 性能提升(无不必要的重渲染)

### 2. Supabase RLS让多租户变简单

**Row Level Security策略**:

```sql
-- 每个用户只能查看自己的积分
CREATE POLICY "Users can view own credits"
ON credits FOR SELECT
USING (auth.uid() = user_id);

-- 只有服务端可以扣除积分
CREATE POLICY "Only service role can deduct"
ON credits FOR INSERT
USING (auth.role() = 'service_role');
```

**优势**:
- 应用代码无需权限检查
- SQL级别保证数据隔离
- 从源头防止安全漏洞

### 3. Gemini API成本优化

**Prompt优化**:

```typescript
// Before: 冗长的prompt
const prompt = `
您是专业的OCR系统。
请分析以下图像...
(500字以上的指示)
`;
// → Input tokens: ~150

// After: 简洁的prompt
const prompt = `Extract receipt data as JSON:
- store_name, date, items[], tax, total`;
// → Input tokens: ~25

// 成本节省: 83%
```

**图像尺寸优化**:

```typescript
// 将图像调整到1024px以内
import sharp from 'sharp';

const optimized = await sharp(imageBuffer)
  .resize(1024, 1024, { fit: 'inside' })
  .png({ quality: 80 })
  .toBuffer();

// 令牌使用量: 减少70%
```

### 4. Solo Developer Productivity Tips

**最大化生产力的方法**:

1. <strong>使用Supabase CLI本地开发</strong>
   ```bash
   supabase start
   # 本地PostgreSQL + Auth + Storage
   # 与生产环境相同
   ```

2. <strong>用Claude Code自动生成样板代码</strong>
   - CRUD API脚手架
   - TypeScript类型定义
   - Zod schema验证

3. <strong>Vercel Preview Deployments</strong>
   - 每个PR自动部署URL
   - 可立即向客户演示

## 下一步

### 立即执行(1周内)

1. <strong>日语关键词SEO优化</strong>
   - 用日语编写Meta description
   - 优化Open Graph图像
   - 添加Schema.org标记

2. <strong>编写FAQ页面</strong>
   - "OCR准确率?"→ 用实际数据回答
   - "支持哪些收据格式?"→ 示例图像
   - "API限制?"→ 明确Rate limit

3. <strong>提交到Google Search Console</strong>
   - 注册站点地图
   - 请求索引

### 短期目标(1个月内)

1. <strong>添加新服务</strong>
   - 扩展商业文档处理

2. <strong>获得首个B2B客户</strong>
   - 目标签约1家免税店
   - 基于积分的计费模式

3. <strong>完善API文档</strong>
   - 编写OpenAPI规范
   - 提供Postman Collection
   - SDK示例代码(Python, Node.js)

### 中期目标(3个月内)

1. <strong>达成MRR ¥30,000</strong>
   - 5个付费客户
   - 月500次API调用

2. <strong>分享使用案例</strong>
   - 客户成功案例博客文章
   - 实际应用案例文档化

3. <strong>添加高级功能</strong>
   - 批量处理(Batch processing)
   - 自定义schema支持
   - Webhook集成

## 参考资料

### Official Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs) - SvelteKit官方文档
- [Supabase Guides](https://supabase.com/docs) - Supabase指南
- [Google Gemini API Docs](https://ai.google.dev/docs) - Gemini API文档
- [Stripe Integration Guide](https://stripe.com/docs/checkout) - Stripe Checkout指南

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3价格和性能
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - 独立开发者成功案例
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaS营销策略
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripe积分系统

## 结语

3天内上线生产级SaaS<strong>是可能的</strong>。但目标不应该是"快速构建",而应该是<strong>"快速验证"</strong>。

核心是以下3点:

1. <strong>选择合适的工具</strong>:SvelteKit + Supabase + Gemini API
2. <strong>限制范围</strong>:从2个服务开始,上线优先于完美
3. <strong>业务优先</strong>:专注解决客户问题而非技术本身

现在真正的旅程才刚刚开始。获取首个付费客户、收集反馈、持续改进的过程。希望3个月后更新这篇文章时,能够写下"达成MRR ¥30,000"。

各位独立开发者,让我们一起努力。
