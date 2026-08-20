# Chapter 12: Deep Agentsアーキテクチャ

## 序論: AIエージェントシステムの進化

2025年、AIエージェントシステムは重要な転換点を迎えました。初期の単純なツール呼び出しエージェント(Shallow Agents)から、複雑な長期タスクを実行できるDeep Agentsへの進化が始まりました。

LangChainとAWSのPhilipp Schmidが提案したDeep Agentsパラダイムは、次の4つの核となる柱で構成されています:

1. **Explicit Planning (明示的計画)**: 暗黙的推論ではなく構造化された計画生成
2. **Hierarchical Delegation (階層的委任)**: 適切な専門エージェントへのタスク委任
3. **Persistent Memory (永続的メモリ)**: セッション間のコンテキストと状態の維持
4. **Extreme Context Engineering (極限的コンテキストエンジニアリング)**: すべての関連情報をコンテキストに含める

本章では、各柱を実戦で活用する具体的なレシピを提供します。

---

## Recipe 12.1: Deep vs Shallow Agents

### 問題 (Problem)

既存のAIエージェントは5〜15ステップ以内の短いタスクのみを実行でき、失敗時は即座に中断します。複雑な長期タスク(例: 多言語ブログ投稿作成、サイト全体のSEO監査)を実行するには、人間が何度も介入する必要があります。

### 解決策 (Solution)

Shallow AgentsとDeep Agentsの違いを理解し、適切なパラダイムを選択してください。

#### Shallow Agents (Agent 1.0)

**特徴**:
- 単純なReActパターン (Reasoning → Action → Observation)
- 5〜15ステップ以内の短いタスク
- 失敗時は即座に中断
- コンテキストは非永続的

**適したタスク**:
- 簡単な情報照会
- 単一ファイルの修正
- 高速なデータ変換

**ワークフロー**:

```
リクエスト → ツール呼び出し → 結果 → 完了/失敗
```

#### Deep Agents (Agent 2.0)

**特徴**:
- 100+ステップの長期タスク実行が可能
- 明示的計画と再計画
- 継続的な状態管理
- 自動復旧と適応

**適したタスク**:
- 多言語コンテンツ生成
- 複雑なリファクタリング
- データパイプライン構築
- プロジェクト全体の分析

**ワークフロー**:

```
リクエスト → 目標分析 → 計画立案 → タスク実行 → 検証 → 再計画 (必要時) → 完了
```

### コード/例 (Code)

#### Shallow Agent 例: 単一ファイル修正

```markdown
# ユーザーリクエスト
"src/utils/format.ts ファイルで日付フォーマット関数を修正してください。"

# Shallow Agent 実行
1. Read: src/utils/format.ts
2. Edit: formatDate 関数修正
3. 完了

# 合計3ステップ、1分所要
```

#### Deep Agent 例: 多言語ブログ投稿作成

```markdown
# ユーザーリクエスト
"TypeScript 5.0の新機能に関する詳細分析ブログ投稿を作成してください。
コード例とパフォーマンスベンチマークを含め、韓国語、英語、日本語版をすべて作成してください。"

# Deep Agent 実行計画
## Phase A: 準備 (並列、5分)
1. [web-researcher] TypeScript 5.0 公式リリースノート調査
2. [web-researcher] パフォーマンスベンチマークデータ収集
3. [image-generator] ヒーロー画像生成

## Phase B: 作成 (順次、15分)
4. [writing-assistant] 韓国語下書き作成 (2500字+)
5. [writing-assistant] 英語版作成
6. [writing-assistant] 日本語版作成

## Phase C: 検証 (順次、5分)
7. [editor] 全バージョン品質レビュー
8. [seo-optimizer] メタデータとキーワードの最適化
9. [site-manager] ビルド検証

# 合計9ステップ、25分所要
# 自動復旧: Step 4-6 失敗時は具体的なフィードバックで再作成
```

### 説明 (Explanation)

**Shallow Agentsの限界**:

1. **短いコンテキストウィンドウ**: 会話が長くなると初期コンテキストが失われる
2. **状態の非永続性**: 失敗時は最初からやり直し
3. **手動調整が必要**: 複雑なタスクは人間がステップごとに指示

**Deep Agentsの強み**:

1. **長期タスクサポート**: 明示的計画で100+ステップを管理
2. **自動復旧**: 失敗タイプに応じて再試行、再計画、またはエスカレーション
3. **状態の永続性**: 中断後の再開が可能
4. **透明性**: 進捗追跡と予測可能性の向上

### 変形 (Variations)

#### ハイブリッドアプローチ

簡単なタスクはShallow Agentで、複雑なタスクのみDeep Agentで処理:

```typescript
// タスクの複雑度評価
function assessComplexity(request: string): 'simple' | 'complex' {
  const indicators = {
    multiStep: /ステップ|順序|まず.*次/.test(request),
    multiFile: /すべて|全体|複数/.test(request),
    multiLanguage: /多言語|翻訳|言語/.test(request),
    longDuration: /分析|リファクタリング|最適化/.test(request)
  };

  const score = Object.values(indicators).filter(Boolean).length;
  return score >= 2 ? 'complex' : 'simple';
}

// 適切なエージェントを選択
if (assessComplexity(userRequest) === 'complex') {
  await deepAgent.execute(userRequest);
} else {
  await shallowAgent.execute(userRequest);
}
```

#### 段階的アップグレード

既存のShallow AgentをDeep Agentに段階的に変換:

```markdown
# Step 1: 明示的計画の追加
- タスク開始前に簡単なチェックリストを生成

# Step 2: 復旧ロジックの追加
- 失敗時に1回再試行

# Step 3: 状態保存の追加
- 主要なステップごとに進捗を記録

# Step 4: 完全なDeep Agent
- 全プロトコルの実装
```

---

## Recipe 12.2: Explicit Planning (明示的計画)

### 問題 (Problem)

AIエージェントが複雑なタスクを実行する際に即興で進めると、次の問題が発生します:
- 重複タスクの実行
- 依存関係の無視による失敗
- 並列実行の機会を逃す
- 進捗追跡が不可能

### 解決策 (Solution)

すべての複雑なタスクに対して、明示的で構造化された計画を最初に生成してください。

#### Planning Protocol 構成要素

```markdown
## タスク計画テンプレート

### 1. 目標の明確化
- 最終成果物: [具体的説明]
- 成功基準: [測定可能な基準]
- スコープ制限: [除外事項]

### 2. ステップの分解
- 各ステップは1つのエージェントが実行
- ステップごとの予想時間を明示
- 依存関係を明確に表示

### 3. リソース割り当て
- 必要なツール: [ツールリスト]
- 必要なコンテキスト: [ファイル、データ]
- 予想トークン使用量: [概算]

### 4. リスク評価
- 潜在的な失敗ポイント: [識別されたリスク]
- 代替経路: [Plan B]
- 復旧戦略: [失敗時の対応]
```

### コード/例 (Code)

#### 例1: 多言語ブログ投稿計画

```markdown
## タスク計画: TypeScript 5.0 詳細分析投稿

### 1. 目標の明確化
- **最終成果物**:
  - 韓国語、英語、日本語の3バージョンのブログ投稿
  - 各2500字以上
  - コード例5個以上を含む
  - パフォーマンスベンチマークチャートを含む
- **成功基準**:
  - `npm run build` 成功
  - Frontmatterスキマ準拠
  - SEO description 150-160字
- **スコープ制限**:
  - 中国語版は除外
  - ビデオチュートリアルは除外

### 2. ステップの分解

#### Phase A: 準備 (並列実行可能)
- **Step 1** [web-researcher, 3分]
  - タスク: TypeScript 5.0 公式リリースノート調査
  - 出力: `.claude/memory/research/ts5-release-notes.md`
  - 依存関係: なし

- **Step 2** [web-researcher, 3分]
  - タスク: コミュニティの反応とユースケースの収集
  - 出力: `.claude/memory/research/ts5-community.md`
  - 依存関係: なし

- **Step 3** [image-generator, 2分]
  - タスク: ヒーロー画像生成
  - 出力: `src/assets/blog/typescript-5-hero.jpg`
  - 依存関係: なし

#### Phase B: 作成 (順次実行)
- **Step 4** [writing-assistant, 8分]
  - タスク: 韓国語下書き作成
  - 入力: Step 1, 2 の結果
  - 出力: `src/content/blog/ko/typescript-5-deep-dive.md`
  - 依存関係: Step 1, 2, 3 完了

- **Step 5** [writing-assistant, 6分]
  - タスク: 英語版作成
  - 入力: Step 4 の構造を参照
  - 出力: `src/content/blog/en/typescript-5-deep-dive.md`
  - 依存関係: Step 4 完了

- **Step 6** [writing-assistant, 6分]
  - タスク: 日本語版作成
  - 入力: Step 4 の構造を参照
  - 出力: `src/content/blog/ja/typescript-5-deep-dive.md`
  - 依存関係: Step 4 完了

#### Phase C: 検証 (順次実行)
- **Step 7** [editor, 4分]
  - タスク: 全バージョン品質レビュー
  - 検証: 文法、技術的正確性、一貫性
  - 依存関係: Step 4, 5, 6 完了

- **Step 8** [seo-optimizer, 2分]
  - タスク: メタデータ最適化
  - 検証: description の長さ、キーワード密度
  - 依存関係: Step 7 完了

- **Step 9** [site-manager, 1分]
  - タスク: ビルド検証
  - 検証: `npm run build` 成功
  - 依存関係: Step 8 完了

### 3. リソース割り当て
- **必要なツール**:
  - WebSearch (Step 1, 2)
  - Image Generator API (Step 3)
  - File System (Step 4-9)
  - Bash (Step 9)
- **必要なコンテキスト**:
  - `CLAUDE.md` (ブログ作成ガイドライン)
  - `src/content.config.ts` (スキマ定義)
  - 既存のTypeScript関連投稿2個 (参考用)
- **予想トークン使用量**:
  - Phase A: 15,000 tokens
  - Phase B: 45,000 tokens
  - Phase C: 10,000 tokens
  - 合計: 70,000 tokens

### 4. リスク評価
- **潜在的な失敗ポイント**:
  - Step 1-2: Web検索API制限
    - 代替: Context7 MCPで公式ドキュメント照会
  - Step 3: 画像生成APIエラー
    - 代替: 既存のTypeScript画像を再利用
  - Step 4-6: 文量不足
    - 復旧: 具体的なフィードバックで再作成リクエスト
  - Step 9: ビルド失敗
    - 復旧: エラーログ分析後修正

### 5. 予想所要時間
- Phase A: 3分 (並列)
- Phase B: 8分 (Step 4) + 並列6分 (Step 5, 6)
- Phase C: 7分 (順次)
- **合計: 24分**

### 6. 並列実行戦略
- **Phase A**: 3ステップ並列実行
- **Phase B**: Step 5, 6 並列実行 (Step 4 参照)
- **Phase C**: 順次実行 (品質保証)
```

#### 例2: TypeScriptコードで計画を表現

```typescript
interface ExecutionPlan {
  goal: string;
  successCriteria: string[];
  scope: {
    included: string[];
    excluded: string[];
  };
  phases: Phase[];
  resources: {
    tools: string[];
    context: string[];
    estimatedTokens: number;
  };
  risks: Risk[];
}

interface Phase {
  name: string;
  parallelizable: boolean;
  steps: Step[];
}

interface Step {
  id: number;
  agent: string;
  task: string;
  estimatedDuration: number; // minutes
  dependencies: number[]; // step IDs
  inputs: string[];
  outputs: string[];
}

interface Risk {
  step: number;
  description: string;
  probability: 'low' | 'medium' | 'high';
  mitigation: string;
  alternative: string;
}

// 計画生成関数
async function createExecutionPlan(
  request: string
): Promise<ExecutionPlan> {
  const analysis = await analyzeRequest(request);
  const steps = await decomposeIntoSteps(analysis);
  const phases = await groupIntoPhases(steps);
  const risks = await identifyRisks(steps);

  return {
    goal: analysis.goal,
    successCriteria: analysis.criteria,
    scope: analysis.scope,
    phases,
    resources: {
      tools: steps.flatMap(s => s.requiredTools),
      context: analysis.requiredContext,
      estimatedTokens: estimateTokenUsage(steps)
    },
    risks
  };
}
```

### 説明 (Explanation)

#### なぜ明示的計画が必要か?

1. **予測可能性**: タスク時間とリソースを事前に推定可能
2. **並列化**: 依存関係分析で同時実行可能なステップを識別
3. **復旧可能性**: 失敗ポイントの予測と代替案の準備
4. **透明性**: ユーザーとシステム双方が進捗を把握可能

#### 計画生成の原則

1. **SMART目標**:
   - Specific (具体的): "ブログ投稿作成" → "2500字以上、コード例5個を含む"
   - Measurable (測定可能): "品質レビュー" → "文法エラー0個、技術的正確性95%+"
   - Achievable (達成可能): 現在のツールとコンテキストで実現可能
   - Relevant (関連性): ユーザーリクエストと直接関連
   - Time-bound (時間制限): 各ステップごとの予想時間を明示

2. **依存関係グラフ**:
   - 各ステップの前提条件を明示
   - 循環依存を防止
   - 並列実行可能なステップを識別

3. **リスクベースの計画**:
   - 各ステップの失敗可能性を評価
   - 代替経路を事前に準備
   - 復旧戦略を含める

### 変形 (Variations)

#### 動的計画調整

実行中の新しい情報に応じて計画を修正:

```typescript
async function executePlanWithAdaptation(
  plan: ExecutionPlan
): Promise<void> {
  for (const phase of plan.phases) {
    const results = await executePhase(phase);

    // 結果に応じて次のステップを調整
    if (results.qualityScore < 0.8) {
      // 品質不足時は追加レビューステップを挿入
      const reviewStep = createReviewStep(phase);
      plan.phases.splice(
        plan.phases.indexOf(phase) + 1,
        0,
        { name: 'Additional Review', steps: [reviewStep] }
      );
    }

    // 予想より早く完了時は次のステップを前倒し
    if (results.duration < phase.estimatedDuration * 0.7) {
      await executePhase(plan.phases[plan.phases.indexOf(phase) + 1]);
    }
  }
}
```

#### 段階的詳細化

初期は高レベルの計画のみを生成し、実行直前に詳細化:

```markdown
# 初期計画 (High-Level)
1. リサーチ → 2. 作成 → 3. 検証

# Step 1 実行直前の詳細化
1. リサーチ
   1.1. 公式ドキュメント調査 (web-researcher, 3分)
   1.2. コミュニティの反応収集 (web-researcher, 3分)
   1.3. ベンチマークデータ収集 (web-researcher, 2分)
```

---

## Recipe 12.3: Hierarchical Delegation (階層的委任)

### 問題 (Problem)

すべてのタスクを1つのエージェントが処理すると、次の問題が発生します:
- コンテキストオーバーロード (責任が多すぎる)
- 専門性の欠如 (すべてのドメインに熟練できない)
- 並列実行不可 (シングルスレッド)

### 解決策 (Solution)

複雑なタスクを階層構造を通じて適切な専門エージェントに委任してください。

#### 3層アーキテクチャ

```
ユーザー
  ↓
オーケストレーター (調整者)
  ↓
クラスターリーダー (ドメイン専門家)
  ↓
個別エージェント (詳細タスク実行者)
```

### コード/例 (Code)

#### クラスター定義

```yaml
# .claude/guidelines/agent-clusters.md

content-creation:
  leader: writing-assistant
  members:
    - content-planner
    - editor
    - image-generator
  capabilities:
    - ブログ投稿作成
    - コンテンツ戦略立案
    - 文法/スタイルレビュー
    - ヒーロー画像生成
  communication: leaderがタスク調整

research-analysis:
  leader: web-researcher
  members:
    - post-analyzer
    - analytics
    - analytics-reporter
  capabilities:
    - Webリサーチ
    - コンテンツ分析
    - トラフィック分析
    - データレポート生成

seo-marketing:
  leader: seo-optimizer
  members:
    - backlink-manager
    - social-media-manager
  capabilities:
    - サイトマップ最適化
    - メタタグ管理
    - バックリンク戦略
    - ソーシャルメディア共有

content-discovery:
  leader: content-recommender
  members: []
  capabilities:
    - 意味論的推薦
    - 関連コンテンツ発見

operations:
  leader: site-manager
  members:
    - portfolio-curator
    - learning-tracker
    - improvement-tracker
    - prompt-engineer
  capabilities:
    - ビルド/デプロイ
    - ポートフォリオ管理
    - 学習追跡
    - プロンプト最適化
```

#### オーケストレーター実装

```typescript
// .claude/agents/orchestrator.md をTypeScriptで表現

interface OrchestratorWorkflow {
  // Phase 1: リクエスト分析
  async analyze(request: string): Promise<TaskAnalysis> {
    return {
      goals: this.extractGoals(request),
      requirements: this.extractRequirements(request),
      successCriteria: this.defineSuccessCriteria(request),
      complexity: this.assessComplexity(request),
      primaryDomain: this.identifyDomain(request) // どのクラスター?
    };
  }

  // Phase 2: 計画立案
  async plan(analysis: TaskAnalysis): Promise<ExecutionPlan> {
    const steps = this.decomposeIntoSteps(analysis);
    const agents = this.assignAgents(steps);
    const dependencies = this.identifyDependencies(steps);
    const parallel = this.findParallelOpportunities(dependencies);

    return { steps, agents, dependencies, parallel };
  }

  // Phase 3: クラスターに委任
  async execute(plan: ExecutionPlan): Promise<void> {
    for (const phase of plan.phases) {
      // クラスターごとにグループ化
      const clusterGroups = this.groupByCluster(phase.steps);

      // クラスターリーダーに委任
      const results = await Promise.all(
        Object.entries(clusterGroups).map(([cluster, steps]) =>
          this.delegateToClusterLeader(cluster, steps)
        )
      );

      await this.updateState(phase, results);
      await this.qualityCheck(phase, results);
    }
  }

  // クラスターリーダーに委任
  async delegateToClusterLeader(
    cluster: string,
    steps: Step[]
  ): Promise<StepResult[]> {
    const leader = this.getClusterLeader(cluster);

    // 委任コンテキスト生成
    const context = {
      task: this.summarizeSteps(steps),
      guidelines: this.loadGuidelines(),
      resources: this.gatherResources(steps),
      qualityCriteria: this.defineQualityCriteria(steps)
    };

    return await leader.execute(context);
  }

  // Phase 4: 結果の統合
  async synthesize(results: StepResult[]): Promise<FinalResult> {
    return {
      deliverables: this.collectDeliverables(results),
      summary: this.generateSummary(results),
      metrics: this.calculateMetrics(results),
      nextSteps: this.suggestNextSteps(results)
    };
  }
}
```

#### 委任コンテキストの例

```markdown
## クラスターリーダー委任例

### To: writing-assistant (content-creation リーダー)

#### タスク
韓国語、英語、日本語のブログ投稿作成

#### 伝達情報
1. **プロジェクトルール**:
   - `CLAUDE.md`のブログ作成ガイドライン
   - Frontmatterスキマ (title, description, pubDate, heroImage, tags)
   - pubDateは'YYYY-MM-DD'形式を使用

2. **リサーチ結果**:
   - TypeScript 5.0 リリースノート要約 (1500字)
   - コミュニティの反応 (500字)
   - パフォーマンスベンチマークデータ (チャート3個)

3. **参考投稿**:
   - `src/content/blog/ko/typescript-4-9.md`
   - `src/content/blog/ko/typescript-best-practices.md`

4. **ターゲット読者**:
   - 韓国語: 中級以上の開発者
   - 英語: 国際的な開発者
   - 日本語: 日本企業の開発者

5. **SEO要件**:
   - キーワード: "TypeScript 5.0", "タイプスクリプト", "デコレーター"
   - description: 150-160字

6. **画像パス**:
   - heroImage: `../../../assets/blog/typescript-5-hero.jpg`

#### 品質基準
- Frontmatterの完全性: すべての必須フィールドを含む
- 文量: 各言語2500字以上
- コード例: 5個以上
- 技術的正確性: 公式ドキュメントベース
- SEO最適化: descriptionの長さ遵守

#### サブタスク委任権限
writing-assistantは次のエージェントに追加委任可能:
- **editor**: 下書きレビューと修正提案
- **image-generator**: 追加ダイアグラムが必要な場合
- **content-planner**: 構造改善提案が必要な場合

#### 予想所要時間
- 韓国語下書き: 8分
- 英語/日本語翻訳: 各6分 (並列)
- 合計: 14分
```

### 説明 (Explanation)

#### 階層的委任の利点

1. **コンテキストの集中**:
   - オーケストレーター: 全体計画と調整のみに集中
   - クラスターリーダー: ドメイン内のタスク調整
   - 個別エージェント: 詳細タスク実行

2. **専門性**:
   - 各エージェントは自分のドメインで最高のパフォーマンスを発揮
   - ツールとプロンプトが特化される

3. **並列実行**:
   - 複数のクラスターが同時にタスク可能
   - クラスター内でもエージェント間で並列実行

4. **拡張性**:
   - 新しいエージェントの追加が容易 (既存クラスターに追加)
   - 新しいクラスターの作成が容易 (独立したドメイン)

#### 委任プロトコル

```typescript
interface DelegationProtocol {
  // 1. 委任対象の選択
  selectAgent(task: Task): Agent {
    const domain = this.identifyDomain(task);
    const cluster = this.getCluster(domain);
    return cluster.leader;
  }

  // 2. コンテキストのパッケージング
  packageContext(task: Task, agent: Agent): Context {
    return {
      task: this.formatTaskForAgent(task, agent),
      guidelines: this.loadRelevantGuidelines(agent),
      resources: this.gatherResources(task),
      examples: this.findSimilarExamples(task),
      qualityCriteria: this.defineQualityCriteria(task)
    };
  }

  // 3. 委任実行
  async delegate(agent: Agent, context: Context): Promise<Result> {
    const result = await agent.execute(context);
    await this.validateResult(result, context.qualityCriteria);
    return result;
  }

  // 4. 結果検証
  async validateResult(result: Result, criteria: Criteria): Promise<void> {
    if (!this.meetsQuality(result, criteria)) {
      throw new QualityError('Result does not meet criteria');
    }
  }
}
```

### 変形 (Variations)

#### 動的クラスター構成

タスクに応じて一時的なクラスターを作成:

```typescript
async function createAdHocCluster(task: Task): Promise<Cluster> {
  const requiredCapabilities = analyzeRequiredCapabilities(task);
  const agents = selectAgentsByCapabilities(requiredCapabilities);
  const leader = electLeader(agents); // 最適なエージェントをリーダーに

  return {
    name: `adhoc-${task.id}`,
    leader,
    members: agents.filter(a => a !== leader),
    capabilities: requiredCapabilities
  };
}
```

#### エージェント間の直接通信

リーダーを経由せずにエージェント間で直接協業:

```typescript
// editorがwriting-assistantに直接フィードバック
const feedback = await editor.review(draft);
const revised = await writingAssistant.revise(draft, feedback);

// オーケストレーターには最終結果のみ報告
return revised;
```

---

## Recipe 12.4: Persistent Memory (永続的メモリ)

### 問題 (Problem)

セッションが終了するとすべてのコンテキストが失われます。長期タスク中に中断されると最初からやり直す必要があり、以前のタスク結果を再利用できません。

### 解決策 (Solution)

タスク状態、コンテキスト、中間結果をファイルシステムに継続的に保存してください。

### コード/例 (Code)

#### 状態管理ディレクトリ構造

```
.claude/
└── memory/
    ├── task-state.json          # 現在のタスク状態
    ├── task-history.json        # タスク履歴
    ├── context-cache/           # コンテキストキャッシュ
    │   ├── research/            # リサーチ結果
    │   ├── drafts/              # 下書き
    │   └── reviews/             # レビュー結果
    └── recovery-points/         # 復旧ポイント
        ├── checkpoint-001.json
        ├── checkpoint-002.json
        └── ...
```

#### task-state.json スキマ

```typescript
interface TaskState {
  current_task: {
    id: string;                  // "task_20251118_001"
    started_at: string;          // ISO 8601 timestamp
    updated_at: string;
    goal: string;
    status: 'planning' | 'in_progress' | 'paused' | 'completed' | 'failed';
    plan: ExecutionPlan;
    progress: {
      total_steps: number;
      completed_steps: number;
      current_step: number;
    };
    context: Record<string, any>;
  };
  recovery_points: RecoveryPoint[];
  metrics: {
    token_usage: number;
    elapsed_time: number;       // seconds
    retries: number;
  };
}

interface RecoveryPoint {
  id: string;
  step: number;
  timestamp: string;
  state_snapshot: string;       // JSON stringified state
  artifacts: string[];          // paths to saved files
}

// 例データ
const exampleState: TaskState = {
  current_task: {
    id: "task_20251118_001",
    started_at: "2025-11-18T10:00:00Z",
    updated_at: "2025-11-18T10:15:00Z",
    goal: "TypeScript 5.0 多言語ブログ投稿作成",
    status: "in_progress",
    plan: {
      phases: [
        {
          name: "Phase A: 準備",
          steps: [
            {
              id: 1,
              agent: "web-researcher",
              task: "TypeScript 5.0 調査",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-release-notes.md",
              completed_at: "2025-11-18T10:03:00Z"
            },
            {
              id: 2,
              agent: "web-researcher",
              task: "コミュニティの反応収集",
              status: "completed",
              output_path: ".claude/memory/context-cache/research/ts5-community.md",
              completed_at: "2025-11-18T10:05:00Z"
            },
            {
              id: 3,
              agent: "image-generator",
              task: "ヒーロー画像生成",
              status: "completed",
              output_path: "src/assets/blog/typescript-5-hero.jpg",
              completed_at: "2025-11-18T10:07:00Z"
            }
          ]
        },
        {
          name: "Phase B: 作成",
          steps: [
            {
              id: 4,
              agent: "writing-assistant",
              task: "韓国語下書き作成",
              status: "in_progress",
              progress: 60,
              started_at: "2025-11-18T10:10:00Z"
            },
            {
              id: 5,
              agent: "writing-assistant",
              task: "英語版作成",
              status: "pending"
            },
            {
              id: 6,
              agent: "writing-assistant",
              task: "日本語版作成",
              status: "pending"
            }
          ]
        }
      ]
    },
    progress: {
      total_steps: 9,
      completed_steps: 3,
      current_step: 4
    },
    context: {
      research_summary: "TypeScript 5.0はデコレーター標準化、const型パラメーターなどを導入...",
      target_audience: "中級以上の開発者",
      keywords: ["TypeScript 5.0", "タイプスクリプト", "デコレーター"]
    }
  },
  recovery_points: [
    {
      id: "checkpoint-001",
      step: 3,
      timestamp: "2025-11-18T10:07:00Z",
      state_snapshot: "{...}",
      artifacts: [
        ".claude/memory/context-cache/research/ts5-release-notes.md",
        ".claude/memory/context-cache/research/ts5-community.md",
        "src/assets/blog/typescript-5-hero.jpg"
      ]
    }
  ],
  metrics: {
    token_usage: 25000,
    elapsed_time: 900,  // 15 minutes
    retries: 0
  }
};
```

#### 状態管理関数

```typescript
// 状態読み込み
async function readTaskState(): Promise<TaskState | null> {
  const path = '.claude/memory/task-state.json';
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 状態更新
async function updateTaskState(
  updates: Partial<TaskState['current_task']>
): Promise<void> {
  const state = await readTaskState() || createNewState();

  state.current_task = {
    ...state.current_task,
    ...updates,
    updated_at: new Date().toISOString()
  };

  await fs.writeFile(
    '.claude/memory/task-state.json',
    JSON.stringify(state, null, 2)
  );
}

// ステップ完了記録
async function completeStep(
  stepId: number,
  output: any
): Promise<void> {
  const state = await readTaskState();

  // 該当ステップを検索
  const step = findStepById(state.current_task.plan, stepId);

  step.status = 'completed';
  step.output = output;
  step.completed_at = new Date().toISOString();

  // 進捗率更新
  state.current_task.progress.completed_steps += 1;
  state.current_task.progress.current_step = stepId + 1;

  // 復旧ポイント生成 (5ステップごと)
  if (stepId % 5 === 0) {
    await createRecoveryPoint(state, stepId);
  }

  await saveTaskState(state);
}

// 復旧ポイント生成
async function createRecoveryPoint(
  state: TaskState,
  stepId: number
): Promise<void> {
  const checkpoint: RecoveryPoint = {
    id: `checkpoint-${String(stepId).padStart(3, '0')}`,
    step: stepId,
    timestamp: new Date().toISOString(),
    state_snapshot: JSON.stringify(state.current_task),
    artifacts: collectArtifacts(state, stepId)
  };

  state.recovery_points.push(checkpoint);

  // 別ファイルとしても保存 (安全性)
  await fs.writeFile(
    `.claude/memory/recovery-points/${checkpoint.id}.json`,
    JSON.stringify(checkpoint, null, 2)
  );
}

// タスク再開
async function resumeTask(): Promise<void> {
  const state = await readTaskState();

  if (!state || state.current_task.status === 'completed') {
    console.log('再開するタスクがありません。');
    return;
  }

  console.log(`タスク再開: ${state.current_task.goal}`);
  console.log(`進捗率: ${state.current_task.progress.completed_steps}/${state.current_task.progress.total_steps}`);

  // 現在のステップから続行
  const currentStep = state.current_task.progress.current_step;
  const remainingSteps = getRemainingSteps(state.current_task.plan, currentStep);

  for (const step of remainingSteps) {
    await executeStep(step);
  }
}

// 以前の復旧ポイントにロールバック
async function rollbackToCheckpoint(checkpointId: string): Promise<void> {
  const state = await readTaskState();
  const checkpoint = state.recovery_points.find(cp => cp.id === checkpointId);

  if (!checkpoint) {
    throw new Error(`Checkpoint ${checkpointId} not found`);
  }

  // 状態復元
  state.current_task = JSON.parse(checkpoint.state_snapshot);
  state.current_task.status = 'paused';

  console.log(`Checkpoint ${checkpointId} (Step ${checkpoint.step})にロールバック`);

  await saveTaskState(state);
}
```

#### コンテキストキャッシング

```typescript
// リサーチ結果のキャッシング
async function cacheResearchResult(
  topic: string,
  content: string
): Promise<string> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  await fs.writeFile(path, content);

  return path;
}

// キャッシュされたリサーチ結果の再利用
async function getRearchResult(topic: string): Promise<string | null> {
  const filename = `${topic.replace(/\s+/g, '-').toLowerCase()}.md`;
  const path = `.claude/memory/context-cache/research/${filename}`;

  try {
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

// 使用例
const cachedResult = await getResearchResult('typescript-5-release-notes');
if (cachedResult) {
  console.log('キャッシュされたリサーチ結果を使用 (トークン節約!)');
  return cachedResult;
} else {
  const newResult = await webResearcher.research('TypeScript 5.0 リリースノート');
  await cacheResearchResult('typescript-5-release-notes', newResult);
  return newResult;
}
```

### 説明 (Explanation)

#### 永続的メモリの利点

1. **中断後の再開**:
   - タスク中にエラーや中断が発生しても最初からやり直す必要がない
   - 完了したステップの結果を再利用

2. **コンテキストの再利用**:
   - 以前のリサーチ結果、下書きなどを他のタスクで再利用
   - トークン使用量の節約

3. **履歴管理**:
   - タスク完了後も履歴を保存
   - 学習と改善に活用

4. **透明性**:
   - 進捗追跡が可能
   - ボトルネックの識別

#### メモリ設計原則

1. **階層的保存**:
   - ホットデータ (task-state.json): 頻繁に更新
   - ウォームデータ (context-cache/): たまに参照
   - コールドデータ (task-history.json): 保管用

2. **増分更新**:
   - 全体の状態を毎回保存せず、変更された部分のみ
   - 復旧ポイントは全体のスナップショット

3. **TTL (Time To Live)**:
   - 古いキャッシュを自動削除
   - 完了したタスクはhistoryに移動

### 変形 (Variations)

#### 分散メモリ

複数のエージェントが独立してメモリにアクセス:

```typescript
// エージェント別メモリスペース
.claude/memory/
├── agents/
│   ├── writing-assistant/
│   │   ├── drafts/
│   │   └── templates/
│   ├── web-researcher/
│   │   └── research-cache/
│   └── ...
└── shared/
    ├── task-state.json
    └── context-cache/
```

#### 外部ストレージ統合

ファイルシステムの代わりにデータベースを使用:

```typescript
// Redisを使用したメモリ保存
import Redis from 'ioredis';

const redis = new Redis();

async function saveTaskState(state: TaskState): Promise<void> {
  await redis.set(
    `task:${state.current_task.id}`,
    JSON.stringify(state),
    'EX',
    86400  // 24時間TTL
  );
}

async function readTaskState(taskId: string): Promise<TaskState | null> {
  const data = await redis.get(`task:${taskId}`);
  return data ? JSON.parse(data) : null;
}
```

---

## Recipe 12.5: Extreme Context Engineering (極限的コンテキストエンジニアリング)

### 問題 (Problem)

AIエージェントが不完全な情報でタスクを実行すると、次の問題が発生します:
- 誤った仮定によるエラー
- 品質基準の未達
- 繰り返しの修正リクエスト
- コンテキスト欠落による一貫性の欠如

### 解決策 (Solution)

タスク実行に必要なすべての関連情報をコンテキストに含めてください。

### コード/例 (Code)

#### コンテキストチェックリスト

```markdown
## 委任コンテキストチェックリスト

### 必須項目
- [ ] タスク目標 (明確で測定可能)
- [ ] 成功基準 (品質基準、検証方法)
- [ ] プロジェクトルール (CLAUDE.md, スタイルガイド)
- [ ] スキマ/型定義 (必要時)
- [ ] 例 (類似タスクの成果物)

### ドメイン別追加項目

#### ブログ作成
- [ ] ターゲット読者 (経験レベル、関心事)
- [ ] SEO要件 (キーワード、descriptionの長さ)
- [ ] リサーチ結果 (調査した情報)
- [ ] 参考投稿 (既存の関連投稿)
- [ ] 画像パス (heroImage の場所)
- [ ] 多言語要件 (どの言語?)

#### コードリファクタリング
- [ ] 現在のコードベース構造
- [ ] リファクタリング目標 (パフォーマンス? 可読性?)
- [ ] テストカバレッジ要件
- [ ] ブレイキングチェンジの許可
- [ ] コーディング規約 (ESLint, Prettier 設定)

#### SEO最適化
- [ ] ターゲットキーワードリスト
- [ ] 競合分析結果
- [ ] 現在のSEOメトリクス (順位、トラフィック)
- [ ] 技術的制約 (フレームワーク、CDN)
- [ ] 地域/言語ターゲット
```

#### コンテキストパッケージング関数

```typescript
interface TaskContext {
  task: {
    goal: string;
    successCriteria: string[];
    constraints: string[];
  };
  projectRules: {
    guidelines: string;      // CLAUDE.md の内容
    schema: any;             // スキマ定義
    styleGuide: string;      // コーディング/作成スタイル
  };
  domainKnowledge: {
    research: string[];      // リサーチ結果パス
    examples: string[];      // 類似タスク例パス
    references: string[];    // 参考文書
  };
  qualityCriteria: {
    required: string[];      // 必須要件
    preferred: string[];     // 推奨事項
    validation: string[];    // 検証方法
  };
  resources: {
    tools: string[];         // 使用可能なツール
    apis: string[];          // APIキー/エンドポイント
    data: Record<string, any>; // 参照データ
  };
}

async function packageContextForAgent(
  task: Task,
  agent: Agent
): Promise<TaskContext> {
  return {
    task: {
      goal: task.goal,
      successCriteria: defineSuccessCriteria(task),
      constraints: identifyConstraints(task)
    },

    projectRules: {
      guidelines: await loadGuidelines(),
      schema: await loadSchema(task.domain),
      styleGuide: await loadStyleGuide(agent.domain)
    },

    domainKnowledge: {
      research: await gatherResearchResults(task),
      examples: await findSimilarExamples(task),
      references: await loadReferences(task.domain)
    },

    qualityCriteria: {
      required: defineRequiredCriteria(task),
      preferred: definePreferredCriteria(task),
      validation: defineValidationMethods(task)
    },

    resources: {
      tools: listAvailableTools(agent),
      apis: getApiConfiguration(agent),
      data: loadReferenceData(task)
    }
  };
}
```

#### 実戦例: ブログ作成コンテキスト

```markdown
## To: writing-assistant

### タスク目標
TypeScript 5.0 詳細分析ブログ投稿作成 (韓国語、英語、日本語)

### 成功基準
1. **文量**: 各言語2500字以上
2. **構造**: 序論、本論 (機能別)、実戦例、結論
3. **コード例**: 5個以上、文法ハイライト含む
4. **技術的正確性**: 公式ドキュメントベース、検証された情報のみ
5. **SEO**: description 150-160字、キーワードを自然に含む
6. **ビルド**: `npm run build` 成功

### 制約条件
- 中国語版は除外
- ビデオチュートリアルは除外
- 実験的機能は除外 (安定化された機能のみ)

---

### プロジェクトルール

#### CLAUDE.md 抜粋
\```markdown
## ブログ投稿作成ワークフロー

### ファイル位置
- 韓国語: `src/content/blog/ko/[slug].md`
- 英語: `src/content/blog/en/[slug].md`
- 日本語: `src/content/blog/ja/[slug].md`

### Frontmatter 必須フィールド
\```yaml
title: "明確で簡潔なタイトル (60字以下)"
description: "SEOを考慮した説明 (150-160字)"
pubDate: '2025-11-22'  # YYYY-MM-DD形式、シングルクォート
heroImage: ../../../assets/blog/[filename].jpg
tags: ["tag1", "tag2", "tag3"]  # 最大5個
relatedPosts: [...]  # 関連投稿 (別途提供)
\```

### マークダウン作成ルール
1. **太字テキスト**: `<strong>テキスト</strong>` HTMLタグを使用
2. **範囲表記**: 全角チルダ (`〜`) を使用
3. **コードブロック**: 言語指定必須
\```

#### Content Schema
\```typescript
// src/content.config.ts
{
  title: string,           // 必須
  description: string,     // 必須、150-160字
  pubDate: Date,          // 必須、YYYY-MM-DD
  heroImage: ImageMetadata, // 選択
  tags: string[],         // 選択、最大5個
  relatedPosts: Array<{   // 必須
    slug: string,
    score: number,
    reason: { ko, en, ja, zh }
  }>
}
\```

---

### ドメイン知識

#### リサーチ結果1: TypeScript 5.0 リリースノート要約
\```markdown
# TypeScript 5.0 主要機能

## 1. デコレーター標準化
- Stage 3 ECMAScriptデコレーターサポート
- 既存の実験的デコレーターと互換性なし
- `@decorator` 文法の公式サポート

\```typescript
function logged(target: any, key: string) {
  const original = target[key];
  target[key] = function(...args: any[]) {
    console.log(`Calling ${key} with`, args);
    return original.apply(this, args);
  };
}

class Example {
  @logged
  greet(name: string) {
    return `Hello, ${name}!`;
  }
}
\```

## 2. const 型パラメーター
- 型パラメーターを `const` として宣言可能
- 型推論の改善

\```typescript
function identity<const T>(value: T): T {
  return value;
}

const arr = identity([1, 2, 3]); // type: readonly [1, 2, 3]
\```

## 3. パフォーマンス改善
- ビルド速度10-20%向上
- メモリ使用量30%減少
- 大規模プロジェクトで体感効果大

[... 1500字 さらに ...]
\```

#### リサーチ結果2: コミュニティの反応
\```markdown
# TypeScript 5.0 コミュニティの反応

- Reddit r/typescript: デコレーター標準化に肯定的
- HackerNews: パフォーマンス改善が好評
- Twitter: Angular/NestJS開発者が歓迎
- GitHub Issues: マイグレーションガイドのリクエスト多数

主な関心事:
1. 既存デコレーターコードのマイグレーション方法
2. フレームワークサポートスケジュール (Angular, NestJS)
3. パフォーマンスベンチマーク詳細結果

[... 500字 さらに ...]
\```

#### 参考投稿1: `src/content/blog/ko/typescript-4-9.md`
\```markdown
---
title: TypeScript 4.9の新機能完全ガイド
description: satisfies演算子から改善された型チェックまで、TypeScript 4.9のすべて
pubDate: '2024-08-15'
heroImage: ../../../assets/blog/typescript-4-9-hero.jpg
tags: ["typescript", "javascript", "type-system"]
---

## 序論
TypeScript 4.9は型システムの安全性と開発者体験を大きく改善したバージョンです...

[構造参考用]
\```

#### 参考投稿2: `src/content/blog/ko/typescript-best-practices.md`
\```markdown
[トーン&マナー参考用]
- 親しみやすくも専門的な語調
- コード例 → 説明 → 実戦ヒント の順序
- "こうすればいいです" より "こうすることができます" を選好
\```

---

### 品質基準

#### 必須要件
1. ✅ Frontmatterの完全性: すべての必須フィールドを含む
2. ✅ 文量: 韓国語/英語/日本語 各2500字以上
3. ✅ コード例: 5個以上、TypeScript文法ハイライト
4. ✅ 技術的正確性: リサーチ結果ベース、推測禁止
5. ✅ ビルド成功: `npm run build` エラーなし

#### 推奨事項
1. 💡 実戦ヒント: "注意点"、"Best Practice" セクション
2. 💡 比較表: 既存バージョンとの違いを表で整理
3. 💡 ダイアグラム: Mermaidで概念を可視化 (選択)
4. 💡 マイグレーションガイド: 既存コードのアップグレード方法

#### 検証方法
1. **自動検証**:
   - `npm run astro check` (型チェック)
   - `npm run build` (ビルド成功)
   - Frontmatterスキマ準拠

2. **手動検証** (editor エージェント):
   - 文法エラー0個
   - 技術的正確性95%+
   - コード例の実行可能性

---

### リソース

#### 使用可能なツール
- Read: ファイル読み込み
- Write: ファイル書き込み
- Edit: ファイル修正
- WebSearch: 追加情報検索 (必要時)
- Bash: npm run build 実行

#### 画像パス
- heroImage: `../../../assets/blog/typescript-5-hero.jpg` (既に生成済み)

#### 参照データ
\```json
{
  "targetAudience": {
    "ko": "中級以上TypeScriptユーザー、3年+経験",
    "en": "Intermediate+ TypeScript developers",
    "ja": "中級以上のTypeScriptユーザー"
  },
  "keywords": ["TypeScript 5.0", "タイプスクリプト", "デコレーター", "const型パラメーター"],
  "relatedPosts": [
    {
      "slug": "typescript-4-9",
      "score": 0.92,
      "reason": {
        "ko": "前バージョンであるTypeScript 4.9と比較して変更事項を理解できます",
        "en": "Helps understand changes by comparing with previous version TypeScript 4.9",
        "ja": "以前のバージョンTypeScript 4.9と比較して変更点を理解できます",
        "zh": "通过与之前的TypeScript 4.9版本对比理解变化"
      }
    }
  ]
}
\```

---

### サブタスク委任権限

writing-assistantは次のエージェントに追加委任可能:

1. **editor** (下書きレビュー):
   - 作成完了後、品質レビューをリクエスト
   - フィードバックに基づいて修正

2. **image-generator** (追加ダイアグラム):
   - 複雑な概念の可視化が必要な場合
   - 例: デコレーター実行順序ダイアグラム

3. **web-researcher** (追加調査):
   - リサーチ結果にない情報が必要な場合
   - 例: 特定フレームワークのサポートスケジュール

---

### 予想所要時間
- 韓国語下書き: 8分
- 英語翻訳: 6分 (韓国語構造参照)
- 日本語翻訳: 6分 (韓国語構造参照)
- 合計: 20分 (並列実行時は14分)

### 開始シグナル
準備完了。上記のコンテキストに基づいてタスクを開始してください。
```

### 説明 (Explanation)

#### 極限的コンテキストエンジニアリングの核心

1. **完全性**: エージェントが追加質問なしにタスクを実行できるレベル
2. **構造化**: タスク、ルール、知識、品質、リソースで明確に分離
3. **具体性**: "ブログ作成" → "2500字以上、コード例5個、SEO description 150-160字"
4. **例中心**: 類似タスクの成果物をコンテキストに含める

#### コンテキスト最適化の原則

```typescript
// 悪い例: 不完全なコンテキスト
const badContext = {
  task: "TypeScriptブログ作成"
  // ❌ 目標が不明確
  // ❌ 成功基準なし
  // ❌ 参考資料なし
};

// 良い例: 完全なコンテキスト
const goodContext = {
  task: {
    goal: "TypeScript 5.0 詳細分析投稿作成 (韓国語、英語、日本語)",
    successCriteria: [
      "各言語2500字以上",
      "コード例5個以上",
      "npm run build 成功"
    ],
    constraints: ["中国語除外", "実験的機能除外"]
  },
  projectRules: {
    guidelines: "...",  // CLAUDE.md 全文
    schema: {...},      // スキマ定義
    styleGuide: "..."   // 作成スタイル
  },
  domainKnowledge: {
    research: ["リサーチ結果1500字"],
    examples: ["参考投稿2個"],
    references: ["公式ドキュメントリンク"]
  },
  qualityCriteria: {
    required: ["必須要件5個"],
    preferred: ["推奨事項4個"],
    validation: ["検証方法明示"]
  }
};
```

#### コンテキストサイズ vs 品質のトレードオフ

| コンテキストサイズ | 利点 | 欠点 | 適した場合 |
|--------------|------|------|------------|
| 小 (< 1000 トークン) | 速い、安い | 品質低下、繰り返し修正 | 簡単なタスク |
| 中 (1000-5000) | バランス的 | - | 一般的なタスク |
| 大 (5000-20000) | 高品質、1回完成 | 遅い、高い | 複雑なタスク |
| 極大 (20000+) | 完璧な品質 | 非常に高い | 重要なタスク |

**推奨**: 複雑なタスクは大きなコンテキストで1回完成する方が繰り返し修正より経済的

### 変形 (Variations)

#### 段階的コンテキスト拡張

最初は最小コンテキストで開始し、エージェントが質問したら追加:

```typescript
async function executeWithProgressiveContext(
  task: Task,
  agent: Agent
): Promise<Result> {
  let context = createMinimalContext(task);
  let attempt = 0;
  const MAX_ATTEMPTS = 3;

  while (attempt < MAX_ATTEMPTS) {
    const result = await agent.execute(context);

    if (result.status === 'success') {
      return result;
    }

    if (result.status === 'needs_more_context') {
      // エージェントが要求した追加情報を提供
      context = await expandContext(context, result.questions);
      attempt++;
    } else {
      throw new Error(`Failed after ${attempt} attempts`);
    }
  }
}
```

#### コンテキストテンプレート

タスクタイプ別に事前定義されたテンプレートを使用:

```typescript
const contextTemplates = {
  'blog-writing': {
    sections: [
      'task',
      'projectRules',
      'domainKnowledge',
      'qualityCriteria',
      'resources'
    ],
    requiredFields: [
      'task.goal',
      'task.successCriteria',
      'projectRules.guidelines',
      'domainKnowledge.research',
      'qualityCriteria.validation'
    ]
  },
  'code-refactoring': {
    sections: [
      'task',
      'codebaseStructure',
      'testRequirements',
      'constraints',
      'qualityCriteria'
    ],
    requiredFields: [
      'task.goal',
      'codebaseStructure.architecture',
      'testRequirements.coverage',
      'constraints.breakingChanges'
    ]
  }
};

function createContextFromTemplate(
  type: string,
  data: any
): TaskContext {
  const template = contextTemplates[type];
  const context = {};

  for (const section of template.sections) {
    context[section] = data[section];
  }

  // 必須フィールド検証
  for (const field of template.requiredFields) {
    if (!getNestedValue(context, field)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return context;
}
```

---

## 実戦例: 総合適用

### シナリオ: サイト全体のSEO監査と最適化

このタスクはDeep Agentsの4つの柱をすべて活用する複雑な長期タスクです。

#### ユーザーリクエスト

```
"ブログサイト全体のSEOを監査して最適化してください。
すべての投稿のメタタグ、内部リンク、サイトマップを点検して改善してください。"
```

#### ステップ1: 明示的計画 (Explicit Planning)

```markdown
## タスク計画: サイト全体SEO最適化

### 目標
- すべてのブログ投稿 (120個)のSEOスコア90+達成
- サイトマップ最新化
- 内部リンク最適化 (孤立ページ0個)

### Phase A: 現状分析 (10分)
1. [seo-optimizer] すべての投稿メタタグ検査
2. [seo-optimizer] 内部リンクグラフ分析
3. [seo-optimizer] サイトマップ検証

### Phase B: 優先順位決定 (5分)
4. [seo-optimizer] SEOスコア低い投稿20個選定
5. [seo-optimizer] 孤立ページ識別
6. [seo-optimizer] 重複メタタグ検出

### Phase C: 最適化実行 (60分、並列)
7. [seo-optimizer] メタタグ一括修正 (20個投稿)
8. [seo-optimizer] 内部リンク追加 (孤立ページ解消)
9. [seo-optimizer] サイトマップ再生成

### Phase D: 検証 (10分)
10. [site-manager] ビルド検証
11. [seo-optimizer] 最終SEOスコア測定
12. [seo-optimizer] レポート生成

### 合計予想時間: 85分
### 予想トークン: 150,000
```

#### ステップ2: 階層的委任 (Hierarchical Delegation)

```typescript
// Orchestrator → SEO-Marketing Cluster
await orchestrator.delegateToCluster('seo-marketing', {
  task: 'サイト全体SEO監査と最適化',
  plan: executionPlan,
  resources: {
    allPosts: await getCollection('blog'),
    sitemapConfig: await loadConfig('sitemap'),
    seoGuidelines: await loadGuidelines('seo')
  }
});

// SEO-Optimizer (Cluster Leader) → サブエージェント
await seoOptimizer.delegateToTeam([
  {
    agent: 'seo-optimizer',
    task: 'メタタグ検査',
    scope: 'all posts'
  },
  {
    agent: 'backlink-manager',
    task: '内部リンク分析',
    scope: 'all posts'
  },
  {
    agent: 'social-media-manager',
    task: 'OGタグ検証',
    scope: 'all posts'
  }
]);
```

#### ステップ3: 永続的メモリ (Persistent Memory)

```json
// .claude/memory/task-state.json
{
  "current_task": {
    "id": "task_seo_audit_001",
    "started_at": "2025-11-18T14:00:00Z",
    "goal": "サイト全体SEO最適化",
    "status": "in_progress",
    "progress": {
      "total_steps": 12,
      "completed_steps": 7,
      "current_step": 8
    },
    "context": {
      "total_posts": 120,
      "low_score_posts": [
        "typescript-basics",
        "javascript-intro",
        // ... 18個 さらに
      ],
      "orphan_pages": ["old-tutorial", "draft-post"],
      "average_seo_score_before": 75,
      "average_seo_score_after": 88
    }
  },
  "recovery_points": [
    {
      "id": "checkpoint-005",
      "step": 5,
      "timestamp": "2025-11-18T14:25:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/seo-audit-report.md",
        ".claude/memory/low-score-posts.json"
      ]
    },
    {
      "id": "checkpoint-010",
      "step": 10,
      "timestamp": "2025-11-18T15:10:00Z",
      "state_snapshot": "{...}",
      "artifacts": [
        ".claude/memory/optimized-posts.json",
        ".claude/memory/internal-links-added.json"
      ]
    }
  ]
}
```

#### ステップ4: 極限的コンテキスト (Extreme Context Engineering)

```markdown
## To: seo-optimizer (SEO-Marketing Cluster Leader)

### タスク目標
すべてのブログ投稿 (120個)のSEO最適化

### 現状分析結果
\```json
{
  "total_posts": 120,
  "average_seo_score": 75,
  "issues": {
    "missing_description": 15,
    "description_too_short": 23,
    "missing_og_tags": 8,
    "orphan_pages": 2,
    "broken_internal_links": 12
  },
  "low_score_posts": [
    {
      "slug": "typescript-basics",
      "score": 52,
      "issues": ["description 短い (80字)", "内部リンク0個", "OG画像なし"]
    },
    // ... 19個 さらに
  ]
}
\```

### プロジェクトSEOガイドライン
\```markdown
## SEO最適化基準

### メタタグ
- title: 50-60字 (超過時は切り捨て)
- description: 150-160字 (必須)
- OG tags: title, description, image すべて含む

### 内部リンク
- 各投稿は最低3個以上の内部リンク
- 孤立ページ (incoming link 0個) 禁止
- 関連投稿自動推薦活用

### 画像
- heroImage 必須
- alt テキスト必須
- OG画像 1200x630 推奨
\```

### 既存投稿例
\```markdown
---
title: TypeScript 5.0の新機能完全ガイド
description: デコレーター標準化からconst型パラメーターまで、TypeScript 5.0のすべての変化を実戦例と共に学びます。 # 150字
heroImage: ../../../assets/blog/typescript-5-hero.jpg
tags: ["typescript", "javascript"]
---

本文中の内部リンク例:
- [TypeScript 4.9 機能](./typescript-4-9)
- [タイプスクリプト Best Practices](./typescript-best-practices)
\```

### 最適化戦略
1. **一括修正優先**:
   - description 欠落/短い → 自動生成 (本文最初の段落活用)
   - OGタグ欠落 → Frontmatterから自動抽出

2. **個別レビュー必要**:
   - SEOスコア50以下の投稿 (5個)
   - 孤立ページ (2個) → 関連投稿を見つけてリンク追加

3. **自動化**:
   - サイトマップ再生成スクリプト実行
   - 内部リンク検証スクリプト実行

### 品質基準
- SEOスコア平均90+達成
- 孤立ページ0個
- すべての投稿description 150-160字
- ビルド成功

### 使用可能なツール
- Read, Edit, Write: 投稿修正
- Bash: スクリプト実行
- Grep: パターン検索

### サブエージェント委任権限
- backlink-manager: 内部リンク戦略
- social-media-manager: OGタグ最適化

### 開始!
```

#### ステップ5: 自動復旧

```typescript
// Step 8 実行中にエラー発生
try {
  await seoOptimizer.optimizeMetaTags(lowScorePosts);
} catch (error) {
  if (error.type === 'ValidationError') {
    // 品質基準未達 → 再試行
    const feedback = analyzeError(error);
    await seoOptimizer.optimizeMetaTags(lowScorePosts, { feedback });
  } else if (error.type === 'FileNotFound') {
    // ファイル欠落 → スキップして続行
    await logWarning(`Skipped missing file: ${error.file}`);
    await continueToNextStep();
  } else {
    // 復旧不可能 → 最後のチェックポイントにロールバック
    await rollbackToCheckpoint('checkpoint-005');
    throw error;
  }
}
```

#### 最終結果

```markdown
## SEO最適化完了レポート

### 要約
- 作業時間: 82分 (計画85分比3分短縮)
- トークン使用: 148,000 (計画150,000比節約)
- 修正した投稿: 38個
- 追加した内部リンク: 45個

### 成果
| 指標 | Before | After | 改善 |
|------|--------|-------|------|
| 平均SEOスコア | 75 | 92 | +23% |
| description 欠落 | 15個 | 0個 | 100% |
| 孤立ページ | 2個 | 0個 | 100% |
| 平均内部リンク数 | 1.8個 | 4.2個 | +133% |

### 自動復旧イベント
- Step 7: 1個投稿description生成失敗 → 再試行成功
- Step 8: 2個画像ファイル欠落 → スキップ (手動確認必要)

### 次のステップ
1. 欠落した画像2個追加
2. 1ヶ月後にSEO成果測定
3. 新規投稿作成時に自動SEO検証追加
```

---

## おわりに

Deep Agentsパラダイムは、AIエージェントシステムを単純なツール使用者から自律的な協業パートナーへと進化させます。

### 核心要約

| 柱 | 核心概念 | 適用方法 |
|------|----------|----------|
| Explicit Planning | 明示的で構造化された計画 | タスク開始前にステップ別計画生成、依存関係を明示 |
| Hierarchical Delegation | 専門エージェントへの委任 | クラスター構造で組織、リーダー中心の調整 |
| Persistent Memory | セッション間の状態維持 | task-state.json、復旧ポイント、コンテキストキャッシング |
| Extreme Context | すべての関連情報を含む | チェックリストベースの完全なコンテキストパッケージング |

### 導入ロードマップ

#### Phase 1: 基礎構築 (1週間)
- [ ] orchestrator.md 作成と基本委任実装
- [ ] クラスター定義 (.claude/guidelines/agent-clusters.md)
- [ ] 既存エージェントにクラスター情報追加

#### Phase 2: 計画プロトコル (1週間)
- [ ] planning-protocol.md 作成
- [ ] 計画生成関数実装
- [ ] 複雑なタスク1個でテスト

#### Phase 3: メモリシステム (2週間)
- [ ] .claude/memory/ ディレクトリ構造作成
- [ ] state-management.md 作成
- [ ] task-state.json スキマ定義と実装
- [ ] 復旧ポイント自動生成実装

#### Phase 4: 復旧プロトコル (1週間)
- [ ] recovery-protocol.md 作成
- [ ] 失敗タイプ別対応ロジック実装
- [ ] ロールバックと再試行メカニズムのテスト

#### Phase 5: 最適化 (継続的)
- [ ] コンテキストテンプレートライブラリ構築
- [ ] トークン使用量モニタリングと最適化
- [ ] エージェント別パフォーマンス指標追跡

### 期待効果

**定量的**:
- 最大タスクステップ: 5〜15 → 100+
- 自動復旧率: 0% → 90%+
- コンテキスト再利用: 0% → 80%+
- 並列実行効率: 10% → 60%+

**定性的**:
- 長期タスクサポート (多言語コンテンツ、全体リファクタリング)
- 自律的問題解決 (再試行、再計画)
- 透明な進捗状況 (明示的計画)
- 中断後の再開可能 (永続的メモリ)

Deep Agentsは理論ではなく現実です。今すぐ `.claude/` ディレクトリに適用して、真の自律AIシステムを構築してください。

---

**次章予告**: Chapter 13では、Claude Codeのパフォーマンス最適化とトークン節約戦略を扱います。メタデータアーキテクチャ、増分処理、3層キャッシングシステムを通じて60-70%のコスト削減を達成する方法を学びます。
