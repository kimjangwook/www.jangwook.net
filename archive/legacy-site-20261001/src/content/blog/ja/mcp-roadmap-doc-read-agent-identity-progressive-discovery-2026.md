---
title: "MCPのロードマップを運用計画として読み直したら、いま作るべきものが変わった"
description: "MCPのロードマップは納期表ではない。カタログの経済性、ドキュメントの表面、そして差し替え可能なアイデンティティ境界が、次の仕様が着地する前に技術リーダーが動かすべき範囲を決める。"
pubDate: 2026-08-25
heroImage: '../../../assets/blog/mcp-roadmap-doc-read-agent-identity-progressive-discovery-2026/hero.png'
tags:
  - MCP
  - AIエージェント
  - エンジニアリングリーダーシップ
  - アーキテクチャ
  - プロトコル戦略
relatedPosts:
  - slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
    score: 0.9
    reason:
      ko: MCP 실행 경로를 선택할 때 비용 구조와 운영 통제권을 함께 판단하는 기준을 다룹니다.
      ja: MCPの実行経路を選ぶ際に、コスト構造と運用上の制御権をどう評価するかを解説します。
      en: It examines how to evaluate cost structure and operational control when choosing an MCP execution path.
      zh: 它讨论了在选择 MCP 执行路径时，如何同时评估成本结构与运营控制权。
  - slug: mcp-vs-a2a-vs-open-responses-agent-protocol-comparison-2026
    score: 0.85
    reason:
      ko: MCP, A2A, Open Responses를 같은 역할로 오해하지 않기 위한 프로토콜 경계와 선택 기준을 설명합니다.
      ja: MCP、A2A、Open Responsesを同じ役割のものとして扱わないための、プロトコル境界と選定基準を説明します。
      en: It clarifies protocol boundaries and selection criteria so MCP, A2A, and Open Responses are not treated as interchangeable.
      zh: 它说明了协议边界与选择标准，避免将 MCP、A2A 和 Open Responses 误认为可以互换。
  - slug: context-engineering-production-ai-agents
    score: 0.8
    reason:
      ko: 프로덕션 에이전트에서 컨텍스트를 예산과 운영 자산으로 다루는 방법을 다룹니다.
      ja: 本番エージェントにおいて、コンテキストを予算と運用資産として扱う方法を解説します。
      en: It explains how to manage context as both a budget and an operational asset in production agents.
      zh: 它解释了如何在生产级智能体中，将上下文视为预算和运营资产来管理。
---

MCPのロードマップを読んで、今四半期にチームが作るものが変わるのかを知りたかった。ロードマップと、リリース済みのスキーマ、公式ガイダンス、そして統制した条件でのカタログ読み込みの挙動を突き合わせた。結論ははっきりしている。自分たちが制御できるカタログのサイズとアイデンティティの境界には今すぐ手を入れるべきだが、仕様に到達していないロードマップ項目を納品計画の前提にしてはいけない。

この区別が効いてくるのは、AI連携が標準化プロセスの決着を待たずにコストとアクセス制御のリスクを積み上げていくからだ。カタログを計測し、制約をかけ、アイデンティティの実装は差し替えられる形にしておく。

## ロードマップは優先順位の地図であって、リリースの約束ではない

経営側が最初に踏む地雷は、プロトコルのロードマップをベンダーの出荷カレンダーのように読むことだ。

MCPのロードマップは、メンテナが今後どこに優先して力を割くつもりかを述べている。これは有益な情報だ。レビューの労力とワーキンググループ、そして将来の相互運用性がどこに集まるのかをアーキテクトに教えてくれる。だが、名前の挙がった機能が実装対象として使えるという意味ではないし、今の形のまま標準化を通り抜けるという保証でもない。

> This roadmap reflects current thinking rather than firm commitments. Priorities may shift, some items may be delivered differently than described or deferred, and work not listed here may still be included in the release.

> — [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)

この一文はCTOの運用モデルを変えるだけの重みを持っている。ロードマップの項目が置かれるべき場所は、技術ウォッチリストと標準化への参加計画、そしてケイパビリティのリスク台帳だ。コミット済みのプロダクト依存に自動的に昇格するものではない。

差はドキュメントの表面に現れる。`subscriptions/listen`、`nextCursor`、`structuredContent` はリリース済みスキーマという裏付けを持つ。Tasksは以前のコアスキーマに存在し、現行のコアからは消えたうえで、拡張を経由して再び取り込まれる道の上にいる。DPoP、ID-JAG、webhook、そして段階的ディスカバリは、確認した四つのスキーマ（2025-06-18、2025-11-25、2026-07-28、draft）のどこにも現れない。

同じ語彙がこの差を覆い隠す。ロードマップは全部に同じ見た目の重みを与えている。エンジニアリング計画のほうは、そうはいかない。

## カタログの読み込みを計測したら、コストはツール数に比例した

目の前にある運用上の問題は、エージェントのアイデンティティの話ほど華やかではない。だが請求はもう始まっている。

合成した200個のツールを20個ずつのページで公開するローカルMCPサーバーを立て、Claude 2.1.241を接続した。同一条件で三回走らせたところ、クライアントは毎回 `tools/list` を10回呼び、カーソルを `none` から `180` まで追い、62,708バイトを受け取った。ユーザーがまだ何も意味のある質問をしていない時点での数字だ。

ツール20個の基準線では、リスト呼び出しは1回、6,235バイトだった。20個から200個へ、カタログは10倍になり、転送バイトは10.06倍になった。

これはトークン課金のモデルではない。もっと手前の話で、タスク固有の仕事が始まる前にシステムへ入ってくるペイロードの実測値だ。実際のトークン消費とレイテンシへの影響は、クライアント、モデル、ツール定義の長さ、キャッシュの挙動、トランスポート経路で変わる。それでもアーキテクチャの向きはもう見えている。公開するツールが増えれば、初回のカタログペイロードも増える。

公式のクライアント向けガイダンスは、もっと大きなカタログ規模で同じ種類の問題を記述している。

> Once the tool definitions take up a significant part of the available context window, clients should switch to progressive discovery. We recommend that clients implement thresholds to determine when to switch:

> — [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)

経営の目で見たとき、単位経済性はモデルのトークンだけでは終わらない。無選別に大きいカタログは、プロンプトの検査工数、ツール選択の曖昧さ、リグレッションテストの範囲を押し上げる。そして、同じゲートウェイの後ろに置かれていたというだけの理由で、機微な操作が露出する確率も上げる。

統合は連携面を減らす。同時に、きれいなドメイン境界を初回ターンの肥大したペイロードに変えることもある。このトレードオフには、責任者と予算が要る。

## ページングは段階的ディスカバリにならない

ページングで解決済みだと言いたくなる。ならない。

`nextCursor` は2025-06-18のリリース済みスキーマから存在している。プロトコルは、結果セットの終端をどう認識し、ページングありとなしの両方の流れをどう支えるかをクライアントに伝える。だが、1ページで止まることを要求はしないし、次のページが関連するのか、高くつくのか、特権的なのか、後回しにして安全なのかも伝えない。

> Clients **SHOULD**: * Treat a missing `nextCursor` as the end of results * Support both paginated and non-paginated flows

> — [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)

計測したハーネスでは、クライアントはすべてのカーソルを追った。この挙動はページングの要求ではなく、クライアント側のポリシーだ。「まだ結果がある」としか言わないカーソルを渡されたなら、全件取得が保守的な選択になる。必要なツールが未取得のページに載っていないことを、クライアントは知りようがない。

だから段階的ディスカバリは、ページングに別名を付けたものではない。関連性のシグナルと、それに基づく判断ポリシーが要る。必要なツールを黙って到達不能にすることなく、狭い能力集合を要求できるだけの情報がクライアント側に届いていなければならない。

ロードマップはこの空白を認めている。

> **Progressive discovery**: Core Primitives WG. Clients learn a server's tools and resources as they need them instead of ingesting the full catalog up front, with a defined interaction with the caching work under [HTTP-Native Transport Unification and Hardening](#2-http-native-transport-unification-and-hardening).

> — [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)

プロトコルの設計は開いたままだ。事業側の問題は設計の決着を待たない。

## カタログのサイズをエンジニアリングの統制点に変える

社内MCPゲートウェイを運用するチームなら、私は三つのゲートを敷く。

ひとつ目。カタログのサイズをCIで管理する予算にする。ツール数、シリアライズしたツール定義のバイト数、`tools/list` の呼び出し回数、そして一接続あたりの累積レスポンスバイトを測る。合意した閾値を超えたサーバーには、明示的なアーキテクチャ判断を要求する。業務能力で分割するか、セッションから見えるツール集合を絞るか、追加の予算を正当化するか。

これは官僚主義ではない。放っておけばインシデントレビューの席で出てくる問いを、前倒しで議論させるための仕掛けだ。なぜエージェントはタスクと無関係な能力まで見えていたのか。なぜプラットフォームチームは、初回ターンのコンテキストコストを利用が広がった後にようやく知ったのか。

ふたつ目。社内ドキュメントでMCPの機能に触れるとき、その出典の表面を必ず隣に書かせる。`/specification/` 由来の機能と、`/docs/` の下のガイダンス、ワーキンググループの憲章、`/development/roadmap` では、エンジニアリング上の意味がまるで違う。この小さな記述ルールが、よくある失敗を止める。公式ドメインで読んだロードマップの一文が、いつのまにかプラットフォームの保証として設計に入り込む、あの失敗だ。

みっつ目。アイデンティティの取得と検証を、ひとつのアダプタ境界の後ろにまとめる。トークンの解釈、オーディエンスの選択、委譲のルール、認可の前提を、あらゆるツールハンドラにばら撒かない。この境界は、今は組織が持っているOAuthの体制をそのまま使いながら、将来のアイデンティティ標準を取り込む場所をひとつに保っておける。

こうした統制は、放っておけばサーバーごと、PRごと、そしてやがて例外申請ごとに処理されていく問題を、仕組みの側へ引き取る。

## いちばん強い反論は、カタログが小さいチームには当たっている

この反論は、普段受けているよりも丁寧に扱うに値する。

スキーマに存在しない項目こそ、壊すべき既存実装がないぶん最速で動きうる。もしチームが今から独自の段階的ディスカバリ規約を作れば、標準化が着地した瞬間にその仕事は捨てるものになる。MCPはこの種の進化のために実験的拡張の経路を用意している。早すぎる私製プロトコルは、移行工数と相互運用性の欠落、そして完成したという錯覚を生む。

ツールが数十個で、カタログのペイロードが小さいチームには、この指摘は正しい。私の基準線では20個のツールで6,235バイトだった。多くの環境ではこの量は雑音であり、ディスカバリ機構を設計し、運用し、文書化し、後で置き換える複雑さのほうがよほど高くつく。待つコストはほぼ無く、独自実装には書き直しのコストが実在する。

反論が崩れるのは、社内の統合がカタログを三桁へ押し上げたときだ。三桁のカタログはエンタープライズでは珍しくない。顧客データ、認可、業務ワークフロー、レポーティングと、別々だったシステムが、ガバナンスと再利用を約束する一つのエージェント向けゲートウェイの後ろに集められる。ゲートウェイはその総和の能力を露出する。

そこまで来ると「仕様を待つ」は中立の判断ではない。カタログのペイロードとツール選択面が線形に伸びていくことを受け入れる、という判断だ。

私の主張はMCPに対抗するプロトコルを作れという話ではない。ホストとゲートウェイの持ち主がすでに手にしている統制、つまり役割ごとのサーバー分割、ポリシーで制限したセッション単位のツール集合、そしてカタログ予算を使えということだ。将来のディスカバリのプリミティブが別の形で着地したとしても、これらは筋の通ったアーキテクチャ判断のまま残る。

## アイデンティティは、標準化される前に差し替え可能にしておく

ロードマップが示すアイデンティティの方向性は戦略的に重要だ。だが、新しい認証モデルをコードに焼き付ける理由にはまだならない。

> **DPoP**: Agent Identity WG (forming during this roadmap period). Finalize the specification for Demonstrating Proof of Possession (DPoP) and focus on getting widespread adoption.

> — [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)

アーキテクチャ上の信号は "forming during this roadmap period" という一句にある。変化に備えよという意味であって、目的地がすでに実装対象になっているふりをしろという意味ではない。

これがいちばん効いてくるのは、エージェントが委譲された権限でツールを呼ぶときと、下位エージェントを生成するときだ。この流れでは、システムは難しい問いに正確に答えなければならない。どの主体がその行為を始めたのか。いま動いているのはどのエージェントか。どのオーディエンスがそのトークンを受け取ってよいのか。委譲された権限は親より狭いのか。

その答えをツールのコードに直接埋め込んだプラットフォームは、将来すべてのサービスにまたがる移行問題を抱える。ひとつのアイデンティティアダプタの後ろに隔離したプラットフォームは、既存の認可基盤を使い続けながら、いずれ来る置き換えを統制されたひとつの継ぎ目に閉じ込められる。

この継ぎ目は投機的なエンジニアリングではなく、リスクの軽減策だ。標準が動いている間も認可の判断が検査可能で一貫したものであり続けることが、データの整合性を守る。

## 経営判断は、制御できる仕事と標準化リスクを切り分けること

CEOとCTOにとっての論点は、MCPが成熟するかどうかではない。自分たちのアーキテクチャがすでに生み出している問題を、外部の標準化が解決してくれると納品計画が暗黙に仮定していないか、という点だ。

カタログは今すぐ制御する。ツール数と定義ペイロードに、責任者のいる予算を付ける。ひとつのゲートウェイが特権的な操作の統治不能な在庫になる前に、能力とオーナーシップの境界でサーバーを割る。

アイデンティティは今すぐ差し替え前提で設計する。アダプタを一箇所に集め、既存の統制を保ち、リリース済みスキーマに痕跡のないロードマップ項目に収益の要となるワークフローを結び付けない。

自社の経済性とリスクに関わる領域では、ロードマップのプロセスそのものに参加する。ロードマップは、メンテナのレビュー時間が希少であり、優先領域の外にある作業は待ち行列が長く正当化のハードルも高いと明言している。大規模なプラットフォーム事業者にとって、これはガバナンスの信号だ。影響力は開かれているが、抽象的な要望ではなく具体的な運用の証拠を持って来たチームにだけ開かれている。

短期の立ち位置は迷わず決めていい。カタログの規律と差し替え可能なアイデンティティの継ぎ目は今すぐ実装し、段階的ディスカバリとエージェントのアイデンティティ標準は現在の依存ではなく将来の統合対象として扱う。

大きなカタログがホスト側の制限なしでも実クライアントのコンテキスト、レイテンシ、運用コストの範囲に収まると統制された計測が示したなら、私はこの立場を変える。

## 参考資料

1. [Roadmap](https://modelcontextprotocol.io/development/roadmap)
2. [Roadmap — Progressive discovery](https://modelcontextprotocol.io/development/roadmap)
3. [Roadmap — DPoP / Agent identity and delegation](https://modelcontextprotocol.io/development/roadmap)
4. [Roadmap — SEP Prioritization](https://modelcontextprotocol.io/development/roadmap)
5. [Client Best Practices (2026-07-28)](https://modelcontextprotocol.io/docs/2026-07-28/develop/clients/client-best-practices)
6. [Server Utilities — Pagination (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28/server/utilities/pagination)
7. [schema.json](https://github.com/modelcontextprotocol/modelcontextprotocol/tree/main/schema)
8. [The next generation of MCP](https://blog.cloudflare.com/mcp-v2/)
