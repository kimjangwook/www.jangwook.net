---
title: 'Deno 2 vs Bun 1.3 — 2026年Node.js代替ランタイム実践比較: TypeScript・速度・セキュリティ'
description: >-
  Deno 2.8.2とBun
  1.3.14を実際にインストールして、起動時間・HTTP処理量・npm互換性・セキュリティモデルを実測した。どちらが自分のプロジェクトに合うか、データを基に結論を出す。
pubDate: '2026-06-04'
heroImage: ../../../assets/blog/deno-2-vs-bun-nodejs-runtime-2026-comparison-hero.png
tags:
  - Deno
  - Bun
  - TypeScript
  - Node.js
  - ランタイム比較
relatedPosts:
  - slug: vitest-4-jest-migration-guide-2026
    score: 0.95
    reason:
      ko: '웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, DevOps with comparable
        difficulty.
      zh: 在Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: adsense-low-value-content-technical-fix
    score: 0.93
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
  - slug: bun-shell-scripting-practical-guide-2026
    score: 0.88
    reason:
      ko: '웹 개발, DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, DevOps with comparable
        difficulty.
      zh: 在Web开发、DevOps领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.87
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
  - slug: chrome-devtools-mcp-performance
    score: 0.87
    reason:
      ko: '다음 단계 학습으로 적합하며, 웹 개발, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、Web開発、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through web
        development, DevOps topics.
      zh: 适合作为下一步学习资源，通过Web开发、DevOps主题进行连接。
---

2026年半ば、JavaScriptのランタイム選択肢は事実上3つに絞られた。Node.js、Bun、Deno。正直に言えば、Node.jsにこだわる理由はどんどん薄れている。問題はBunとDenoのどちらを選ぶかだ。

この2つをずっと様子見してきた。Bunが「速い」のは知っていたし、Deno 2がNode.js互換性を大幅に改善したことも聞いていた。だが、実際に自分のMacで動かすまで、選択基準がはっきりしなかった。今回、Deno 2.8.2とBun 1.3.14を一時的なサンドボックスにインストールして、数字を取り出した。

## 2つのランタイム、一行まとめ

**Bun**はNode.jsエコシステムをそのまま引き継ぎながら、速度を劇的に上げることを目標にしている。既存の`package.json`、`node_modules`、npmワークフローがそのまま動く。移行コストが低い。

**Deno 2**は最初から設計し直したランタイムだ。セキュリティモデル、URLベースのimport、`npm:`指定子、JSR（JavaScript Registry）など、新しい慣習を提案する。Node.jsとの完全な後方互換を実現したが、哲学は異なる。

同じTypeScriptコードを実行する2つのツールだが、どこから来たかが根本的に違う。

## インストールから始める

```bash
# Bunのインストール
curl -fsSL https://bun.sh/install | bash
bun --version  # 1.3.14

# Denoのインストール
curl -fsSL https://deno.land/install.sh | sh
deno --version  # 2.8.2 (stable, aarch64-apple-darwin), TypeScript 6.0.3
```

Bunは`~/.bun/bin/bun`一つで済む。ランタイム、パッケージマネージャー、バンドラー、テストランナーすべてがここに入っている。Denoは`~/.deno/bin/deno`一つ。構造は似ているが、BunはNode.jsスタイルのnode_modulesをそのままサポートし、DenoはURLベースのモジュールシステムをデフォルトで使う。

## 起動時間：Bunが速い、ただし常にそうとは限らない

100,000個の数字配列の合計を求めるシンプルなTypeScriptファイル（`hello.ts`）で実測した。

```
# コールドスタート（初回実行）
Bun:   0.243s
Deno:  0.067s

# ウォームアップ後（2〜5回目の平均）
Bun:   0.013s
Deno:  0.026s
```

この結果は予想と違った。Bunが常に速いわけではなかった。初回実行ではDenoが約3.6倍速い。Bunの初回実行が遅い理由は、JavaScriptCoreベースのJITコンパイラが初期化されるコストだと思われる。一方、ウォームアップ後はBunが2倍速くなる。

実際のサーバーや長時間動くプロセスではBunのウォーム性能が有利だ。だが、CLIツールや短時間のスクリプトなら、Denoの方が反応が良い。

## HTTP処理量：ほぼ同等

Apache Benchで直接測定した（n=3000, c=30, 127.0.0.1）。

```
Bun Serve API:   23,794 RPS  (0.126s)
Deno.serve API:  22,594 RPS  (0.133s)
```

差は約5%だ。実務で意味のある差とは言い難い。どちらのランタイムもNode.jsの基本HTTPモジュールより大幅に速く、実際のボトルネックはネットワークやビジネスロジックであり、ランタイムではない。

<strong>HTTP性能だけでランタイムを選ぶつもりはない。</strong>この数字は「どちらも十分速い」を確認するためのものだ。

## npmパッケージ互換性：アプローチが違う

ここが実質的に最も違う部分だ。

**Bun**：従来のnpm方式

```bash
bun add zod            # 91ms、node_modulesを作成
bun add lodash @types/lodash  # 651ms、35パッケージをインストール
```

`bun add`はnpmより速いパッケージマネージャーだ。node_modules構造をそのまま使うため、既存プロジェクトを移行する際の追加設定がほぼ不要だ。

**Deno**：npm:指定子方式

```typescript
// インストール不要、直接import
import { z } from "npm:zod@3";
import _ from "npm:lodash@4";
```

`npm:`指定子を使えば、パッケージを別途インストールする必要がない。初回実行時にDenoのグローバルキャッシュにダウンロードされ、以降はオフラインでも動く。node_modulesがないのは最初は違和感があるが、新しい環境でクローンしてすぐ実行できる利点は大きい。

[Bun Shellスクリプトガイド](/ja/blog/ja/bun-shell-scripting-practical-guide-2026)を書いたときは、BunのNode.jsパッケージ互換性のおかげで既存のユーティリティライブラリをそのまま使えた。Denoの`npm:`方式は、スクリプトの実験や新しいプロジェクトで特に便利だ。

## セキュリティモデル：これが本当の違いだ

ここは、Denoを過小評価していたと気付いた部分だ。

**Deno：デフォルトサンドボックス**

```bash
# 権限なしでファイル読み取りを試みる
$ deno run deno-security.ts
Permission denied: Requires read access to "/etc/hosts"

# 明示的に権限を付与
$ deno run --allow-read=/etc/hosts --allow-net=api.github.com deno-security.ts
File read success: ## Host Database ...
Network success: 200
```

**Bun：オープンモデル**

```bash
$ bun run bun-security.ts
File read (Bun, no restriction): ## Host Database ...
```

BunはNode.jsと同様に、ファイルシステム、ネットワーク、環境変数にデフォルトでアクセスできる。開発の利便性は高いが、サードパーティパッケージが悪意のあるコードを実行しても防ぐ方法がない。

Denoは`--allow-read`、`--allow-write`、`--allow-net`、`--allow-env`、`--allow-run`などの権限を明示的に許可する必要がある。CI/CDやサーバー環境でサードパーティのコードを実行する際、Denoのサンドボックスは実質的な防壁になる。

正直に言えば、Denoの権限フラグは最初は面倒だ。`--allow-net`なしでfetchを使ってエラーになる経験を何度かしてから慣れる。既存のNode.js開発者には初期に摩擦がある。

## Node.js互換性：今はどちらも動く

Deno 1.xの頃は、Node.js API互換性が大きな弱点だった。Deno 2で状況が変わった。

```typescript
// node:プレフィックスで標準モジュールを使用
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { EventEmitter } from "node:events";
```

直接テストした結果、BunとDenoの両方でこのコードが同様に動作した。`crypto.createHash("sha256")`、EventEmitter、`fs.existsSync`すべてパス。[Hono.jsをCloudflare Workersで実行するように](/ja/blog/ja/hono-typescript-api-2026)、HonoはBunとDenoどちらでも同様に動く。

## TypeScriptサポート：バージョンの差に注目

```
Bun 1.3.14:   TypeScript（Babelベースのトランスパイラー）
Deno 2.8.2:   TypeScript 6.0.3（V8 14.9.207.2）
```

どちらも別途コンパイルせずにTypeScriptを実行できるが、方式が違う。

Bunは型チェックを行わない。TypeScriptをJavaScriptに変換するだけで実行する。これが速い理由の一つだ。

DenoはTypeScript 6.0.3を使用し、`deno check`コマンドで完全な型検証が可能だ。CIで型安全性を保証したい場合、Denoの方が明確な選択肢になる。

```bash
# Deno：型チェック付き実行
deno check main.ts    # 型エラーのみを検査
deno run main.ts      # 型チェックなしで高速実行

# Bun：型チェックなしのトランスパイル
bun run main.ts       # 常に型チェックをスキップ
bun typecheck         # tscを別途呼び出す
```

## パッケージエコシステム：JSR vs npm

Deno 2には`jsr:`指定子もある。JSR（JavaScript Registry）はDenoチームが作った新しいパッケージレジストリで、TypeScriptをネイティブサポートし、ESM専用だ。

```typescript
// JSRパッケージの使用
import { assertEquals } from "jsr:@std/assert@1";
import { serve } from "jsr:@hono/hono@4/deno";
```

個人的に、JSRで公開されているパッケージの品質は高いが、npmと比べてパッケージ数が少ない。2026年現在、JSRのエコシステムは成長中だが、すぐに使える大部分のライブラリはまだnpmにある。

Bunはnpmエコシステムをそのまま使うため、この問題がない。

## 私の選択基準

実測データをまとめるとこうなる。

| 項目 | Bun 1.3.14 | Deno 2.8.2 |
|------|-----------|-----------|
| 初回実行 | 0.243s（遅い） | 0.067s（速い） |
| ウォームアップ後 | 0.013s（速い） | 0.026s（普通） |
| HTTP RPS | 23,795 | 22,594 |
| パッケージインストール | bun add 91ms | npm:指定子（インストール不要） |
| セキュリティモデル | オープンモデル | デフォルトサンドボックス |
| Node.js互換性 | 非常に高い | Deno 2で大幅改善 |
| TypeScript | トランスパイルのみ | 型チェックサポート（TS 6.0.3） |
| パッケージエコシステム | npm全体 | npm + JSR |

**既存のNode.jsプロジェクトを高速化する場合**: Bun。移行コストが低く、npmエコシステムをそのまま使える。

**新しいTypeScriptプロジェクト**: Deno。型安全性、セキュリティモデル、インストール不要の`npm:`指定子の組み合わせがすっきりしている。

**CLIツールや短いスクリプト**: Deno。コールドスタートが速く、単一ファイルでのデプロイが容易だ。

**Cloudflare Workers / Edge**: どちらもHonoとの相性が良い。Cloudflareは独自のランタイムを持っているため、ここでは大差がない。

**サードパーティコードの実行**: Deno。サンドボックスがない環境で未知のパッケージを実行するのはリスクが高い。

## 過大評価していたこと

「Bunが何倍も速い」というマーケティングメッセージをよく見かけた。実際には、HTTP処理量で5%の差しかない。コールドスタートではむしろDenoが速い。本当の違いは速度ではなく、セキュリティモデル、TypeScriptの型チェック方式、パッケージ管理の哲学だ。

Deno 2がNode.js互換性を改善したというのも、実際に確認するまでは半信半疑だった。`node:fs`、`node:crypto`、`node:events`がフラグなしで普通に動くのは印象的だった。

まだ不満な点もある。Denoの`--allow-*`フラグシステムは、開発の初期段階で摩擦がある。どの権限が必要か実行してみないとわからない場合があり、複雑なアプリでは権限リストが長くなると管理が面倒だ。

## 内蔵テストランナー：本物の違い

どちらのランタイムも、JestやMochaなしでテストを実行できる。

**Bun test**

```typescript
// counter.test.ts
import { expect, test, describe } from "bun:test";

describe("Counter", () => {
  test("正しくインクリメント", () => {
    let count = 0;
    count++;
    expect(count).toBe(1);
  });
  
  test("非同期も動く", async () => {
    const result = await Promise.resolve(42);
    expect(result).toBe(42);
  });
});
```

```bash
bun test                     # プロジェクト全テスト
bun test counter.test.ts     # 特定ファイル
bun test --watch             # 監視モード
```

`bun:test`はJestと互換性がある。既存のJestテストがそのまま動くケースも多い。[JestからVitestへの移行](/ja/blog/ja/vitest-4-jest-migration-guide-2026)と同様に、describe/test/expectのAPIはBunでも同じだ。

**Deno test**

```typescript
// counter_test.ts
import { assertEquals } from "jsr:@std/assert@1";

Deno.test("正しくインクリメント", () => {
  let count = 0;
  count++;
  assertEquals(count, 1);
});

Deno.test("非同期も動く", async () => {
  const result = await Promise.resolve(42);
  assertEquals(result, 42);
});
```

```bash
deno test                    # *_test.ts, test_*.tsを自動検出
deno test counter_test.ts    # 特定ファイル
deno test --watch            # 監視モード
```

Denoは`Deno.test()`を基本とする。テストも権限モデルに従い、ファイルシステムに触れるテストには`--allow-read`が必要だ。JSRの`@std/assert`でタイプセーフなアサーションが使える。

Jestからの移行なら、Bunの互換性の高さが有利だ。新規プロジェクトなら、Denoのスタイルも洗練されている。

## 実プロジェクトのセットアップ比較

実際に新しいプロジェクトを始める場合、どう違うか比較する。

**Bunプロジェクト初期化**

```bash
mkdir my-api && cd my-api
bun init -y          # package.json、tsconfig.json、index.tsを生成
bun add hono         # 依存関係を追加
bun run index.ts     # 実行
```

生成される`package.json`は普通のNode.jsプロジェクトと同じ見た目だ。CIでも`bun install && bun run build`のように既存のスクリプトがそのまま使える。

**Denoプロジェクト初期化**

```bash
mkdir my-api && cd my-api
deno init            # main.ts、deno.json、main_test.tsを生成
```

生成される`deno.json`:

```json
{
  "tasks": {
    "dev": "deno run --watch --allow-net main.ts",
    "test": "deno test"
  },
  "imports": {
    "hono": "npm:hono@^4.7.0"
  }
}
```

`deno.json`の`imports`フィールドがパッケージマッピングを担当する。node_modulesはなく、`deno.lock`がバージョンを固定する。慣れるまで時間がかかるが、理解すれば整然としている。

## デプロイ環境での違い

**単一実行ファイルのコンパイル**

どちらもランタイムなしで動く単一バイナリを生成できる。

```bash
# Deno
deno compile --allow-net --output server main.ts
./server

# Bun
bun build --compile index.ts --outfile server
./server
```

CLIツールの配布に便利だ。Denoのコンパイル時に`--allow-*`フラグを指定することで、バイナリが何を必要とするかが文書化されるという副次的な効果もある。

**Docker**

どちらも公式Dockerイメージを持ち、コンテナ化は難しくない。Denoは`CMD`に権限フラグを含める必要があり、インフラレベルで権限設計を明示化することになる。

## まとめ

2つのランタイムのどちらかが圧倒的に優れているという結論は出しにくい。「状況によって異なる」という陳腐な言い方になるが、今回は実際のデータから出た結論だ。

私の自動化スクリプトや個人CLIツールには、今後Denoを主に使うことになりそうだ。コールドスタートの性能と`npm:`指定子のインストール不要という点が、スクリプト作業で便利だ。チームプロジェクトやnpmパッケージに多く依存するサービスなら、Bunの互換性の方が実用的だ。

どちらのランタイムも単一バイナリコンパイル、Docker、Honoをサポートする。フレームワーク層は概ねポータブルだ。

Node.jsを使い続ける理由は減っている。どちらの方向に進んでも、今選べる2つの代替案はどちらも2026年現在、プロダクションで使えるレベルに達している。
