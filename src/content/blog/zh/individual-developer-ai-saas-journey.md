---
title: '独立开发者的AI SaaS构建之旅:3天完成生产环境上线'
description: >-
  使用SvelteKit、Supabase和Google Gemini API构建的B2B AI
  OCR服务的实战开发记录。技术选型理由、实现过程、业务战略,独立开发者的真实经验分享。
pubDate: '2025-11-27'
heroImage: ../../../assets/blog/individual-developer-ai-saas-journey-hero.png
tags:
  - svelte
  - ai
  - saas
  - supabase
relatedPosts:
  - slug: dena-llm-study-part1-fundamentals
    score: 0.9
    reason:
      ko: AI 주제를 한 단계 더 깊이 파고드는 글입니다.
      en: Goes one level deeper into AI.
      ja: AIをもう一歩深く掘り下げた記事です。
      zh: 更深入地探讨 AI 主题。
  - slug: dena-llm-study-part4-rag
    score: 0.85
    reason:
      ko: AI를 실제로 다뤄본 경험이 이어지는 글입니다.
      en: Continues the hands-on AI experience.
      ja: AIを実際に扱った経験が続く記事です。
      zh: 延续 AI 的实战经验。
faq:
  - question: "为什么选择Google Gemini API而不是OpenAI GPT?"
    answer: "成本是主要原因。Gemini 2.5 Flash每100万输入token收费0.075美元、输出0.30美元,比GPT-4 Turbo便宜约100倍。它还支持Structured Output来强制输出类型安全的JSON,图像OCR质量在收据和护照等复杂版面上也表现出色。"
  - question: "为什么选择SvelteKit而不是Next.js?"
    answer: "Svelte 5的Runes响应式系统比React hooks更直观,样板代码减少约70%。由于Svelte在编译时移除框架代码,客户端打包体积比React小40%,Time to Interactive也更快。部署平台Vercel直接支持SvelteKit也是一个加分项。"
  - question: "Gemini API的成本是如何降低的?"
    answer: "用了两个方法。把冗长的指令提示词精简后,输入token从约150降到25,节省了约83%的成本。再把图像缩放到1024px以内,token用量又降低了70%。"
  - question: "3个月的KPI目标是什么?"
    answer: "目标是月访问量500以上、注册30人、付费转化5人、MRR3万日元、OCR API调用1,000次。6%的注册转化率和16.7%的付费转化率是基于B2B SaaS平均水平设定的、对独立开发者来说现实的数字。"
---

## 3天把它推上生产环境

过去这3天,我把一个基于AI的B2B SaaS从零做到了生产环境上线。它叫<a href="https://agent-effi-flow.jangwook.net" target="_blank" rel="noopener noreferrer">Agent Effi Flow</a>,提供免税处理OCR和财务OCR两种AI自动化工具。主要面向日本入境旅游业务和中小企业财务团队。

这篇文章不谈"理论上可行"。我写的是<strong>真正落地的经验</strong>。技术栈为什么这么选、核心部分怎么搭、中途卡在哪里,还有头3个月的KPI目标,都如实记下来。

## 为什么要做这个SaaS

### 问题定义

在日本工作期间发现的B2B自动化需求:

1. <strong>免税处理业务依赖人工操作</strong>:需要人工核对护照和免税单据并手工录入
2. <strong>财务工作重复性高</strong>:收据OCR后仍需手动整理数据。用真实数据看AI财务自动化的效果从数字角度展示了这一问题的严重程度。
3. <strong>现有解决方案的局限性</strong>:要么是昂贵的企业级方案,要么是精度低的通用OCR

作为独立开发者,差异化的关键在于<strong>利用AI提取结构化数据</strong>。不仅仅是文字OCR,而是通过Google Gemini API的Structured Output功能获取类型安全的JSON响应,提供可以直接用于业务逻辑的数据。关于这个服务后续的方向调整,请参见Agent Effi Flow的转型决策与待客机器人构想。

## 技术栈选择

### 为什么选择SvelteKit

选择SvelteKit而不是Next.js的理由:

<strong>1. Svelte 5的革命性响应式系统</strong>

```typescript
// Svelte 5 Runes: $state和$derived
let count = $state(0);
let doubled = $derived(count * 2);

// 比React hooks更直观,样板代码更少
```

<strong>2. 打包体积和性能</strong>

- Svelte在编译时移除框架代码
- 客户端bundle比React小40%
- Time to Interactive明显更快

<strong>3. 开发者体验</strong>

- 学习曲线平缓,代码易读
- TypeScript支持优秀
- 基于Vite的HMR速度快

### 为什么选择Supabase作为后端

选择Supabase而不是Firebase:

<strong>1. PostgreSQL的强大功能</strong>

```sql
-- 通过Row Level Security实现多租户
CREATE POLICY "Users can only access their own data"
ON credits FOR SELECT
USING (auth.uid() = user_id);
```

<strong>2. 集成化功能</strong>

- Auth:即开即用的邮箱/社交登录
- Database:支持实时订阅的PostgreSQL
- Storage:文件上传和CDN
- Edge Functions:基于Deno的Serverless函数

<strong>3. 开源和定价</strong>

- 完全开源(可自托管)
- 慷慨的免费套餐(50,000 MAU,500MB数据库)
- 无需担心供应商锁定

### 为什么选择Google Gemini API作为AI模型

选择Gemini而不是OpenAI GPT:

<strong>1. 成本效益</strong>

```
Gemini 2.5 Flash:
- Input: $0.075 / 1M tokens
- Output: $0.30 / 1M tokens

GPT-4 Turbo:
- Input: $10 / 1M tokens
- Output: $30 / 1M tokens

→ 约便宜100倍
```

<strong>2. Structured Output支持</strong>

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

<strong>3. 多模态性能</strong>

- 图像OCR质量优秀(OmniDocBench基准测试第一名)
- 在处理护照、收据等复杂布局方面表现出色

### 为什么选择Vercel作为部署平台

<strong>1. SvelteKit优化</strong>

- Vercel创建了SvelteKit并提供直接支持
- 自动SSR/Edge Function部署
- 构建缓存使部署速度更快

<strong>2. Serverless架构</strong>

- API路由自动部署为serverless function
- 按使用量计费(无流量时几乎零成本)
- 全球Edge Network

## 核心实现

### 1. OCR API with Structured Output

<strong>实际代码</strong> (`src/routes/api/receipt-ocr/+server.ts`):

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

<strong>核心优势</strong>:

- <strong>类型安全</strong>:通过schema强制响应结构
- <strong>消除解析错误</strong>:JSON解析几乎不会失败
- <strong>即可使用</strong>:直接用于数据库存储或API响应

### 2. Credit System (积分系统)

<strong>Stripe Checkout集成</strong>:

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

<strong>通过Webhook发放积分</strong>:

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

<strong>API密钥发放和验证</strong>:

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

<strong>使用Paraglide实现i18n</strong>:

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

<strong>按语言路由</strong>:

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

<strong>实时令牌监控</strong>:

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

<strong>内容营销策略</strong>:

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

<strong>独立开发者的现实目标</strong>:

| 指标 | 目标 | 测量方法 |
|-----|-----|---------|
| 月访问量 | 500+ | Google Analytics |
| 用户注册 | 30人 | Supabase Auth表 |
| 付费转化 | 5人 | Stripe Dashboard |
| MRR | ¥30,000 | Stripe订阅总计 |
| OCR API调用 | 1,000次 | api_usage表 |

<strong>Why These Numbers?</strong>

- 500访问量 → 通过SEO可达成的现实数字
- 6%转化率(30/500) → B2B SaaS平均值
- 16.7%付费转化(5/30) → 高端定位
- ¥6,000 ARPU → 适合中小企业预算

## 开发日程

### Day 1 (2025-11-24): Foundation

<strong>完成事项</strong>:
- 项目初始化(SvelteKit + TypeScript)
- Supabase集成(Auth + Database)
- 首个服务实现:Receipt OCR for Tax Refund
- 护照+免税单据自动识别
- Structured Output schema验证

<strong>代码量</strong>: ~800行

### Day 2 (2025-11-25): Payment & Second Service

<strong>完成事项</strong>:
- 添加Accounting OCR服务
- Stripe Checkout集成
- 实现积分系统
- 通过Webhook自动充值
- 编写法律页面
  - 特定商业交易法(特定商取引法)
  - 隐私政策
  - 使用条款
- 集成Google Analytics

<strong>代码量</strong>: ~1,200行

### Day 3 (2025-11-26): Polish & Launch

<strong>完成事项</strong>:
- 服务说明页面
- API文档编写
- 着陆页优化
- 生产环境部署(Vercel)
- DNS配置

<strong>代码量</strong>: ~600行

<strong>总计</strong>: 3天,约2,600行代码

## 经验总结

### 1. SvelteKit 5的响应式系统是游戏改变者

<strong>Before (React hooks)</strong>:

```typescript
const [credits, setCredits] = useState(0);

useEffect(() => {
  const doubled = credits * 2;
  setDoubled(doubled);
}, [credits]);
```

<strong>After (Svelte 5 runes)</strong>:

```typescript
let credits = $state(0);
let doubled = $derived(credits * 2);
// 自动处理响应式,无需useEffect
```

<strong>实际体会</strong>:
- 样板代码减少70%
- 调试更容易(无需显式依赖)
- 性能提升(无不必要的重渲染)

### 2. Supabase RLS让多租户变简单

<strong>Row Level Security策略</strong>:

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

<strong>优势</strong>:
- 应用代码无需权限检查
- SQL级别保证数据隔离
- 从源头防止安全漏洞

### 3. Gemini API成本优化

<strong>Prompt优化</strong>:

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

<strong>图像尺寸优化</strong>:

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

<strong>最大化生产力的方法</strong>:

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
   
   借助AI工具将副业项目发展为公司规模的做法,在Effloow：从副业到AI公司中也有详细介绍。

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

## 这套技术栈何时该用、何时该避开

3天能上线,是因为问题和技术栈恰好契合。同样的选择并不是每个项目的正确答案。

<strong>适合采用这套方案的情况</strong>:

- 独立开发者或小团队需要快速验证MVP。托管后端(Supabase)与无服务器部署(Vercel)几乎消除了所有基础设施运维负担。
- AI推理成本直接计入单位经济的按量计费服务。Gemini 2.5 Flash低廉的token单价保护了利润率。关于AI运营成本的现实拆解,我在<a href="/zh/blog/zh/ai-agent-cost-reality">AI智能体成本的现实</a>中做了更深入的探讨。
- 流量波动大或早期几乎为零的服务。无服务器计费在空闲时成本接近于0。
- 结构化数据提取是核心价值的场景。Structured Output直接省去了整个解析层。

<strong>应避开或重新考虑的情况</strong>:

- 有严格数据治理或本地部署要求。把图像发送到外部LLM API这一结构本身就可能撞上合规壁垒。
- 对毫秒级延迟敏感的工作负载。LLM推理需要数百毫秒到数秒,不适合实时处理。
- 每月数百万次以上稳定且可预测的大批量处理。在这个规模下,专用基础设施或自托管模型在单价上会优于无服务器与按次API。基于真实运营数据验证的成本与效果分析,可参见<a href="/zh/blog/zh/effiflow-automation-analysis-part2">Effi Flow自动化分析</a>。
- OCR错误会直接酿成事故的高风险领域(医疗处方、法律合同原件)。必须保留人工复核环节,"完全自动化"的前提随之瓦解。

学习新工具的成本同样不可忽视。对已经精通React/Next.js的团队来说,切换到SvelteKit的学习成本有时会超过其在打包体积上的收益。独立开发者用AI工具提升生产力的实际模式,我整理在<a href="/zh/blog/zh/claude-code-insights-usage-analysis">Claude Code使用分析</a>中。

## 参考资料

### Official Documentation

- [SvelteKit Documentation](https://svelte.dev/docs/kit) - SvelteKit官方文档
- [Supabase Documentation](https://supabase.com/docs) - Supabase指南
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs) - Gemini API文档
- [Stripe Checkout Docs](https://docs.stripe.com/payments/checkout) - Stripe Checkout指南

### Key Articles Referenced

- [Gemini 3 for developers](https://blog.google/technology/developers/gemini-3-developers/) - Gemini 3价格和性能
- [Solo Developer SaaS Success Stories](https://dev.to/dev_tips/the-solo-dev-saas-stack-powering-10kmonth-micro-saas-tools-in-2025-pl7) - 独立开发者成功案例
- [B2B SaaS Go-to-Market Strategies](https://martal.ca/b2b-saas-marketing-strategies-lb/) - B2B SaaS营销策略
- [Stripe Credits for Usage-Based Billing](https://stripe.com/blog/introducing-credits-for-usage-based-billing) - Stripe积分系统

## 这场3天上线给我的东西

3天内上线一个生产级SaaS,<strong>是做得到的</strong>。但"快速构建"从来不是目的。真正的目的是<strong>"快速验证"</strong>。

回头看,真正起作用的是这3点:

1. <strong>选择合适的工具</strong>:SvelteKit + Supabase + Gemini API
2. <strong>限制范围</strong>:从2个服务开始,上线优先于完美
3. <strong>业务优先</strong>:专注解决客户问题而非技术本身

真正的旅程从现在才开始。拿下第一个付费客户,再靠他们的反馈一点点打磨产品,这些枯燥的活儿还在后头。希望3个月后回来更新这篇文章时,我能写下"已达成MRR ¥30,000"。

各位独立开发者,让我们一起努力。
