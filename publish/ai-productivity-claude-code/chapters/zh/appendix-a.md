# 附录 A: 故障排查指南

## 概述

在实际项目中使用 Claude Code 时,您会遇到各种问题。本附录系统地整理了从 71 个实际项目运营经验中积累的常见问题及其解决方案。

每个问题都按照**症状 → 原因 → 解决方案 → 预防方法**的顺序组织,旨在在问题发生时能够快速响应。

---

## A.1: 常见错误及解决方案

### A.1.1: 认证错误

#### 症状 (Symptom)

```bash
Error: Authentication failed. Please check your API key.
```

或

```bash
Error: 401 Unauthorized - Invalid API key
```

运行 Claude Code 时 API 密钥认证失败,导致所有操作被阻止。

#### 原因 (Cause)

1. **未设置 API 密钥**: 环境变量或配置文件中缺少 API 密钥
2. **错误的 API 密钥**: 复制密钥时包含了空格或特殊字符
3. **过期的 API 密钥**: 密钥有效期已结束或被删除
4. **权限不足**: API 密钥未分配所需的权限(scope)

#### 解决方案 (Solution)

**步骤 1: 检查 API 密钥**

```bash
# 检查环境变量
echo $ANTHROPIC_API_KEY

# 或检查配置文件
cat ~/.config/claude/config.json
```

**步骤 2: 重新设置 API 密钥**

```bash
# 通过 Claude Code CLI 进行认证
claude auth login

# 或直接设置环境变量 (Linux/macOS)
export ANTHROPIC_API_KEY="sk-ant-api..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-api..."
```

**步骤 3: 验证密钥有效性**

```bash
# 通过简单的 API 调用进行测试
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**步骤 4: 检查权限**

在 Anthropic Console 中:
- 确认 API 密钥处于活动状态
- 确认对所需模型(如 Claude 3.5 Sonnet)具有访问权限
- 确认未超出使用限额

#### 预防方法 (Prevention)

1. **永久设置环境变量**
   ```bash
   # 添加到 ~/.bashrc 或 ~/.zshrc
   echo 'export ANTHROPIC_API_KEY="sk-ant-api..."' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **安全管理 API 密钥**
   - 使用 `.env` 文件时务必添加到 `.gitignore`
   - 不要在代码中硬编码密钥
   - 使用秘密管理工具(1Password、Vault 等)

3. **定期更新密钥**
   - 根据安全策略每 3〜6 个月更换密钥
   - 为每个项目使用单独的密钥(权限分离)

4. **设置监控**
   - 在 Anthropic Console 中设置使用量警报
   - 设置预算限制以防止意外费用

---

### A.1.2: 网络错误

#### 症状 (Symptom)

```bash
Error: Network request failed
Error: ECONNREFUSED
Error: Timeout waiting for response
```

API 调用期间网络连接失败导致操作中断。

#### 原因 (Cause)

1. **网络连接中断**: 网络不稳定或防火墙阻止
2. **代理设置问题**: 公司网络中未设置代理
3. **DNS 解析失败**: 无法解析 Anthropic API 服务器域名
4. **超时设置不足**: 等待大量响应时超时
5. **频率限制**: 超出 API 调用频率限制

#### 解决方案 (Solution)

**步骤 1: 基本网络诊断**

```bash
# 检查网络连接
ping 8.8.8.8

# 检查能否访问 Anthropic API 服务器
curl -I https://api.anthropic.com

# 检查 DNS 解析
nslookup api.anthropic.com
```

**步骤 2: 代理设置(公司网络)**

```bash
# HTTP 代理设置
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"

# 在 Claude Code 配置文件中指定代理
# ~/.config/claude/config.json
{
  "proxy": "http://proxy.company.com:8080"
}
```

**步骤 3: 调整超时时间**

在 `.claude/settings.local.json` 中:

```json
{
  "apiTimeout": 300000,  // 延长到 5 分钟(默认 60 秒)
  "maxRetries": 3,       // 增加重试次数
  "retryDelay": 2000     // 重试间隔 2 秒
}
```

**步骤 4: 应对频率限制**

```javascript
// 在请求之间添加延迟(Node.js 示例)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callClaudeWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await claude.messages.create({ /* ... */ });
      return response;
    } catch (error) {
      if (error.status === 429) {  // 频率限制
        const waitTime = Math.pow(2, i) * 1000;  // 指数退避
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

#### 预防方法 (Prevention)

1. **构建稳定的网络环境**
   - 执行重要任务时使用有线连接
   - 使用 VPN 时验证稳定性

2. **实现自动重试逻辑**
   ```python
   # Python 示例(tenacity 库)
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def call_claude_api():
       # API 调用代码
       pass
   ```

3. **管理 API 调用频率**
   - 监控频率限制信息(响应头中的 `x-ratelimit-*`)
   - 批量操作时应用批处理和延迟

4. **缓存策略**
   - 对相同的提示结果使用本地缓存
   - 元数据优先架构(参考 Chapter 16)

---

### A.1.3: token 限制错误

#### 症状 (Symptom)

```bash
Error: Request exceeds maximum token limit (200,000 tokens)
Error: Context length exceeded
```

提示或响应超出模型的上下文窗口,请求被拒绝。

#### 原因 (Cause)

1. **上下文过大**: CLAUDE.md、代码库、对话历史过大
2. **包含大文件**: 在提示中包含日志文件、数据文件等
3. **累积的对话历史**: 长时间对话导致上下文累积
4. **提示结构低效**: 重复信息、不必要的说明

#### 解决方案 (Solution)

**步骤 1: 分析 token 使用量**

```bash
# 在 Claude Code 中检查 token 使用量
# 在对话中询问 Claude
"当前上下文的 token 使用量是多少?"
```

**步骤 2: 优化上下文**

```markdown
<!-- 优化前的 CLAUDE.md -->
## 所有文件说明
- src/components/Header.astro: 头部组件。显示导航和 logo...
- src/components/Footer.astro: 页脚组件。显示版权和链接...
(继续 100 行...)

<!-- 优化后 -->
## 核心组件
- Header/Footer: `src/components/`
- 需要时参考相应文件了解详细结构
```

**步骤 3: 清理对话历史**

```bash
# 在 Claude Code 中初始化对话
/clear

# 或开始新对话
"我们将转到新主题。请忽略之前的对话上下文。"
```

**步骤 4: 应用分块策略**

处理大量数据时:

```python
# 错误的方法: 一次发送所有数据
all_posts = read_all_blog_posts()  # 10,000 行
prompt = f"请分析以下文章:\n{all_posts}"

# 正确的方法: 分块和批处理
def process_in_chunks(posts, chunk_size=10):
    results = []
    for i in range(0, len(posts), chunk_size):
        chunk = posts[i:i+chunk_size]
        result = claude_api.analyze(chunk)
        results.append(result)
    return merge_results(results)
```

**步骤 5: 使用外部文件引用**

```markdown
<!-- 不要在提示中包含完整代码 -->
"请修复以下文件中的错误:
文件: src/components/BlogCard.astro"

<!-- Claude 使用 Read 工具加载文件 -->
```

#### 预防方法 (Prevention)

1. **简化 CLAUDE.md**
   - 仅包含必要信息(命令、结构、规则)
   - 将详细说明分离到单独的文档
   - 目标: 保持在 2000 行以下

2. **使用提示模板**
   ```markdown
   # 高效的提示模板
   ## 目标
   [用 1-2 句话明确说明]

   ## 上下文
   [仅包含必要信息,优先使用文件路径]

   ## 要求
   - [具体且可衡量的项目]
   ```

3. **定期使用 /clear**
   - 每次主题切换时初始化对话
   - 长时间工作后开始新会话

4. **元数据优先架构**
   - 使用元数据而不是完整内容
   - 创建类似 `post-metadata.json` 的索引文件
   - 仅在必要时加载完整文件

---

### A.1.4: 上下文溢出

#### 症状 (Symptom)

```bash
Warning: Context approaching limit (180,000 / 200,000 tokens)
Error: Unable to process request - context overflow
```

或 Claude 的响应:
- 突然变短
- 忘记之前的对话内容
- 重复提问

#### 原因 (Cause)

1. **长对话会话**: 在一次对话中执行多个任务
2. **读取大文件**: 连续加载多个大文件
3. **子代理链**: 多个代理之间的切换导致上下文累积
4. **调试模式**: 详细日志包含在上下文中

#### 解决方案 (Solution)

**步骤 1: 检测上下文负载**

当 Claude 显示以下信号时要注意:
- "让我重新确认之前提到的内容"
- 重复已经回答的问题
- 响应质量下降

**步骤 2: 立即清理对话**

```bash
# 选项 1: 完全初始化
/clear

# 选项 2: 总结后重启
"请用 3 行总结到目前为止的工作,然后开始新对话"
```

**步骤 3: 分割任务**

```markdown
<!-- 错误的方法: 在一次对话中执行所有任务 -->
1. 撰写博客文章
2. SEO 优化
3. 生成图像
4. 翻译成 4 种语言
5. 提交和部署

<!-- 正确的方法: 每个任务单独对话 -->
会话 1: 撰写博客文章 → /clear
会话 2: SEO 优化 → /clear
会话 3: 生成图像 → /clear
会话 4: 翻译 → /clear
```

**步骤 4: 使用子代理**

```bash
# 减少主对话负担
@writing-assistant "撰写博客文章"  # 单独的上下文
@seo-optimizer "优化元数据"       # 独立运行
```

#### 预防方法 (Prevention)

1. **管理对话寿命**
   - 复杂任务: 15〜20 轮对话后使用 /clear
   - 简单任务: 5〜10 轮后清理

2. **设计无状态任务**
   - 确保每个任务不依赖于之前的对话
   - 每次明确提供所需的上下文

3. **优化文件读取**
   ```bash
   # 只读取必要部分,而不是完整文件
   "请只读取 src/components/Header.astro 的 30-50 行"

   # 或先总结
   "请只了解这个文件的结构(不要完整读取)"
   ```

4. **基于 Hook 的自动化**
   - 将重复任务自动化为 Hook
   - 最小化与 Claude 的对话(参考 Chapter 10)

---

## A.2: 性能问题诊断

### A.2.1: 响应速度慢

#### 症状 (Symptom)

- 简单问题也需要 30 秒以上
- "Thinking..." 状态过长
- API 调用后长时间无响应

#### 原因 (Cause)

1. **复杂的提示**: 模糊或多重要求
2. **大量数据处理**: 一次分析数百个文件
3. **递归代理调用**: 接近无限循环的子代理链
4. **网络延迟**: 网络连接慢
5. **模型负载**: Anthropic API 服务器拥堵

#### 解决方案 (Solution)

**步骤 1: 优化提示**

```markdown
<!-- Before: 模糊且复杂 -->
"分析博客找出优点和缺点,改进 SEO,
测量性能,并检查安全问题。"

<!-- After: 明确且简单 -->
"请只检查博客的 SEO 元数据(title, description)。
- 目标: 提高点击率
- 文件: src/content/blog/ko/latest-post.md"
```

**步骤 2: 引入批处理**

```python
# 顺序处理(慢)
for post in all_posts:
    result = claude.analyze(post)  # 每个 10 秒 = 总共 100 秒

# 批处理(快)
batch_results = claude.analyze_batch(all_posts)  # 总共 15 秒
```

**步骤 3: 使用缓存**

```javascript
// 添加缓存层
const cache = new Map();

async function getAnalysis(postId) {
  if (cache.has(postId)) {
    return cache.get(postId);  // 立即返回
  }

  const result = await claude.analyze(postId);
  cache.set(postId, result);
  return result;
}
```

**步骤 4: 并行处理**

```bash
# 在 Claude Code 中同时运行多个任务
"请同时分析以下 3 个文件:
1. src/components/A.astro
2. src/components/B.astro
3. src/components/C.astro"
```

#### 预防方法 (Prevention)

1. **以小单位工作**
   - 将大任务分成 5〜10 个步骤
   - 确认每个步骤的结果后再继续

2. **使用 Think 工具**
   - 使用 Think 模式预先计划复杂决策
   - 保持执行步骤简单

3. **元数据优先**
   - 使用元数据进行初步过滤,而不是完整内容
   - 仅对必要项目进行详细分析

4. **设置时间限制**
   ```json
   // .claude/settings.local.json
   {
     "maxThinkingTime": 30,  // Think 模式限制 30 秒
     "taskTimeout": 300      // 整体任务限制 5 分钟
   }
   ```

---

### A.2.2: 内存问题

#### 症状 (Symptom)

```bash
Error: JavaScript heap out of memory
Process killed (OOM - Out Of Memory)
```

或:
- Claude Code 突然终止
- 整个系统变慢
- 过度使用交换内存

#### 原因 (Cause)

1. **加载大文件**: 读取数百 MB 的日志文件
2. **内存泄漏**: 缓存无限增长
3. **并发任务过多**: 并行进程太多
4. **临时文件未清理**: 构建产物累积

#### 解决方案 (Solution)

**步骤 1: 监控内存使用**

```bash
# 检查系统内存
top
# 或
htop

# 检查 Node.js 进程内存
node --trace-gc your-script.js
```

**步骤 2: 增加 Node.js 堆大小**

```bash
# 设置环境变量
export NODE_OPTIONS="--max-old-space-size=4096"  # 4GB

# 或直接运行
node --max-old-space-size=4096 script.js
```

**步骤 3: 应用流处理**

```javascript
// 错误的方法: 将整个文件加载到内存
const allData = fs.readFileSync('huge-log.txt', 'utf8');  // OOM!

// 正确的方法: 流处理
const stream = fs.createReadStream('huge-log.txt');
stream.on('data', chunk => {
  processChunk(chunk);  // 逐块处理
});
```

**步骤 4: 缓存清理策略**

```javascript
// 使用 LRU 缓存(大小限制)
const LRU = require('lru-cache');

const cache = new LRU({
  max: 100,              // 最多 100 个项目
  maxAge: 1000 * 60 * 60 // 1 小时后过期
});
```

**步骤 5: 任务队列管理**

```javascript
// 限制并发执行
const pLimit = require('p-limit');
const limit = pLimit(5);  // 最多同时执行 5 个

const promises = files.map(file =>
  limit(() => processFile(file))
);
await Promise.all(promises);
```

#### 预防方法 (Prevention)

1. **文件大小限制**
   ```bash
   # 警告 10MB 以上的文件
   find . -type f -size +10M

   # 在 .gitignore 中排除大文件
   *.log
   dist/
   node_modules/
   ```

2. **定期清理**
   ```bash
   # 自动清理临时文件(Hook)
   # .claude/hooks/post-commit.sh
   #!/bin/bash
   rm -rf .temp/
   npm run clean
   ```

3. **性能分析**
   ```bash
   # 分析内存使用模式
   node --inspect your-script.js
   # 使用 Chrome DevTools 检查内存快照
   ```

4. **明确资源限制**
   ```yaml
   # docker-compose.yml(使用容器时)
   services:
     claude-agent:
       image: node:18
       mem_limit: 2g      # 2GB 限制
       memswap_limit: 2g  # 防止交换
   ```

---

### A.2.3: 成本超支

#### 症状 (Symptom)

- 几天内耗尽月度预算
- Anthropic 账单金额是预期的 2〜3 倍
- API 调用次数激增

#### 原因 (Cause)

1. **无限循环**: 代理持续重试
2. **大量 token 使用**: 重复发送不必要的上下文
3. **工作流程低效**: 重复执行相同任务
4. **测试环境未分离**: 实验工作调用生产 API

#### 解决方案 (Solution)

**步骤 1: 分析使用量**

```bash
# 在 Anthropic Console 中查看
- API Usage Dashboard
- Cost by Model (Sonnet vs Opus)
- Top consuming projects
```

**步骤 2: 自动化成本监控**

```python
# 成本警报脚本
import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 查询使用量(虚拟 API - 实际查看仪表板)
usage = client.usage.get_current_month()

if usage['cost'] > 100:  # 超过 $100 时
    send_alert(f"Cost alert: ${usage['cost']}")
```

**步骤 3: token 优化**

```markdown
<!-- Before: 26,000 tokens -->
CLAUDE.md: 15,000 tokens(所有文件的详细说明)
Prompt: 8,000 tokens(包含完整代码)
Response: 3,000 tokens

<!-- After: 8,000 tokens -->
CLAUDE.md: 3,000 tokens(仅核心内容)
Prompt: 2,000 tokens(仅文件路径)
Response: 3,000 tokens

**成本节省**: 26k → 8k = **节省 69%**
```

**步骤 4: 缓存策略**

```javascript
// 重用元数据(参考 Chapter 16)
const metadata = JSON.parse(fs.readFileSync('post-metadata.json'));

// 仅重新处理已更改的文章
const changedPosts = metadata.filter(post =>
  post.contentHash !== calculateHash(post.filePath)
);

// 其余使用缓存
console.log(`Processing ${changedPosts.length} / ${metadata.length} posts`);
// 成本节省: 100 个 → 5 个 = 节省 95%
```

**步骤 5: 模型优化**

```javascript
// 为每个任务选择合适的模型
const tasks = {
  simple: 'claude-3-haiku-20240307',      // 便宜
  standard: 'claude-3-5-sonnet-20241022', // 中等
  complex: 'claude-opus-4-20250514'       // 高级
};

// 简单任务使用 Haiku
if (task === 'format-check') {
  model = tasks.simple;  // 成本 1/10
}
```

#### 预防方法 (Prevention)

1. **设置预算限制**
   ```json
   // .claude/settings.local.json
   {
     "budget": {
       "monthly": 100,      // $100/月
       "alertAt": 80,       // 达到 $80 时警报
       "stopAt": 100        // 达到 $100 时停止
     }
   }
   ```

2. **使用本地模型**
   - 开发/测试: Llama 3、Mistral 等本地模型
   - 生产: Claude API
   ```bash
   # 使用 Ollama 进行本地测试
   ollama run llama3 "测试提示"
   ```

3. **提示库**
   - 重用已验证的提示
   - 在单独的账户/项目中进行实验

4. **自动化优先**
   - 基于 Hook 的工作流程(免费)
   - 仅在必要时调用 Claude
   ```bash
   # Hook 中的简单检查使用脚本
   # .claude/hooks/pre-commit.sh
   #!/bin/bash

   # 简单验证(免费)
   npm run lint
   npm run type-check

   # 仅复杂分析使用 Claude
   if [ "$COMPLEX_REVIEW" = "true" ]; then
     claude review
   fi
   ```

---

## A.3: 调试技术

### A.3.1: 日志分析

#### 启用基本日志

**步骤 1: Claude Code 调试模式**

```bash
# 设置环境变量
export CLAUDE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# 指定日志文件
export CLAUDE_LOG_FILE=~/claude-debug.log
```

**步骤 2: 查看详细日志**

```bash
# 实时跟踪日志
tail -f ~/claude-debug.log

# 仅过滤错误
grep "ERROR" ~/claude-debug.log

# 跟踪特定 API 调用
grep "api.anthropic.com" ~/claude-debug.log
```

**步骤 3: token 使用量日志**

```javascript
// 使用自定义包装器记录所有 API 调用
const originalCreate = client.messages.create;

client.messages.create = async function(...args) {
  const startTime = Date.now();
  const response = await originalCreate.apply(this, args);

  const elapsed = Date.now() - startTime;
  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;
  const cost = calculateCost(inputTokens, outputTokens);

  console.log({
    timestamp: new Date().toISOString(),
    elapsed,
    inputTokens,
    outputTokens,
    cost,
    model: args[0].model
  });

  return response;
};
```

#### 日志模式分析

**常见错误模式**:

```bash
# 1. 认证失败
[ERROR] 401 Unauthorized
→ 原因: API 密钥问题
→ 解决: 参考 A.1.1

# 2. 频率限制
[ERROR] 429 Too Many Requests
→ 原因: 超出 API 调用频率
→ 解决: 指数退避重试

# 3. 超时
[ERROR] Request timeout after 60000ms
→ 原因: 大量数据或网络延迟
→ 解决: 增加超时或分块

# 4. 上下文超出
[ERROR] Context length 210000 exceeds limit 200000
→ 原因: 提示过大
→ 解决: 参考 A.1.3
```

#### 结构化日志

```typescript
// 日志工具
class Logger {
  private logFile: string;

  constructor(logFile: string) {
    this.logFile = logFile;
  }

  log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: string, metadata?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...metadata
    };

    fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');

    if (level === 'ERROR') {
      console.error(message, metadata);
    }
  }

  debug(message: string, metadata?: any) {
    this.log('DEBUG', message, metadata);
  }

  error(message: string, metadata?: any) {
    this.log('ERROR', message, metadata);
  }
}

// 使用示例
const logger = new Logger('~/claude-app.log');

logger.debug('Starting blog post generation', { postId: '123' });
logger.error('Failed to generate image', { error: e.message, stack: e.stack });
```

---

### A.3.2: 分步执行

#### 分解复杂任务

**问题情况**: 博客自动化完整流程在中途失败,但不清楚在哪里出了问题

**解决策略**: 独立执行并验证每个步骤

**步骤 1: 分解工作流程**

```markdown
完整流程:
1. 选择主题 (@content-planner)
2. 撰写草稿 (@writing-assistant)
3. 生成图像 (@image-generator)
4. SEO 优化 (@seo-optimizer)
5. 翻译成 4 种语言
6. 生成元数据 (@content-analyzer)
7. 计算推荐文章 (@content-recommender)
8. 提交和部署

分步测试:
在单独的对话中执行每个步骤并验证输出
```

**步骤 2: 保存中间结果**

```javascript
// 每步保存中间文件
const pipeline = {
  async step1_planning() {
    const topic = await contentPlanner.suggest();
    fs.writeFileSync('.temp/step1-topic.json', JSON.stringify(topic));
    return topic;
  },

  async step2_writing() {
    const topic = JSON.parse(fs.readFileSync('.temp/step1-topic.json'));
    const draft = await writingAssistant.write(topic);
    fs.writeFileSync('.temp/step2-draft.md', draft);
    return draft;
  },

  async step3_image() {
    const draft = fs.readFileSync('.temp/step2-draft.md', 'utf8');
    const image = await imageGenerator.create(draft);
    fs.writeFileSync('.temp/step3-image.jpg', image);
    return image;
  },

  // ... 继续
};

// 可以只重新运行特定步骤
await pipeline.step3_image();  // 仅重试图像生成
```

**步骤 3: Dry-run 模式**

```bash
# 执行 Hook 时使用 dry-run 选项
export CLAUDE_DRY_RUN=true

# 不实际更改文件,仅输出日志
.claude/hooks/pre-commit.sh
# → "Would run: npm test"
# → "Would check: frontmatter validation"
```

**步骤 4: 条件执行**

```bash
# 通过环境变量分步激活
export SKIP_IMAGE_GEN=true
export SKIP_TRANSLATION=true

# 在脚本中
if [ "$SKIP_IMAGE_GEN" != "true" ]; then
  node generate_image.js
fi
```

#### 使用断点

```javascript
// 插入调试器
async function complexWorkflow() {
  const step1 = await doStep1();
  debugger;  // 在这里暂停以检查 step1 结果

  const step2 = await doStep2(step1);
  debugger;  // 检查 step2 结果

  return step2;
}

// 使用 Node.js 调试器运行
node inspect workflow.js
```

#### 逐步增加复杂度

```markdown
<!-- 测试顺序 -->
1. 从最小输入开始
   - 例: 仅处理 1 篇文章

2. 正常情况
   - 例: 处理 3 篇文章

3. 边界条件
   - 例: 0 篇、100 篇文章

4. 错误情况
   - 例: 错误的 frontmatter、缺失的图像

5. 完整生产
   - 例: 所有文章(71 篇)
```

---

### A.3.3: 错误重现

#### 编写可重现的测试用例

**目标**: 使间歇性错误 100% 可重现

**步骤 1: 固定环境**

```bash
# 固定版本
node --version  # v18.17.0
npm --version   # 9.6.7

# 明确环境变量
export NODE_ENV=production
export ANTHROPIC_API_KEY=sk-ant-api...
export CLAUDE_DEBUG=true

# 固定依赖
npm ci  # 基于 package-lock.json 安装
```

**步骤 2: 固定输入数据**

```javascript
// 使用测试装置
const testPost = {
  title: "Test Post",
  description: "Test description",
  pubDate: "2025-01-15",
  content: fs.readFileSync('test/fixtures/sample-post.md', 'utf8')
};

// 使用 Mock 代替实际 API(提高可重现性)
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: "Fixed response" }],
        usage: { input_tokens: 100, output_tokens: 50 }
      })
    }
  }))
}));
```

**步骤 3: 固定种子(消除随机性)**

```javascript
// 如果有随机元素
Math.random = () => 0.5;  // 始终相同的值
Date.now = () => 1234567890;  // 固定时间戳

// 或基于种子的随机
const seededRandom = require('seedrandom');
const rng = seededRandom('test-seed');
```

**步骤 4: 编写最小重现示例(MRE)**

```javascript
// ❌ 复杂的完整系统
npm run full-pipeline

// ✅ 最小重现代码
const { Anthropic } = require('@anthropic-ai/sdk');

async function reproduceError() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 重现问题的最小代码
  const response = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: 'This specific prompt causes the error...'
    }]
  });

  console.log(response);
}

reproduceError().catch(console.error);
```

#### 错误报告模板

```markdown
## 错误描述
简洁的 1-2 行摘要

## 重现步骤
1. 运行 Claude Code
2. 输入以下提示: "..."
3. 发生错误

## 预期行为
...

## 实际行为
...

## 环境信息
- OS: macOS 14.5
- Node.js: v18.17.0
- Claude Code: v1.2.3
- 模型: claude-3-5-sonnet-20241022

## 日志
\`\`\`
[ERROR] 2025-01-15T10:30:00.000Z
Context length 210000 exceeds limit
\`\`\`

## 最小重现代码
\`\`\`javascript
// (上述 MRE 代码)
\`\`\`

## 附加信息
- 首次发生: 2025-01-15
- 频率: 10 次中 3 次发生
- 解决方法: /clear 后重试
```

#### 回归测试自动化

```javascript
// 修复错误后添加回归防护测试
describe('Bug #123: Context overflow on large posts', () => {
  it('should handle 10,000-word post without error', async () => {
    const largePost = generatePost(10000);  // 10,000 个单词

    const result = await processPost(largePost);

    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should chunk large context automatically', async () => {
    const hugeContext = 'x'.repeat(250000);  // 超过 200k token

    const result = await analyzeWithChunking(hugeContext);

    expect(result.chunks.length).toBeGreaterThan(1);
  });
});
```

---

## A.4: 高级调试工具

### A.4.1: Claude DevTools(实验性功能)

```bash
# 启用 Claude Code 开发者工具
export CLAUDE_DEVTOOLS=true

# 在浏览器中查看
# http://localhost:9222
```

**功能**:
- 实时 token 使用量监控
- API 调用时间线
- 上下文窗口可视化
- 代理链跟踪

### A.4.2: MCP 服务器调试

```bash
# 查看 MCP 服务器日志
export MCP_DEBUG=true

# 跟踪每个 MCP 工具调用
{
  "mcpServers": {
    "brave-search": {
      "debug": true,
      "logFile": "/tmp/mcp-brave.log"
    }
  }
}
```

### A.4.3: Hook 执行跟踪

```bash
# Hook 执行日志
# .claude/hooks/pre-commit.sh
#!/bin/bash
set -x  # 输出所有命令

echo "[$(date)] pre-commit hook started" >> /tmp/hook.log

# ... 实际逻辑

echo "[$(date)] pre-commit hook completed" >> /tmp/hook.log
```

---

## A.5: 社区资源

### 官方支持

- **Anthropic Support**: support@anthropic.com
- **Claude Code 文档**: https://docs.claude.com/claude-code
- **API 参考**: https://docs.anthropic.com/api

### 社区

- **Discord**: Anthropic 官方 Discord 服务器
- **GitHub Discussions**: claude-code 仓库
- **Stack Overflow**: `[claude-code]` 标签

### 错误报告

```bash
# 提交错误报告
claude report-bug

# 或 GitHub Issue
https://github.com/anthropics/claude-code/issues
```

---

## 总结

### 快速参考检查清单

**问题发生时的顺序**:

1. ✅ 检查错误消息(A.1)
2. ✅ 分析日志(A.3.1)
3. ✅ 验证环境变量(A.1.1)
4. ✅ 测试网络连接(A.1.2)
5. ✅ 检查 token 使用量(A.1.3)
6. ✅ /clear 并重试
7. ✅ 编写最小重现示例(A.3.3)
8. ✅ 咨询社区/官方支持

### 性能优化顺序

1. ✅ 简化 CLAUDE.md (< 2000 行)
2. ✅ 元数据优先架构(Chapter 16)
3. ✅ 引入缓存策略(3 层)
4. ✅ 批处理(分块)
5. ✅ 基于 Hook 的自动化(Chapter 10)
6. ✅ 模型优化(Haiku/Sonnet/Opus)

### 成本削减优先级

1. ✅ 消除重复调用(缓存)
2. ✅ token 优化(上下文压缩)
3. ✅ 模型降级(简单任务 → Haiku)
4. ✅ 使用本地模型(测试环境)
5. ✅ 自动化预算监控

---

**下一个附录**: [Appendix B: 性能优化技巧](/appendix-b) - 实现 60-70% token 节省的实战优化技术

**相关章节**:
- Chapter 10: 基于 Hook 的自动化
- Chapter 13: Self-Healing AI 系统
- Chapter 16: 构建博客自动化系统

---

*最后更新: 2025-12-19*
*版本: 1.0*
*基于 71 个项目运营经验*
