---
title: 'AIコーディングエージェントが2,900万件のシークレットを漏洩させた — MCP設定ファイルセキュリティの盲点'
description: >-
  GitGuardian
  2026レポートによると、AIコーディングツールを使用するリポジトリのシークレット漏洩率はGitHub平均の2倍です。MCP設定ファイルだけで24,000件以上のクレデンシャルが露出しました。実際の点検方法と対策をまとめます。
pubDate: '2026-03-30'
heroImage: ../../../assets/blog/ai-coding-secrets-sprawl-mcp-config-security-hero.jpg
tags:
  - security
  - mcp
  - ai-coding
  - secrets
  - devops
relatedPosts:
  - slug: openai-promptfoo-ai-agent-devsecops
    score: 0.94
    reason:
      ko: AI 에이전트가 만드는 코드의 보안 테스트 자동화를 다루며, 시크릿 유출 방지와 함께 DevSecOps 파이프라인을 완성하는 방법을 소개합니다.
      ja: AIエージェントが生成するコードのセキュリティテスト自動化を扱い、シークレット漏洩防止と合わせてDevSecOpsパイプラインを完成させる方法を紹介します。
      en: Covers automated security testing for AI-generated code, complementing secret leak prevention with a complete DevSecOps pipeline approach.
      zh: 介绍了AI生成代码的安全测试自动化，与密钥泄露防护结合构建完整的DevSecOps流水线。
  - slug: roguepilot-copilot-prompt-injection-security
    score: 0.93
    reason:
      ko: AI 코딩 도구의 또 다른 보안 위협인 프롬프트 인젝션을 다룹니다. 시크릿 유출과 함께 알아두어야 할 AI 코딩 보안 리스크입니다.
      ja: AIコーディングツールのもう一つのセキュリティ脅威であるプロンプトインジェクションを扱います。シークレット漏洩と併せて知っておくべきリスクです。
      en: Explores prompt injection vulnerabilities in AI coding tools — another critical security risk to understand alongside secret leakage.
      zh: 探讨AI编程工具的另一个安全威胁——提示注入漏洞，与密钥泄露同为需要了解的关键风险。
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.93
    reason:
      ko: AI가 보안 취약점을 자동으로 찾아내는 사례를 보여줍니다. AI가 시크릿을 유출시키기도 하지만, 반대로 보안 감사의 도구가 되기도 한다는 양면을 이해할 수 있습니다.
      ja: AIが自動的にセキュリティ脆弱性を発見する事例です。AIがシークレットを漏洩させる一方で、セキュリティ監査ツールにもなるという両面を理解できます。
      en: Shows how AI can automatically find security vulnerabilities. While AI leaks secrets, it can also serve as a powerful security audit tool — understanding both sides is key.
      zh: 展示了AI自动发现安全漏洞的案例。AI既会泄露密钥，也能成为安全审计工具——理解这种双面性很重要。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.92
    reason:
      ko: MCP 프로토콜 자체의 CVE 취약점을 다룬 글입니다. 설정 파일의 시크릿 유출과는 다른 각도에서 MCP 보안 전체를 조망할 수 있습니다.
      ja: MCPプロトコル自体のCVE脆弱性を扱った記事です。設定ファイルのシークレット漏洩とは異なる角度からMCPセキュリティ全体を俯瞰できます。
      en: Covers CVE vulnerabilities in the MCP protocol itself. Provides a different angle on MCP security beyond config file secret leakage.
      zh: 讨论了MCP协议本身的CVE漏洞。从不同角度全面审视MCP安全性，超越配置文件密钥泄露的范畴。
  - slug: cursor-agent-trace-ai-code-attribution
    score: 0.91
    reason:
      ko: AI가 작성한 코드를 추적하는 오픈 표준을 소개합니다. 시크릿 유출 코드가 AI가 만든 것인지 추적하려면 이런 귀속 시스템이 필요합니다.
      ja: AIが作成したコードを追跡するオープン標準を紹介します。シークレット漏洩コードがAI生成かどうか追跡するにはこのような帰属システムが必要です。
      en: Introduces an open standard for tracking AI-written code. Attribution systems like this are essential for tracing whether leaked secrets came from AI-generated code.
      zh: 介绍了追踪AI编写代码的开放标准。要追溯泄露密钥是否来自AI生成的代码，这类归属系统不可或缺。
---

先週GitGuardianが発表した *State of Secrets Sprawl 2026* レポートを読んでいて、手が止まりました。GitHubで1年間に検出されたシークレットが**2,900万件**。しかし本当の問題はその次の一文でした。AIコーディングツールを使用しているリポジトリのシークレット漏洩率が、GitHub全体平均の**2倍**だというのです。

私は毎日Claude CodeとMCPサーバーを接続して作業しています。正直に言うと、このレポートを読んだ後、まず自分の`.claude/`ディレクトリとMCP設定ファイルを点検しました。結果的に問題はありませんでしたが、「なぜAIコーディングツールがシークレット漏洩を加速させるのか」という構造的な理由を理解することができました。

## AIコーディングツールがシークレット漏洩を2倍にする理由

一般的な開発でシークレットが漏洩する経路は比較的シンプルです。`.env`ファイルを`.gitignore`に入れ忘れたり、テストコードにAPIキーをハードコーディングしたり。しかしAIコーディングエージェントを使い始めると、漏洩経路が急激に増えます。

**1つ目の問題はコンテキストインジェクションです。** AIエージェントに「このAPIを呼び出して」とリクエストすると、エージェントが生成するコードに実際のAPIキーが含まれることがあります。特にエージェントが環境変数の代わりに値を直接インラインで埋め込むパターンが意外と多いです。人間が書く場合は「これは環境変数に切り出さないと」という習慣がありますが、AIは「動くコード」を最優先で生成します。

**2つ目の問題はもっと深刻です。MCP設定ファイルです。** Claude Code、Cursor、WindsurfなどのツールがMCPサーバーに接続する際に使う設定ファイルには、データベース接続情報、APIキー、OAuthトークンが平文で入っています。GitGuardianによると、公開リポジトリのMCP設定ファイルだけで**24,008件**のユニークなシークレットが発見されました。

```json
// このような設定ファイルがそのままコミットされるケースが数万件
{
  "mcpServers": {
    "database": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://admin:P@ssw0rd123@prod-db.example.com:5432/main"]
    },
    "slack": {
      "command": "mcp-server-slack",
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token-here"
      }
    }
  }
}
```

このファイルが`.gitignore`に入っていなければ、`git add -A`一発でプロダクションDBのクレデンシャルがGitHubにアップロードされます。AIコーディングエージェントが「このファイルもコミットしますか？」と聞いてきたら、ほとんどの人が「はい」と答えるのが現実です。

## 実際に点検してみました

自分の作業環境を基準にチェックした項目を共有します。

**1. MCP設定ファイルの場所を確認**

```bash
# Claude CodeのMCP設定ファイルの場所
ls -la ~/.claude/mcp_settings.json 2>/dev/null
ls -la ./.claude/settings.local.json 2>/dev/null

# プロジェクト内のMCP関連設定を検索
grep -r "mcpServers" . --include="*.json" -l
```

**2. .gitignoreの点検**

```bash
# MCP設定ファイルがgitignoreに含まれているか確認
grep -E "mcp|settings\.local" .gitignore
```

私の場合、`.claude/settings.local.json`は`.gitignore`に入っていましたが、プロジェクト別のMCP設定が別のJSONファイルとして存在するケースがあり、そのファイルは含まれていませんでした。これはすぐに追加しました。

**3. Gitヒストリーで既に漏洩したシークレットを検索**

```bash
# 過去のコミットにシークレットが含まれていたか確認
git log --all --diff-filter=A -- '*.json' | head -20
git log -p --all -S 'SLACK_BOT_TOKEN' -- '*.json'
git log -p --all -S 'postgresql://' -- '*.json'
```

ここで重要なのは、`.gitignore`に追加しても、既にコミットされたファイルはヒストリーに残っているということです。一度でもシークレットがコミットされたなら、キーをローテーションするのが唯一の解決策です。

## GitHub MCPサーバーのシークレットスキャニング

3月17日、GitHubがMCPサーバーにシークレットスキャニング機能をパブリックプレビューとして追加しました。AIコーディングエージェントがGitHub MCPサーバーを通じて作業する際、プッシュ前に自動でシークレットを検出してくれる機能です。

設定はGitHubリポジトリのSettings > Code security and analysisで「Secret scanning」と「Push protection」を有効化すれば完了です。既に有効化しているリポジトリであれば、MCPサーバーを通じた作業にも自動適用されます。

個人的にこの機能に期待している理由は、AIエージェントが生成するコードのシークレット漏洩を**エージェントワークフロー内で**キャッチしてくれる点です。人間がレビューする前にシステムが先に検出してくれるので、「エージェントがコミットしたコードを自分がレビューする」という現実的なワークフローにうまくフィットします。

## しかしこれだけでは不十分です

正直に言えば、GitHubのシークレットスキャニングは**既知のパターンのシークレット**しか検出しません。カスタム内部APIキーや非標準フォーマットのトークンは見逃す可能性があります。そしてGitHub以外のリポジトリ（GitLab、Bitbucket、セルフホスティング）を使っているチームには適用されません。

もう1つ、MCP設定ファイルのクレデンシャル管理のための標準がまだ存在しません。AnthropicやMCPコミュニティから「シークレットはこのように管理してください」という公式ガイドラインがなく、各自で環境変数に切り出したり、シークレットマネージャーを接続したりしている状況です。

私はMCPエコシステムが成熟するためには、設定ファイルのクレデンシャル参照標準が必要だと考えています。Docker Composeの`secrets:`ブロックや、Kubernetesの`secretKeyRef`のようなパターンをMCP設定にも導入すべきです。現在のMCP設定で`env:`ブロックを使って環境変数を参照することまでは可能ですが、シークレットマネージャー（HashiCorp Vault、AWS Secrets Managerなど）との統合は各MCPサーバーの実装ごとにバラバラです。

## チェックリスト：AIコーディングエージェントのシークレットセキュリティ

私が実際に適用している項目です。

- `.claude/settings.local.json`が`.gitignore`に入っているか確認
- MCP設定ファイルに平文クレデンシャルの代わりに環境変数参照を使用（`"env": {"KEY": "環境変数名"}`）
- GitHub Push Protectionの有効化（Settings > Code security）
- `git add -A`の代わりに`git add <ファイル名>`で明示的にステージング
- AIエージェントが生成したコードにハードコーディングされたシークレットがないかコミット前に確認
- 四半期ごとのGitヒストリーのシークレットスキャン（gitleaksまたはtruffleHogを使用）
- MCPサーバー接続に使用するトークンへの最小権限の原則の適用

## まとめ

2,900万件という数字は恐ろしいですが、実際のところほとんどのシークレット漏洩は複雑な攻撃ではなく、「うっかりコミットしてしまった」レベルのミスから発生しています。AIコーディングエージェントがこのミスの頻度を高めているというのが、今回のレポートの核心です。

私にとって最も響いた教訓は、AIエージェントを使うとコード生成の速度が上がる分、**セキュリティレビューの速度も追いつかなければならない**ということです。エージェントが10秒で作ったコードを30秒も見ずにコミットする習慣が最も危険です。少なくとも`git diff`は一度目を通しましょう。特に`.json`、`.yaml`、`.env`拡張子のファイルがステージングに含まれている場合は。
