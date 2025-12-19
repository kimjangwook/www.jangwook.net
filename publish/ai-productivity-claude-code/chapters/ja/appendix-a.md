# Appendix A: トラブルシューティングガイド

## 概要

Claude Codeを実際のプロジェクトで活用していると、さまざまな問題に直面することがあります。この付録では、71個の実践プロジェクト運営経験から蓄積された一般的な問題と解決策を体系的に整理します。

各問題は<strong>症状 → 原因 → 解決策 → 予防法</strong>の順序で構成されており、問題発生時に迅速な対応が可能なように設計されています。

---

## A.1: 一般的なエラーと解決策

### A.1.1: 認証エラー

#### 症状 (Symptom)

```bash
Error: Authentication failed. Please check your API key.
```

または

```bash
Error: 401 Unauthorized - Invalid API key
```

Claude Code実行時にAPI キー認証が失敗し、すべての作業がブロックされます。

#### 原因 (Cause)

1. <strong>API キー未設定</strong>: 環境変数または設定ファイルにAPI キーが欠落
2. <strong>間違ったAPI キー</strong>: キーコピー時に空白や特殊文字が含まれた
3. <strong>期限切れのAPI キー</strong>: キーの有効期限が終了したか削除された
4. <strong>権限不足</strong>: API キーに必要な権限(scope)が割り当てられていない

#### 解決策 (Solution)

<strong>ステップ1: API キー確認</strong>

```bash
# 環境変数確認
echo $ANTHROPIC_API_KEY

# または設定ファイル確認
cat ~/.config/claude/config.json
```

<strong>ステップ2: API キー再設定</strong>

```bash
# Claude Code CLIによる認証
claude auth login

# または環境変数を直接設定 (Linux/macOS)
export ANTHROPIC_API_KEY="sk-ant-api..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-api..."
```

<strong>ステップ3: キー有効性検証</strong>

```bash
# 簡単なAPI呼び出しでテスト
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

<strong>ステップ4: 権限確認</strong>

Anthropic Consoleで:
- API キーがアクティブ状態か確認
- 必要なモデル(Claude 3.5 Sonnetなど)へのアクセス権限確認
- 使用量上限を超えていないか確認

#### 予防法 (Prevention)

1. <strong>環境変数の永続設定</strong>
   ```bash
   # ~/.bashrcまたは~/.zshrcに追加
   echo 'export ANTHROPIC_API_KEY="sk-ant-api..."' >> ~/.bashrc
   source ~/.bashrc
   ```

2. <strong>API キーの安全な管理</strong>
   - `.env`ファイル使用時は必ず`.gitignore`に追加
   - キーをコードにハードコーディングしない
   - シークレット管理ツール(1Password、Vaultなど)を活用

3. <strong>定期的なキー更新</strong>
   - セキュリティポリシーに従って3〜6か月ごとにキー交換
   - プロジェクト別に別々のキーを使用(権限分離)

4. <strong>モニタリング設定</strong>
   - Anthropic Consoleで使用量通知設定
   - 予算上限設定で予期しない費用を防止

---

### A.1.2: ネットワークエラー

#### 症状 (Symptom)

```bash
Error: Network request failed
Error: ECONNREFUSED
Error: Timeout waiting for response
```

API呼び出し中にネットワーク接続が失敗し、作業が中断されます。

#### 原因 (Cause)

1. <strong>インターネット接続切断</strong>: ネットワーク不安定またはファイアウォールブロック
2. <strong>プロキシ設定問題</strong>: 会社ネットワークでプロキシ未設定
3. <strong>DNS解決失敗</strong>: Anthropic APIサーバードメイン解決不可
4. <strong>Timeout設定不足</strong>: 大容量レスポンス待機時間超過
5. <strong>Rate Limiting</strong>: API呼び出し頻度制限超過

#### 解決策 (Solution)

<strong>ステップ1: 基本ネットワーク診断</strong>

```bash
# インターネット接続確認
ping 8.8.8.8

# Anthropic APIサーバー到達可能性確認
curl -I https://api.anthropic.com

# DNS解決確認
nslookup api.anthropic.com
```

<strong>ステップ2: プロキシ設定(会社ネットワーク)</strong>

```bash
# HTTPプロキシ設定
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"

# Claude Code設定ファイルでプロキシ指定
# ~/.config/claude/config.json
{
  "proxy": "http://proxy.company.com:8080"
}
```

<strong>ステップ3: Timeout調整</strong>

`.claude/settings.local.json`で:

```json
{
  "apiTimeout": 300000,  // 5分に延長(デフォルト60秒)
  "maxRetries": 3,       // 再試行回数増加
  "retryDelay": 2000     // 再試行間隔2秒
}
```

<strong>ステップ4: Rate Limit対応</strong>

```javascript
// リクエスト間の遅延追加(Node.js例)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callClaudeWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await claude.messages.create({ /* ... */ });
      return response;
    } catch (error) {
      if (error.status === 429) {  // Rate limit
        const waitTime = Math.pow(2, i) * 1000;  // 指数バックオフ
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

#### 予防法 (Prevention)

1. <strong>安定したネットワーク環境構築</strong>
   - 重要な作業時は有線接続使用
   - VPN使用時は安定性検証

2. <strong>自動再試行ロジック実装</strong>
   ```python
   # Python例(tenacityライブラリ)
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def call_claude_api():
       # API呼び出しコード
       pass
   ```

3. <strong>API呼び出し頻度管理</strong>
   - Rate limit情報モニタリング(レスポンスヘッダーの`x-ratelimit-*`)
   - 大量作業時はバッチ処理と遅延適用

4. <strong>キャッシング戦略</strong>
   - 同じプロンプト結果はローカルキャッシュ活用
   - メタデータ優先アーキテクチャ(Chapter 16参照)

---

### A.1.3: トークン制限エラー

#### 症状 (Symptom)

```bash
Error: Request exceeds maximum token limit (200,000 tokens)
Error: Context length exceeded
```

プロンプトまたはレスポンスがモデルのコンテキストウィンドウを超えてリクエストが拒否されます。

#### 原因 (Cause)

1. <strong>過度なコンテキスト</strong>: CLAUDE.md、コードベース、会話履歴が大きすぎる
2. <strong>大容量ファイル含有</strong>: ログファイル、データファイルなどをプロンプトに含む
3. <strong>累積された会話履歴</strong>: 長時間の会話でコンテキスト蓄積
4. <strong>非効率的なプロンプト構造</strong>: 重複情報、不要な説明

#### 解決策 (Solution)

<strong>ステップ1: トークン使用量分析</strong>

```bash
# Claude Codeでトークン使用量確認
# 会話中にClaudeに質問
"現在のコンテキストのトークン使用量はどれくらいですか?"
```

<strong>ステップ2: コンテキスト最適化</strong>

```markdown
<!-- CLAUDE.md最適化前 -->
## すべてのファイル説明
- src/components/Header.astro: ヘッダーコンポーネントです。ナビゲーションとロゴを表示します...
- src/components/Footer.astro: フッターコンポーネントです。著作権とリンクを表示します...
(100行続く...)

<!-- 最適化後 -->
## 主要コンポーネント
- Header/Footer: `src/components/`
- 詳細構造は必要時に該当ファイル参照
```

<strong>ステップ3: 会話履歴整理</strong>

```bash
# Claude Codeで会話初期化
/clear

# または新しい会話開始
"新しいトピックに移ります。以前の会話コンテキストは無視してください。"
```

<strong>ステップ4: チャンキング戦略適用</strong>

大量データ処理時:

```python
# 誤ったアプローチ: 全データを一度に送信
all_posts = read_all_blog_posts()  # 10,000行
prompt = f"次のポストを分析してください:\n{all_posts}"

# 正しいアプローチ: チャンキングとバッチ処理
def process_in_chunks(posts, chunk_size=10):
    results = []
    for i in range(0, len(posts), chunk_size):
        chunk = posts[i:i+chunk_size]
        result = claude_api.analyze(chunk)
        results.append(result)
    return merge_results(results)
```

<strong>ステップ5: 外部ファイル参照活用</strong>

```markdown
<!-- プロンプトに全コード含む代わりに -->
"次のファイルのバグを修正してください:
ファイル: src/components/BlogCard.astro"

<!-- Claudeがreadツールでファイルロード -->
```

#### 予防法 (Prevention)

1. <strong>CLAUDE.md簡素化</strong>
   - 必須情報のみ含む(コマンド、構造、ルール)
   - 詳細説明は別ドキュメントに分離
   - 目標: 2000行以下維持

2. <strong>プロンプトテンプレート使用</strong>
   ```markdown
   # 効率的なプロンプトテンプレート
   ## 目標
   [1-2文で明確に]

   ## コンテキスト
   [必須情報のみ、ファイルパス優先]

   ## 要求事項
   - [具体的で測定可能な項目]
   ```

3. <strong>定期的な/clear使用</strong>
   - トピック変更時に会話初期化
   - 長時間作業後に新しいセッション開始

4. <strong>メタデータ優先アーキテクチャ</strong>
   - 全コンテンツの代わりにメタデータ活用
   - `post-metadata.json`のようなインデックスファイル生成
   - 必要時のみ全ファイルロード

---

### A.1.4: コンテキストオーバーフロー

#### 症状 (Symptom)

```bash
Warning: Context approaching limit (180,000 / 200,000 tokens)
Error: Unable to process request - context overflow
```

またはClaudeの応答が:
- 急に短くなる
- 以前の会話内容を忘れる
- 繰り返し質問する

#### 原因 (Cause)

1. <strong>長い会話セッション</strong>: 複数の作業を一つの会話で実行
2. <strong>大容量ファイル読み込み</strong>: 複数の大きなファイルを連続ロード
3. <strong>サブエージェントチェーン</strong>: 複数エージェント間のハンドオフでコンテキスト蓄積
4. <strong>デバッグモード</strong>: 詳細ログがコンテキストに含まれる

#### 解決策 (Solution)

<strong>ステップ1: コンテキスト負荷検知</strong>

Claudeが次のような信号を示すときは注意:
- "先に述べた内容を再確認します"
- すでに回答した質問を再質問
- 応答品質低下

<strong>ステップ2: 即座に会話整理</strong>

```bash
# オプション1: 完全初期化
/clear

# オプション2: 要約後再開
"これまで作業した内容を3行で要約し、新しい会話を始めてください"
```

<strong>ステップ3: 作業分割</strong>

```markdown
<!-- 誤ったアプローチ: 一つの会話ですべての作業 -->
1. ブログポスト作成
2. SEO最適化
3. 画像生成
4. 4言語翻訳
5. コミットと配布

<!-- 正しいアプローチ: 作業別に別の会話 -->
セッション1: ブログポスト作成 → /clear
セッション2: SEO最適化 → /clear
セッション3: 画像生成 → /clear
セッション4: 翻訳 → /clear
```

<strong>ステップ4: サブエージェント活用</strong>

```bash
# メイン会話負担軽減
@writing-assistant "ブログポスト作成"  # 別コンテキスト
@seo-optimizer "メタデータ最適化"       # 独立実行
```

#### 予防法 (Prevention)

1. <strong>会話寿命管理</strong>
   - 複雑な作業: 15〜20往復会話後に/clear
   - 単純作業: 5〜10往復後に整理

2. <strong>Stateless作業設計</strong>
   - 各作業が以前の会話に依存しないように
   - 必要なコンテキストは毎回明示的に提供

3. <strong>ファイル読み込み最適化</strong>
   ```bash
   # 全ファイルの代わりに必要な部分のみ
   "src/components/Header.astroの30-50行のみ読んでください"

   # または要約が先
   "このファイルの構造のみ把握してください(全体読み込みX)"
   ```

4. <strong>Hookベース自動化</strong>
   - 繰り返し作業はHookで自動化
   - Claudeとの会話最小化(Chapter 10参照)

---

## A.2: パフォーマンス問題診断

### A.2.1: 遅いレスポンス時間

#### 症状 (Symptom)

- 簡単な質問にも30秒以上かかる
- "Thinking..."状態が過度に長くなる
- API呼び出し後に長時間応答なし

#### 原因 (Cause)

1. <strong>複雑なプロンプト</strong>: 曖昧または多重要求事項
2. <strong>大量データ処理</strong>: 一度に数百個のファイル分析
3. <strong>再帰的エージェント呼び出し</strong>: 無限ループに近いサブエージェントチェーン
4. <strong>ネットワーク遅延</strong>: 遅いインターネット接続
5. <strong>モデル負荷</strong>: Anthropic APIサーバー混雑

#### 解決策 (Solution)

<strong>ステップ1: プロンプト最適化</strong>

```markdown
<!-- Before: 曖昧で複雑 -->
"ブログを分析して良い点と悪い点を見つけ、SEOを改善し、
パフォーマンスも測定し、セキュリティ問題も確認してください。"

<!-- After: 明確で単純 -->
"ブログのSEOメタデータ(title、description)のみレビューしてください。
- 目標: クリック率改善
- ファイル: src/content/blog/ko/latest-post.md"
```

<strong>ステップ2: バッチ処理導入</strong>

```python
# 順次処理(遅い)
for post in all_posts:
    result = claude.analyze(post)  # 各10秒 = 合計100秒

# バッチ処理(速い)
batch_results = claude.analyze_batch(all_posts)  # 合計15秒
```

<strong>ステップ3: キャッシング活用</strong>

```javascript
// キャッシュレイヤー追加
const cache = new Map();

async function getAnalysis(postId) {
  if (cache.has(postId)) {
    return cache.get(postId);  // 即座に返却
  }

  const result = await claude.analyze(postId);
  cache.set(postId, result);
  return result;
}
```

<strong>ステップ4: 並列処理</strong>

```bash
# Claude Codeで複数作業同時実行
"次の3つのファイルを同時に分析してください:
1. src/components/A.astro
2. src/components/B.astro
3. src/components/C.astro"
```

#### 予防法 (Prevention)

1. <strong>小さな単位で作業</strong>
   - 大きな作業は5〜10ステップに分割
   - 各ステップ別の結果確認後に次へ進む

2. <strong>Thinkツール活用</strong>
   - 複雑な決定はThinkモードで事前計画
   - 実行ステップは簡単に維持

3. <strong>メタデータ優先</strong>
   - 全コンテンツの代わりにメタデータで1次フィルタリング
   - 必要な項目のみ詳細分析

4. <strong>時間制限設定</strong>
   ```json
   // .claude/settings.local.json
   {
     "maxThinkingTime": 30,  // Thinkモード30秒制限
     "taskTimeout": 300      // 全作業5分制限
   }
   ```

---

### A.2.2: メモリ問題

#### 症状 (Symptom)

```bash
Error: JavaScript heap out of memory
Process killed (OOM - Out Of Memory)
```

または:
- Claude Codeが突然終了する
- システム全体が遅くなる
- スワップメモリ過多使用

#### 原因 (Cause)

1. <strong>大容量ファイルロード</strong>: 数百MBログファイル読み込み
2. <strong>メモリリーク</strong>: キャッシュが無限に増加
3. <strong>同時作業過多</strong>: 多すぎる並列プロセス
4. <strong>一時ファイル未整理</strong>: ビルド成果物蓄積

#### 解決策 (Solution)

<strong>ステップ1: メモリ使用量モニタリング</strong>

```bash
# システムメモリ確認
top
# または
htop

# Node.jsプロセスメモリ確認
node --trace-gc your-script.js
```

<strong>ステップ2: Node.jsヒープサイズ増加</strong>

```bash
# 環境変数設定
export NODE_OPTIONS="--max-old-space-size=4096"  # 4GB

# または直接実行
node --max-old-space-size=4096 script.js
```

<strong>ステップ3: ストリーム処理適用</strong>

```javascript
// 誤ったアプローチ: 全ファイルメモリロード
const allData = fs.readFileSync('huge-log.txt', 'utf8');  // OOM!

// 正しいアプローチ: ストリーム処理
const stream = fs.createReadStream('huge-log.txt');
stream.on('data', chunk => {
  processChunk(chunk);  // チャンク別処理
});
```

<strong>ステップ4: キャッシュ整理ポリシー</strong>

```javascript
// LRUキャッシュ使用(サイズ制限)
const LRU = require('lru-cache');

const cache = new LRU({
  max: 100,              // 最大100項目
  maxAge: 1000 * 60 * 60 // 1時間後期限切れ
});
```

<strong>ステップ5: 作業キュー管理</strong>

```javascript
// 同時実行制限
const pLimit = require('p-limit');
const limit = pLimit(5);  // 最大5個同時実行

const promises = files.map(file =>
  limit(() => processFile(file))
);
await Promise.all(promises);
```

#### 予防法 (Prevention)

1. <strong>ファイルサイズ制限</strong>
   ```bash
   # 10MB以上ファイルは警告
   find . -type f -size +10M

   # .gitignoreに大容量ファイル除外
   *.log
   dist/
   node_modules/
   ```

2. <strong>定期的な整理</strong>
   ```bash
   # 一時ファイル自動整理(Hook)
   # .claude/hooks/post-commit.sh
   #!/bin/bash
   rm -rf .temp/
   npm run clean
   ```

3. <strong>プロファイリング</strong>
   ```bash
   # メモリ使用パターン分析
   node --inspect your-script.js
   # Chrome DevToolsでメモリスナップショット確認
   ```

4. <strong>リソース制限明示</strong>
   ```yaml
   # docker-compose.yml(コンテナ使用時)
   services:
     claude-agent:
       image: node:18
       mem_limit: 2g      # 2GB制限
       memswap_limit: 2g  # スワップ防止
   ```

---

### A.2.3: コスト超過

#### 症状 (Symptom)

- 月予算を数日で消費
- Anthropic請求金額が予想の2〜3倍
- API呼び出し回数が急増

#### 原因 (Cause)

1. <strong>無限ループ</strong>: エージェントが継続的に再試行
2. <strong>大量トークン使用</strong>: 不要なコンテキスト繰り返し送信
3. <strong>非効率的なワークフロー</strong>: 同じ作業重複実行
4. <strong>テスト環境未分離</strong>: 実験作業がプロダクションAPI呼び出し

#### 解決策 (Solution)

<strong>ステップ1: 使用量分析</strong>

```bash
# Anthropic Consoleで確認
- API Usage Dashboard
- Cost by Model (Sonnet vs Opus)
- Top consuming projects
```

<strong>ステップ2: コストモニタリング自動化</strong>

```python
# コスト通知スクリプト
import anthropic
import os

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# 使用量照会(仮想API - 実際はダッシュボード確認)
usage = client.usage.get_current_month()

if usage['cost'] > 100:  # $100超過時
    send_alert(f"Cost alert: ${usage['cost']}")
```

<strong>ステップ3: トークン最適化</strong>

```markdown
<!-- Before: 26,000トークン -->
CLAUDE.md: 15,000トークン(すべてのファイル詳細説明)
Prompt: 8,000トークン(全コード含む)
Response: 3,000トークン

<!-- After: 8,000トークン -->
CLAUDE.md: 3,000トークン(コアのみ)
Prompt: 2,000トークン(ファイルパスのみ)
Response: 3,000トークン

<strong>コスト削減</strong>: 26k → 8k = <strong>69%節約</strong>
```

<strong>ステップ4: キャッシング戦略</strong>

```javascript
// メタデータ再利用(Chapter 16参照)
const metadata = JSON.parse(fs.readFileSync('post-metadata.json'));

// 変更されたポストのみ再処理
const changedPosts = metadata.filter(post =>
  post.contentHash !== calculateHash(post.filePath)
);

// 残りはキャッシュ使用
console.log(`Processing ${changedPosts.length} / ${metadata.length} posts`);
// コスト削減: 100個 → 5個 = 95%節約
```

<strong>ステップ5: モデル最適化</strong>

```javascript
// 作業別適切なモデル選択
const tasks = {
  simple: 'claude-3-haiku-20240307',      // 安価
  standard: 'claude-3-5-sonnet-20241022', // 中間
  complex: 'claude-opus-4-20250514'       // 高級
};

// 簡単な作業はHaiku使用
if (task === 'format-check') {
  model = tasks.simple;  // コスト1/10
}
```

#### 予防法 (Prevention)

1. <strong>予算上限設定</strong>
   ```json
   // .claude/settings.local.json
   {
     "budget": {
       "monthly": 100,      // $100/月
       "alertAt": 80,       // $80到達時通知
       "stopAt": 100        // $100到達時中断
     }
   }
   ```

2. <strong>ローカルモデル活用</strong>
   - 開発/テスト: Llama 3、Mistralなどローカルモデル
   - プロダクション: Claude API
   ```bash
   # Ollamaでローカルテスト
   ollama run llama3 "テストプロンプト"
   ```

3. <strong>プロンプトライブラリ</strong>
   - 検証済みプロンプト再利用
   - 実験は別アカウント/プロジェクト

4. <strong>自動化優先</strong>
   - Hookベースワークフロー(無料)
   - 必要時のみClaude呼び出し
   ```bash
   # Hookで簡単な検査はスクリプトで
   # .claude/hooks/pre-commit.sh
   #!/bin/bash

   # 簡単な検証(無料)
   npm run lint
   npm run type-check

   # 複雑な分析のみClaude使用
   if [ "$COMPLEX_REVIEW" = "true" ]; then
     claude review
   fi
   ```

---

## A.3: デバッグ技法

### A.3.1: ログ分析

#### 基本ロギング有効化

<strong>ステップ1: Claude Codeデバッグモード</strong>

```bash
# 環境変数設定
export CLAUDE_DEBUG=true
export CLAUDE_LOG_LEVEL=debug

# ログファイル指定
export CLAUDE_LOG_FILE=~/claude-debug.log
```

<strong>ステップ2: 詳細ログ確認</strong>

```bash
# リアルタイムログ追跡
tail -f ~/claude-debug.log

# エラーのみフィルタリング
grep "ERROR" ~/claude-debug.log

# 特定API呼び出し追跡
grep "api.anthropic.com" ~/claude-debug.log
```

<strong>ステップ3: トークン使用量ロギング</strong>

```javascript
// カスタムラッパーですべてのAPI呼び出しログ記録
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

#### ログパターン分析

<strong>一般的なエラーパターン</strong>:

```bash
# 1. 認証失敗
[ERROR] 401 Unauthorized
→ 原因: API キー問題
→ 解決: A.1.1参照

# 2. Rate Limit
[ERROR] 429 Too Many Requests
→ 原因: API呼び出し頻度超過
→ 解決: 指数バックオフ再試行

# 3. タイムアウト
[ERROR] Request timeout after 60000ms
→ 原因: 大容量データまたはネットワーク遅延
→ 解決: Timeout増加またはチャンキング

# 4. コンテキスト超過
[ERROR] Context length 210000 exceeds limit 200000
→ 原因: プロンプトが大きすぎる
→ 解決: A.1.3参照
```

#### 構造化ロギング

```typescript
// ロギングユーティリティ
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

// 使用例
const logger = new Logger('~/claude-app.log');

logger.debug('Starting blog post generation', { postId: '123' });
logger.error('Failed to generate image', { error: e.message, stack: e.stack });
```

---

### A.3.2: ステップバイステップ実行

#### 複雑な作業の分解

<strong>問題状況</strong>: ブログ自動化全体パイプラインが途中で失敗するが、どこが問題か不明確

<strong>解決戦略</strong>: 各ステップを独立して実行しながら検証

<strong>ステップ1: ワークフロー分解</strong>

```markdown
全体パイプライン:
1. トピック選定(@content-planner)
2. 下書き作成(@writing-assistant)
3. 画像生成(@image-generator)
4. SEO最適化(@seo-optimizer)
5. 4言語翻訳
6. メタデータ生成(@content-analyzer)
7. 推奨ポスト計算(@content-recommender)
8. コミットと配布

ステップ別テスト:
各ステップを個別の会話で実行しながら出力検証
```

<strong>ステップ2: 中間結果保存</strong>

```javascript
// 各ステップごとに中間ファイル保存
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

  // ... 続く
};

// 特定ステップのみ再実行可能
await pipeline.step3_image();  // 画像生成のみ再試行
```

<strong>ステップ3: Dry-runモード</strong>

```bash
# Hook実行時にdry-runオプション
export CLAUDE_DRY_RUN=true

# 実際のファイル変更なしでログのみ出力
.claude/hooks/pre-commit.sh
# → "Would run: npm test"
# → "Would check: frontmatter validation"
```

<strong>ステップ4: 条件付き実行</strong>

```bash
# 環境変数でステップ別有効化
export SKIP_IMAGE_GEN=true
export SKIP_TRANSLATION=true

# スクリプトで
if [ "$SKIP_IMAGE_GEN" != "true" ]; then
  node generate_image.js
fi
```

#### ブレークポイント活用

```javascript
// デバッガ挿入
async function complexWorkflow() {
  const step1 = await doStep1();
  debugger;  // ここで中断してstep1結果確認

  const step2 = await doStep2(step1);
  debugger;  // step2結果確認

  return step2;
}

// Node.jsデバッガで実行
node inspect workflow.js
```

#### 段階的複雑度増加

```markdown
<!-- テスト順序 -->
1. 最小入力で開始
   - 例: 1個ポストのみ処理

2. 正常ケース
   - 例: 3個ポスト処理

3. 境界条件
   - 例: 0個、100個ポスト

4. エラーケース
   - 例: 誤ったfrontmatter、欠落画像

5. 全体プロダクション
   - 例: すべてのポスト(71個)
```

---

### A.3.3: エラー再現

#### 再現可能なテストケース作成

<strong>目標</strong>: 間欠的バグを100%再現可能にする

<strong>ステップ1: 環境固定</strong>

```bash
# バージョン固定
node --version  # v18.17.0
npm --version   # 9.6.7

# 環境変数明示
export NODE_ENV=production
export ANTHROPIC_API_KEY=sk-ant-api...
export CLAUDE_DEBUG=true

# 依存性固定
npm ci  # package-lock.json基準インストール
```

<strong>ステップ2: 入力データ固定</strong>

```javascript
// テストフィクスチャ使用
const testPost = {
  title: "Test Post",
  description: "Test description",
  pubDate: "2025-01-15",
  content: fs.readFileSync('test/fixtures/sample-post.md', 'utf8')
};

// 実際のAPIの代わりにMock使用(再現性向上)
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

<strong>ステップ3: シード固定(ランダム性除去)</strong>

```javascript
// ランダム要素がある場合
Math.random = () => 0.5;  // 常に同じ値
Date.now = () => 1234567890;  // 固定タイムスタンプ

// またはシードベースランダム
const seededRandom = require('seedrandom');
const rng = seededRandom('test-seed');
```

<strong>ステップ4: 最小再現例(MRE)作成</strong>

```javascript
// ✗ 複雑な全体システム
npm run full-pipeline

// ✓ 最小再現コード
const { Anthropic } = require('@anthropic-ai/sdk');

async function reproduceError() {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // 問題を再現する最小限のコード
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

#### バグレポートテンプレート

```markdown
## バグ説明
簡潔な1-2行要約

## 再現手順
1. Claude Code実行
2. 次のプロンプト入力: "..."
3. エラー発生

## 期待動作
...

## 実際動作
...

## 環境情報
- OS: macOS 14.5
- Node.js: v18.17.0
- Claude Code: v1.2.3
- モデル: claude-3-5-sonnet-20241022

## ログ
\`\`\`
[ERROR] 2025-01-15T10:30:00.000Z
Context length 210000 exceeds limit
\`\`\`

## 最小再現コード
\`\`\`javascript
// (上記MREコード)
\`\`\`

## 追加情報
- 初発生: 2025-01-15
- 頻度: 10回中3回発生
- 回避策: /clear後再試行
```

#### 回帰テスト自動化

```javascript
// バグ修正後の回帰防止テスト追加
describe('Bug #123: Context overflow on large posts', () => {
  it('should handle 10,000-word post without error', async () => {
    const largePost = generatePost(10000);  // 10,000単語

    const result = await processPost(largePost);

    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
  });

  it('should chunk large context automatically', async () => {
    const hugeContext = 'x'.repeat(250000);  // 200kトークン超過

    const result = await analyzeWithChunking(hugeContext);

    expect(result.chunks.length).toBeGreaterThan(1);
  });
});
```

---

## A.4: 高度なデバッグツール

### A.4.1: Claude DevTools(実験的機能)

```bash
# Claude Code開発者ツール有効化
export CLAUDE_DEVTOOLS=true

# ブラウザで確認
# http://localhost:9222
```

<strong>機能</strong>:
- リアルタイムトークン使用量モニタリング
- API呼び出しタイムライン
- コンテキストウィンドウ可視化
- エージェントチェーン追跡

### A.4.2: MCPサーバーデバッグ

```bash
# MCPサーバーログ確認
export MCP_DEBUG=true

# 各MCPツール呼び出し追跡
{
  "mcpServers": {
    "brave-search": {
      "debug": true,
      "logFile": "/tmp/mcp-brave.log"
    }
  }
}
```

### A.4.3: Hook実行追跡

```bash
# Hook実行ログ
# .claude/hooks/pre-commit.sh
#!/bin/bash
set -x  # すべてのコマンド出力

echo "[$(date)] pre-commit hook started" >> /tmp/hook.log

# ... 実際のロジック

echo "[$(date)] pre-commit hook completed" >> /tmp/hook.log
```

---

## A.5: コミュニティリソース

### 公式サポート

- <strong>Anthropic Support</strong>: support@anthropic.com
- <strong>Claude Code ドキュメント</strong>: https://docs.claude.com/claude-code
- <strong>API リファレンス</strong>: https://docs.anthropic.com/api

### コミュニティ

- <strong>Discord</strong>: Anthropic公式Discordサーバー
- <strong>GitHub Discussions</strong>: claude-codeレポジトリ
- <strong>Stack Overflow</strong>: `[claude-code]`タグ

### バグレポート

```bash
# バグレポート提出
claude report-bug

# またはGitHub Issue
https://github.com/anthropics/claude-code/issues
```

---

## まとめ

### クイックリファレンスチェックリスト

<strong>問題発生時の順序</strong>:

1. ✅ エラーメッセージ確認(A.1)
2. ✅ ログ分析(A.3.1)
3. ✅ 環境変数検証(A.1.1)
4. ✅ ネットワーク接続テスト(A.1.2)
5. ✅ トークン使用量確認(A.1.3)
6. ✅ /clearと再試行
7. ✅ 最小再現例作成(A.3.3)
8. ✅ コミュニティ/公式サポート問い合わせ

### パフォーマンス最適化順序

1. ✅ CLAUDE.md簡素化(< 2000行)
2. ✅ メタデータ優先アーキテクチャ(Chapter 16)
3. ✅ キャッシング戦略導入(3階層)
4. ✅ バッチ処理(チャンキング)
5. ✅ Hookベース自動化(Chapter 10)
6. ✅ モデル最適化(Haiku/Sonnet/Opus)

### コスト削減優先順位

1. ✅ 重複呼び出し除去(キャッシング)
2. ✅ トークン最適化(コンテキスト圧縮)
3. ✅ モデルダウングレード(単純作業 → Haiku)
4. ✅ ローカルモデル活用(テスト環境)
5. ✅ 予算モニタリング自動化

---

<strong>次のAppendix</strong>: [Appendix B: パフォーマンス最適化のヒント](/appendix-b) - 60-70%トークン削減を達成した実践最適化技法

<strong>関連Chapter</strong>:
- Chapter 10: Hookベース自動化
- Chapter 13: Self-Healing AIシステム
- Chapter 16: ブログ自動化システム構築

---

*最終更新: 2025-12-19*
*バージョン: 1.0*
*71個プロジェクト運営経験に基づく*
