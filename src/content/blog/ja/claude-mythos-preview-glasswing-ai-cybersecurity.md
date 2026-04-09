---
title: Claude Mythos Preview — AIが「優秀すぎて」公開できないって本当か
description: >-
  AnthropicがSWE-bench 93.9%を達成したClaude Mythos Previewを一般公開しないと決めた。
  27年前のOpenBSD脆弱性まで発見したこのモデルは、Project Glasswingを通じて12社にのみ提供される。
  これは本当の責任感か、それとも巧みなマーケティングか。
pubDate: '2026-04-09'
heroImage: ../../../assets/blog/claude-mythos-preview-glasswing-ai-cybersecurity-hero.jpg
tags:
  - anthropic
  - claude-mythos
  - cybersecurity
  - ai-governance
  - project-glasswing
relatedPosts:
  - slug: claude-firefox-22-cves-ai-security-audit
    score: 0.95
    reason:
      ko: Mythos 이전에 Claude가 Firefox에서 22개 CVE를 찾아낸 사례다. Mythos의 보안 감사 능력이 어디서 출발했는지 맥락을 잡을 수 있다.
      ja: Mythos以前にClaudeがFirefoxで22件のCVEを発見した事例です。Mythosのセキュリティ監査能力がどこから始まったのか文脈を掴めます。
      en: Before Mythos, Claude found 22 CVEs in Firefox. This gives context for where Mythos's security audit capabilities originated.
      zh: 在Mythos之前，Claude在Firefox中发现了22个CVE。这为Mythos安全审计能力的起源提供了背景。
  - slug: mcp-security-crisis-30-cves-enterprise-hardening
    score: 0.88
    reason:
      ko: MCP 프로토콜에서 발견된 30개 CVE와 엔터프라이즈 하드닝 전략. Mythos급 모델이 등장하면 MCP 보안이 더 중요해진다.
      ja: MCPプロトコルで発見された30件のCVEとエンタープライズハードニング戦略。Mythos級モデルの登場でMCPセキュリティの重要性が増します。
      en: 30 CVEs found in the MCP protocol and enterprise hardening strategies. Mythos-level models make MCP security even more critical.
      zh: MCP协议中发现的30个CVE及企业加固策略。Mythos级别模型的出现使MCP安全更加重要。
  - slug: anthropic-pentagon-ai-governance-cto-lessons
    score: 0.87
    reason:
      ko: Anthropic의 펜타곤 AI 거버넌스 사례를 다뤘다. Glasswing의 제한적 공개 결정이 같은 맥락 위에 있다.
      ja: Anthropicのペンタゴン向けAIガバナンス事例を扱っています。Glasswingの制限公開の決定が同じ文脈上にあります。
      en: Covers Anthropic's Pentagon AI governance case. The Glasswing restricted release decision sits in the same governance context.
      zh: 介绍了Anthropic的五角大楼AI治理案例。Glasswing的限制发布决策处于相同的治理背景中。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.84
    reason:
      ko: AI 모델의 IP 보호와 증류 공격 방어 전략. Mythos처럼 강력한 모델의 접근 제한이 왜 필요한지 다른 각도에서 보여준다.
      ja: AIモデルのIP保護と蒸留攻撃防御戦略。Mythosのような強力なモデルへのアクセス制限がなぜ必要かを別の角度から見せます。
      en: AI model IP protection and distillation attack defense. Shows from another angle why restricting access to powerful models like Mythos matters.
      zh: AI模型的IP保护和蒸馏攻击防御策略。从另一个角度展示了为什么限制Mythos等强大模型的访问是必要的。
  - slug: claude-sonnet-46-release
    score: 0.82
    reason:
      ko: Claude Sonnet 4.6 출시 분석. Mythos와 같은 Anthropic 모델 라인업에서 어떤 위치인지 비교할 수 있다.
      ja: Claude Sonnet 4.6のリリース分析。Mythosと同じAnthropicモデルラインナップにおける位置を比較できます。
      en: Analysis of the Claude Sonnet 4.6 release. Compare where it sits in the same Anthropic model lineup as Mythos.
      zh: Claude Sonnet 4.6发布分析。可以比较它在与Mythos相同的Anthropic模型产品线中的定位。
---

4月7日、AnthropicがClaude Mythos Previewを発表した。SWE-bench Verified 93.9%。USAMO 2026で97.6%。すべての主要ベンチマークでGPT-5.4を超えた。

しかし、このモデルを一般公開しないという。

理由は「サイバーセキュリティ能力が強力すぎる」から。すべての主要OSとWebブラウザで数千のゼロデイ脆弱性を自動的に発見したためだという。OpenBSDに27年間潜んでいたリモートクラッシュバグ、FFmpegで自動化ツールが500万回テストしても見つけられなかった16年前のバグ、Linuxカーネルの権限昇格エクスプロイトチェーンまで。

僕はこの発表を見て、2つの感想が同時に浮かんだ。「すごいな」と「話が出来すぎてないか？」だ。

## Project Glasswingという名前

AnthropicはMythos PreviewをProject Glasswingというプログラムを通じて12社にのみ提供する。Amazon、Apple、Google、Microsoft、Nvidia ── 名前だけでビッグテックのオールスターだ。Palo Alto Networks、CrowdStrike、Cloudflare、Cisco、Broadcomといったセキュリティ企業も含まれている。

1億ドル規模の利用クレジットを提供し、「防御的サイバーセキュリティ用途のみ」という条件を付けた。

Glasswingは透明な翅を持つ蝶の一種だ。「透明性を持って運営する」という意味を込めたのだろうが、正直ネーミングセンスがいいと思った。テック企業のブランディング力は本当に学ぶべきところが多い。

## ベンチマークを分解してみると

Mythos Previewの数字は確かに印象的だ。

- **SWE-bench Verified**: 93.9%（Opus 4.6は80.8%、GPT-5.4はおよそ73%）
- **SWE-bench Pro**: 77.8%
- **USAMO 2026**: 97.6%（Opus 4.6 42.3%、GPT-5.4 95.2%）
- **GPQA Diamond**: GPT-5.4比 +1.7pt
- **HLE with tools**: GPT-5.4比 +12.6pt

Opus 4.6からMythosへの13ポイントのジャンプは、一世代の中では出にくい跳躍幅だ。アーキテクチャレベルで何かが変わった可能性が高い。

ただ、僕が注目しているのはベンチマークの数字より「自律的に脆弱性を発見し、エクスプロイトまで開発した」という部分だ。Anthropicのレッドチームレポートによると、テスト中にモデルが予期しない行動を見せたという。隔離環境を迂回したり、指示なしにエクスプロイトを自律的に実演したケースもあったそうだ。

これはベンチマークスコアとは次元の異なる話だ。

## 「公開しない」の本当の意味

ここで少し批判的に見るべき点がある。

Anthropicは「危険だから公開しない」と言ったが、実際には12社のビッグテックに1億ドルのクレジットと共に配布している。これは「公開しない」のではなく「選択的に公開している」のだ。受け取る側は世界で最もリソースが豊富な企業であり、クレジットまでもらうのだから、事実上の無料体験マーケティングに近い。

これが悪い判断だとは思わない。むしろ現実的な判断だと思う。ただ、「責任あるAI企業」というフレーミングがやや過剰だということだ。セキュリティ企業12社に1億ドル分のクレジットをばらまくのは、エンタープライズ市場攻略の王道でもあるのだから。

Simon Willisonは[自身のブログ](https://simonwillison.net/2026/Apr/7/project-glasswing/)で「制限的な公開は必要に見える」と評価しており、僕もその判断自体には同意する。問題は、こうした決定の基準がAnthropic一社にあるという点だ。

## Glasswingパラドックス

Picus Securityがこれをうまく指摘した。[「すべてを壊せるものは、すべてを直すものでもある。」](https://www.picussecurity.com/resource/blog/anthropics-project-glasswing-paradox)

Mythosが発見した脆弱性は本物だ。27年前のOpenBSDバグが今まで生き残っていたということは、既存のセキュリティ監査体制が見逃していたということだ。そしてこのようなバグをAIが自動で見つけられるなら、攻撃者側でも同様の能力を持つモデルを作るのは時間の問題に過ぎない。

だからAnthropicの選択肢は実質2つしかなかったと思う：

1. 公開して全員が防御ツールとして使えるようにするが、攻撃にも使われるリスクを受け入れる
2. 制限公開して防御側に先に時間を与える

Anthropicは2番を選んだ。合理的な選択だが、「防御者」がビッグテック12社だという前提がある。中小企業やオープンソースプロジェクトのセキュリティはこの構図から抜け落ちている。

## この流れがどこへ向かうのか

ClaudeがFirefoxで22件のCVEを発見したのは数ヶ月前だ。あの時も「AIがセキュリティ監査を変える」という話が出たが、Mythosはそのレベルを完全に別の次元に引き上げた。

個人的に期待しているのは、このような能力が結局は民主化されるしかないという点だ。今はProject Glasswing参加企業しか使えないが、1〜2年以内に同等レベルのオープンソースセキュリティエージェントが出るだろうと見ている。すでにOpus 4.6のレベルでもかなりのセキュリティ監査が可能だから。

それまでにやるべきことは、自分のコードベースのセキュリティ負債を減らすことだ。27年前のバグがOpenBSDにもあったなら、自分のプロジェクトに無いと断言できる人はいない。

Anthropicが Mythosを「危険すぎて公開できない」とパッケージングしたのは巧みだ。しかし本当の問いは別にある。AIがこのレベルのセキュリティ能力を持った今、「誰がこのツールにアクセスできるか」がそのままセキュリティ格差を決定するということだ。

そしてそのアクセス権は今、1億ドルのクレジットと共に12社にだけ渡った。
