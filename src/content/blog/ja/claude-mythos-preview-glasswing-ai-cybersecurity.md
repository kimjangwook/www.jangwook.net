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
  - slug: devstral-qwen3-coder-small-models
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: gemini-31-pro-release
    score: 0.93
    reason:
      ko: AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in AI/ML with comparable difficulty.
      zh: 在AI/ML领域涵盖类似主题，难度相当。
  - slug: gpt4o-retirement-model-dependency-risk
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: nvidia-llm-inference-cost-reduction
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
  - slug: ai-distillation-attacks-enterprise-defense
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, AI/ML, 아키텍처 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、AI/ML、アーキテクチャのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through AI/ML,
        architecture topics.
      zh: 适合作为下一步学习资源，通过AI/ML、架构主题进行连接。
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

Mythos Previewの数字は確かに印象的だ。同時期に出た[Claude Codeソースコード流出分析](/ja/blog/ja/claude-code-source-leak-analysis)を読むと、このパフォーマンスの跳躍の背景がより理解しやすくなる。

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

AIシステムからの意図しない情報露出リスクはすでに現実の脅威だ。[AIディスティレーション攻撃とエンタープライズ防御戦略](/ja/blog/ja/ai-distillation-attacks-enterprise-defense)でそのリスクを詳しく扱っている。だからAnthropicの選択肢は実質2つしかなかったと思う：

1. 公開して全員が防御ツールとして使えるようにするが、攻撃にも使われるリスクを受け入れる
2. 制限公開して防御側に先に時間を与える

Anthropicは2番を選んだ。合理的な選択だが、「防御者」がビッグテック12社だという前提がある。中小企業やオープンソースプロジェクトのセキュリティはこの構図から抜け落ちている。

## この流れがどこへ向かうのか

ClaudeがFirefoxで22件のCVEを発見したのは数ヶ月前だ。あの時も「AIがセキュリティ監査を変える」という話が出たが、Mythosはそのレベルを完全に別の次元に引き上げた。

個人的に期待しているのは、このような能力が結局は民主化されるしかないという点だ。今はProject Glasswing参加企業しか使えないが、1〜2年以内に同等レベルのオープンソースセキュリティエージェントが出るだろうと見ている。すでにOpus 4.6のレベルでもかなりのセキュリティ監査が可能だから。AIサプライチェーン攻撃がどう機能するか具体的に知るには、[LiteLLMサプライチェーン攻撃の分析](/ja/blog/ja/litellm-supply-chain-attack-ai-dependency-security)が参考になる。

それまでにやるべきことは、自分のコードベースのセキュリティ負債を減らすことだ。27年前のバグがOpenBSDにもあったなら、自分のプロジェクトに無いと断言できる人はいない。

Anthropicが Mythosを「危険すぎて公開できない」とパッケージングしたのは巧みだ。しかし本当の問いは別にある。AIがこのレベルのセキュリティ能力を持った今、「誰がこのツールにアクセスできるか」がそのままセキュリティ格差を決定するということだ。

そしてそのアクセス権は今、1億ドルのクレジットと共に12社にだけ渡った。
