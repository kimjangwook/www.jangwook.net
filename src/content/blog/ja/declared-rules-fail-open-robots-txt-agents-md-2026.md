---
title: 'ルールが届かないとき処理は止まらず素通りする: robots.txtとAGENTS.mdの実測'
description: 'robots.txtの33セル中10セルで遮断意図のURLが通過し、AGENTS.mdは32KiBを超えると末尾の指示が6回中0回しか届かない。219回の実行はすべて終了コード0だった。宣言ファイルが壊れたとき例外は出ず、判定したパーサーの名前を先に確認してから遮断可否を読む必要がある。32KiB境界も測った。'
pubDate: '2026-08-17'
heroImage: '../../../assets/blog/declared-rules-fail-open-robots-txt-agents-md-2026/hero.png'
tags:
  - robots.txt
  - AGENTS.md
  - CLAUDE.md
  - Web標準
  - AIエージェント
faq:
  - question: 'robots.txtに書いたDisallowが効かないのはなぜですか。'
    answer: 'パーサーの実装差や仕様上のルールが原因になります。たとえばurllib.robotparserは最長一致やワイルドカードを処理せず、ファイル内で先に出てきた行をそのまま返します。また、GPTBotなどの専用グループを作ってCrawl-delayだけを記述すると、RFC 9309の仕様によって全域のDisallowが結合されず、そのボットに対して全URLが許可されます。'
  - question: 'AGENTS.mdの指示をエージェントが無視するのはサイズが原因ですか。'
    answer: 'サイズの上限による切り捨てが原因の一つです。Codexはproject_doc_max_bytes（デフォルト32 KiB）に達した時点でファイルの読み込みを打ち切るため、34 KiBや48 KiBのファイルでは末尾に置いたカナリアトークンが6回中0回しか反映されませんでした。一方Claude CodeのCLAUDE.mdは全量読み込まれるものの、プロンプト後のユーザーメッセージとして渡されるため確率的な不遵守が発生します。'
  - question: '指示ファイルが切り捨てられたときにエラーで気づけますか。'
    answer: '気づけません。Codexもパーサーも例外を投げず終了コード0で処理を終えます。Codexの生ログ120件を検索しても切り捨ての警告文字列は0件でした。意図通り届いているか確かめるには、ファイルの末尾にカナリアトークンを仕込んで出力させる検証が必要です。'
  - question: 'robots.txtで確実にアクセスを遮断するにはどうすればよいですか。'
    answer: 'robots.txtはクロールを控えてもらうための依頼プロトコルであって、アクセス制御の仕組みではありません。本当に保護すべきリソースは、認証やサーバーのレスポンスコードで直接遮断する必要があります。'
relatedPosts:
  - slug: ai-crawler-control-robots-txt-llms-txt-2026
    score: 0.75
    reason:
      ko: 크롤러 제어 선언 파일이 실제로 어떻게 해석되는지 다룬다는 점에서 직접 이어진다. 지난 글이 llms.txt와 robots.txt의 역할 분담을 보았다면, 이번 글은 그 선언이 파서와 에이전트 단계에서 조용히 무력화되는 메커니즘을 측정한다.
      ja: クローラー制御の宣言ファイルが実際にどう解釈されるかを扱う点で直接つながる。前稿がllms.txtとrobots.txtの役割分担を扱ったのに対し、本稿はその宣言がパーサーやエージェントの段階で静かに無力化される仕組みを測っている。
      en: Directly related in examining how crawler control files are actually parsed. While the previous post looked at role separation between llms.txt and robots.txt, this piece measures how those declarations fail open inside parsers and agents.
      zh: 直接承接爬虫控制声明文件如何被实际解析的主题。前文讨论llms.txt与robots.txt的分工，本文则实测这些声明在解析器和Agent层级如何被静默放行。
  - slug: agents-md-vs-claude-md-loading-measured-2026
    score: 0.72
    reason:
      ko: 에이전트 지시문 파일의 로딩 방식과 바이트 한계를 실측했다는 공통 기반을 공유한다. 이번 측정은 바이트 경계 절단과 확률적 불준수가 어떻게 robots.txt의 실패 패턴과 같은 구조를 갖는지 한 단계 더 파고든다.
      ja: エージェント指示ファイルの読み込み方式とバイト制限を実測した共通の土台を持つ。本稿では、バイト境界での切り捨てと確率的な不遵守が、いかにrobots.txtの失敗パターンと同じ構造を持つかまで掘り下げた。
      en: Shares the empirical base of measuring agent instruction loading mechanisms and byte limits. This post deepens the analysis to show how byte-boundary clipping and probabilistic non-compliance mirror the fail-open patterns of robots.txt.
      zh: 共享关于Agent指令文件加载机制与字节限制的实测基础。本文进一步深入，探讨字节截断与概率性不遵从如何与robots.txt呈现出相同的静默放行结构。
  - slug: robots-meta-head-body-parser-placement-2026
    score: 0.68
    reason:
      ko: 선언된 메타 규칙이 파서의 동작 방식에 의해 무시되거나 왜곡되는 현상을 다룬다. head-body 파서 배치 문제가 HTML 파서의 실패였다면, 이번 글은 robots.txt 파서와 LLM 지시문 로더의 실패를 다룬다.
      ja: 宣言されたメタ規則がパーサーの挙動によって無視・歪曲される現象を扱う。head-body配置がHTMLパーサーの特性による失敗だったとすれば、本稿はrobots.txtパーサーとLLM指示ローダーの特性による失敗を扱う。
      en: Examines how declared meta rules get bypassed or warped by parser mechanics. Where the head-body placement piece dealt with HTML parser quirks, this post explores failures in robots.txt parsers and LLM instruction loaders.
      zh: 探讨声明的元规则如何因解析器行为而被忽视或扭曲。如果说head-body放置问题是HTML解析器的特性所致，本文探讨的则是robots.txt解析器与LLM指令加载器的静默失效。
---

```bash
# 同じ2行、順序だけを入れ替える。urllibの答えが反転する
cd "$(mktemp -d)"
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /p' 'Allow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
printf '%s\n' 'User-agent: GPTBot' 'Allow: /p' 'Disallow: /p' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/page.html") else "DISALLOWED")'
```

`Disallow: /p` のあとに `Allow: /p` を置くと `urllib.robotparser` は `DISALLOWED` を返す。順序だけを入れ替えると `ALLOWED` に変わる。規則の文字列は同じだ。`protego` と `robots-parser` はどちらの順序でも `ALLOWED` のままだった。

この食い違いから、`AGENTS.md` や `CLAUDE.md` も同じ壊れ方をすると疑った。3パーサーに11シナリオ、CLI に20通りを試した。219回は終了コード0で、警告なく指示が消えた。

## 専用グループに Crawl-delay を書くと全体の Disallow が消える

```text
User-agent: *
Disallow: /

User-agent: GPTBot
Crawl-delay: 10
```

全体を拒絶し、GPTBot だけは10秒空ける意図だ。しかし3パーサーは `https://example.test/docs/page.html` に `ALLOWED` を返し、GPTBot の遮断が消えた。

> "If no match is found amongst the rules in a group for a matching user-agent or there are no rules in the group, the URI is allowed."
> — [RFC 9309 Section 2.2.2](https://www.rfc-editor.org/rfc/rfc9309.txt)

> "User agent specific groups and global groups (*) are not combined."
> — [Robots.txt Specifications](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt)

特定の User-agent の評価は専用グループだけで完結する。グローバルグループは引き継がれず、`Disallow` がなければ全 URL にアクセスできる。どのパーサーでも変わらない仕様だ。[robots.txtとllms.txtでクローラー制御を分けた記録](/ja/blog/ja/ai-crawler-control-robots-txt-llms-txt-2026/)がある。宣言を分けても、専用グループが全面許可ならその宣言は届かない。

```bash
# 専用グループに Crawl-delay だけを書くと上の全体 Disallow が消える。3パーサーが満場一致で ALLOWED
printf '%s\n' 'User-agent: *' 'Disallow: /' '' 'User-agent: GPTBot' 'Crawl-delay: 10' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/docs/page.html") else "DISALLOWED")'
```

## 3つのパーサーで11シナリオを測った

3つのパーサーに11シナリオを用意し、各3回実行した。総セル数33、総実行回数99回で、結果は一致した。分散0だ。

| パーサー | 仕様一致 | 不一致の方向 |
|---|---|---|
| protego (0.6.2) | 10/11 | 1セルが ALLOWED |
| robots-parser (3.0.1) | 9/11 | 1セルが ALLOWED、1セルが UNDEFINED |
| urllib.robotparser (CPython 3.12.8) | 5/11 | 4セルが ALLOWED、2セルが DISALLOWED |

33セル中10セルで遮断意図の URL が `ALLOWED` または `UNDEFINED` を返した。うち3セル（empty-specific-group）は仕様通りで、仕様一致は24セルだった。回答が一致したシナリオは4つだけだ。

urllib は最長一致（RFC 9309 §2.2.2 "The most specific match found MUST be used"）、末尾の `$`、ワイルドカード `*` を解釈しない。内部の `RuleLine` は前方一致だけを行い、最初に合致した行を返す。ルール集合が同じで順序だけを替えた tie-disallow-first（0/3）と tie-allow-first（3/3）で答えが反転したことが裏付けになる。

```bash
# ワイルドカードと $ を文字通りに解釈するか確認する
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /*.json$' > robots.txt
python3 -c 'import urllib.robotparser as rp; p=rp.RobotFileParser(); p.parse(open("robots.txt").read().splitlines()); print("ALLOWED" if p.can_fetch("GPTBot","https://example.test/api/data.json") else "DISALLOWED")'
python3 -m venv venv && ./venv/bin/pip install -q protego
./venv/bin/python -c 'from protego import Protego; r=Protego.parse(open("robots.txt").read()); print("ALLOWED" if r.can_fetch("https://example.test/api/data.json","GPTBot") else "DISALLOWED")'
```

```bash
# 相対パスを渡すと robots-parser は undefined を返す。falsy として読むと遮断と誤認する
npm init -y >/dev/null && npm install robots-parser >/dev/null
printf '%s\n' 'User-agent: GPTBot' 'Disallow: /blocked/' > robots.txt
node -e 'const fs=require("fs"),R=require("robots-parser");const r=R("https://example.test/robots.txt",fs.readFileSync("robots.txt","utf8"));console.log(r.isAllowed("/blocked/x.html","GPTBot"), r.isAllowed("https://example.test/blocked/x.html","GPTBot"))'
```

`isAllowed` に相対パスを渡すと、真偽値ではなく `undefined` を返す。README に明記された挙動だ。

> "This will return `undefined` if the URL isn't valid for this robots.txt."
> — [robots-parser README](https://github.com/samclarke/robots-parser/blob/master/README.md)

受け取る側が `if (!isAllowed(...))` と判定すると、無効なパスを「遮断されている」と誤認する。

## 32KB を超えた指示ファイルは後ろから静かに消える

AI エージェントの読み込みでも同じ構図が起きる。OpenAI Codex (0.147.0, gpt-5.6-luna, effort low) と Claude Code (2.1.233, sonnet) にサイズの異なる指示ファイルを置き、先頭と末尾のカナリアを20セル、各6回で試した。固有文字列だけを返答させた。

```bash
# AGENTS.md の末尾にカナリアを付与してサイズ上限の上と下を比較する
cd "$(mktemp -d)"
yes 'Repo convention filler line used only to grow this document to a target byte size.' | head -c 34000 > body.txt
{ cat body.txt; printf '\nCANARY TOKEN: ZQCX34T\n'; } > AGENTS.md; rm body.txt; wc -c AGENTS.md
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' --skip-git-repo-check
codex exec 'Reply with only the canary token from your instructions and nothing else. If your instructions contain no canary token, reply exactly MISS. Do not read files, do not run commands, do not use any tools.' -c project_doc_max_bytes=262144 --skip-git-repo-check
```

Codex はルートから降りながら `AGENTS.md` を結合し、累積バイト数が `project_doc_max_bytes`（デフォルト 32,768 バイト）に達すると読み込みを打ち切る。

> "Codex skips empty files and stops adding files once the combined size reaches the limit defined by `project_doc_max_bytes` (32 KiB by default)."
> — [Codex Agent Configuration](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

> "Instructions truncated: Raise `project_doc_max_bytes` or split large files across nested directories to keep critical guidance intact."
> — [Codex Agent Configuration](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

31,023 バイトでは末尾が6/6で生還した。34,022・49,022 バイトでは先頭が6/6で生還した。一方、34,023・49,023 バイトでは末尾が0/6で消滅した。

ファイルごと破棄なら先頭も消える。消えたのは後ろ側で、切り捨てを決めるのは全体サイズではなく読み込み順序と累積バイト数だ。[同じリポジトリで2つのCLIがどのファイルを読むかを測った前編](/ja/blog/ja/agents-md-vs-claude-md-loading-measured-2026/)はロードの有無だった。本稿はロードされたファイルのどこまでが残るかを測る。

`project_doc_max_bytes` を 262,144 にすると、34k と48kの末尾カナリアは0/6から6/6へ復帰した。

## Claude の指示ファイルには境界がなく、確率がある

> "This limit applies only to `MEMORY.md`. CLAUDE.md files are loaded in full regardless of length, though shorter files produce better adherence."
> — [Claude Code Memory](https://code.claude.com/docs/en/memory)

31k は先頭2/6、末尾4/6、34kは先頭3/6、末尾1/6、48kは先頭0/6、末尾2/6だった。

> "CLAUDE.md content is delivered as a user message after the system prompt, not as part of the system prompt itself. Claude reads it and tries to follow it, but there's no guarantee of strict compliance, especially for vague or conflicting instructions."
> — [Claude Code Memory](https://code.claude.com/docs/en/memory)

システムプロンプトではなく後のユーザーメッセージとして注入される。完全にロードしても指示を拾う保証はなく、ロードされた情報への注意が分散する。

Codex 側の12セルは6/6か0/6、Claude 側の6セルはすべて中間値だった。

両 CLI が読まない 49,024 バイトの `NOTES.md` では、カナリアは両方とも0/6だった。モデルがシェルコマンドでファイルを漁った形跡はない。

## 失敗の通知チャンネルが存在しない

パーサー不一致、全域拒絶の消失、バイト切り捨て、指示埋没に共通する問題は、**宣言側と執行側が分離し、その間にエラー通知のチャンネルがない**ことだ。

ルールが届かなくても読み違えても、処理系は警告なしに動く。Codex のログ120件に `truncat` はなく、ログ出力のオプション（`codex -c log_dir=...`）なしでは切り落とされたことも分からない。219回は終了コード0だった。[robots metaがheadに書いてもbodyへ落ちる条件](/ja/blog/ja/robots-meta-head-body-parser-placement-2026/)と同じ層だ。パーサーが宣言を別の場所に置けば、規則はないのと同じになる。

障害時に止める仕組みをフェイルクローズ（fail-closed）、異常時も素通しする仕組みをフェイルオープン（fail-open）という。

ルールを書くと、開発者は「これで安全柵を張った」と感じる。しかし実行系は解釈できないとき、安全側（拒絶や停止）ではなく無防備側（全許可や指示無視）へ倒れる。

## 設定で直る部分と、設定では直らない構造

この問題を「robots.txt はお願いで、AGENTS.md の切り捨ては設定変更で済む」と片付ける立場もある。指摘は部分的に正しい。

Codex の `project_doc_max_bytes` を引き上げれば、34k や48kの末尾指示は6/6で復帰する。`urllib` を `protego` に替えれば、食い違った6セルのうち4セルは仕様通りになる。設定で解消できる層はある。

だが、`Crawl-delay` だけの専用グループはパーサーを変えても全開放になる。RFC 9309 の仕様だからだ。Claude Code も全量ロードしても指示を見落とし、上限もない。ルールが抜けた事実を伝える経路もなく、検証が必要になる。

## 明日からの運用で変えること

1. **robots.txt による遮断を過信しない。**
保護が必要なエンドポイントは、robots.txt ではなく HTTP レスポンス（認証ヘッダーやステータスコード）で遮断する。robots.txt は境界防御ではない。
2. **専用グループには必ず Disallow を再掲する。**
   特定ボット向けブロックには `Disallow` を明記する。Crawl-delay やコメントだけなら全開放になる。
3. **検証スクリプトのパーサーを確認する。**
   robots.txt のテストに `urllib.robotparser` を使わない。一致率は5/11だった。`robots-parser` は相対パスの `undefined` を前提に判定する。
4. **エージェントの指示ファイルにはカナリアを仕込む。**
   指示ファイルが 32 KiB を超える場合は分割するか上限を引き上げる。変更後は末尾の固有トークンを返答できるか確認する。設定変更と到達は別だ。

## 測定の範囲と限界

この実験が示すのは、テストしたパーサーと CLI が手元でそう答えたことだけだ。

GPTBot や ClaudeBot が使うパーサーは公開されていない。Google の公式 C++ 参照実装（`robotstxt`）とも比較していない。

測定環境は macOS (26.5.2 / darwin 25.5.0)、計測日は 2026年8月17日。バージョンは `urllib` (CPython 3.12.8)、`protego` (0.6.2)、`robots-parser` (3.0.1)、`codex` (0.147.0, gpt-5.6-luna, effort low)、`claude` (2.1.233, sonnet) だ。

Claude 側はセルあたり6回の標本で、モデルやコンテキストで変動する。切断境界がなくても、指示の到達は保証されない。

ルールは壁ではない。抜け落ちる場所を実測しない限り、制御はない。
