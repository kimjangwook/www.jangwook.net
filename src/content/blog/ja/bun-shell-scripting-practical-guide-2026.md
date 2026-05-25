---
title: 'Bun ShellでTypeScript自動化スクリプトを作る — インストールから実践パターンまで'
description: 'Bun 1.3.14で実際に実験したBun Shell完全ガイド。$テンプレートリテラル、.nothrow()エラー処理、Promise.all並列化、macOS echoの罠まで実行ログ付きでまとめた。zxとの実質的な違いやプロダクション配備時の注意点も解説。'
pubDate: '2026-05-25'
heroImage: '../../../assets/blog/bun-shell-scripting-practical-guide-2026-hero.png'
tags: ['Bun', 'TypeScript', '自動化', 'Shell']
relatedPosts:
  - slug: 'uv-python-ai-development-setup-guide-2026'
    score: 0.78
    reason:
      ko: 'Bun이 Node.js 생태계를 하나로 합치려는 것처럼, uv도 Python 패키지 관리를 단일 도구로 통합한다. "왜 이 도구가 이렇게 설계됐나"라는 질문에 두 글이 함께 답한다.'
      ja: 'BunがNode.jsエコシステムを統合しようとするように、uvもPythonパッケージ管理を一元化する。両記事を読むと「このツールはなぜこう設計されたのか」という問いへの答えが見えてくる。'
      en: 'Just as Bun unifies the Node.js ecosystem into one tool, uv does the same for Python. Reading both answers the question: why are modern dev tools designed this way?'
      zh: '就像Bun试图统一Node.js生态系统一样，uv也在统一Python包管理。两篇文章一起阅读，能回答"为什么现代开发工具要这样设计"这个问题。'
  - slug: 'github-actions-claude-code-ci-automation'
    score: 0.74
    reason:
      ko: 'Bun Shell로 로컬 자동화 스크립트를 만들었다면, 그 스크립트를 GitHub Actions와 연결하는 방법이 자연스러운 다음 단계다.'
      ja: 'Bun Shellでローカル自動化スクリプトを書いたなら、それをGitHub Actionsと連携させるのが次のステップだ。この記事がその橋渡しをしてくれる。'
      en: 'If you built a local automation script with Bun Shell, connecting it to GitHub Actions is the natural next step — this post shows how.'
      zh: '用Bun Shell编写了本地自动化脚本之后，将其与GitHub Actions集成是很自然的下一步。'
  - slug: 'claude-code-hooks-workflow'
    score: 0.70
    reason:
      ko: 'Claude Code 훅도 셸 명령을 실행하는 구조다. Bun Shell 스크립트와 Claude Code 훅을 조합하면 개발 워크플로 자동화의 폭이 넓어진다.'
      ja: 'Claude CodeのフックもシェルコマンドをトリガーするUIだ。Bun Shellスクリプトと組み合わせると、開発ワークフロー自動化の幅が広がる。'
      en: 'Claude Code hooks also execute shell commands — combining Bun Shell scripts with hooks unlocks a wider range of dev workflow automation.'
      zh: 'Claude Code hooks也是执行shell命令的结构。将Bun Shell脚本与Claude Code hooks结合使用，可以扩大开发工作流自动化的范围。'
  - slug: 'nextjs-16-claude-api-streaming-guide-2026'
    score: 0.62
    reason:
      ko: 'Bun을 패키지 매니저로 사용하는 Next.js 프로젝트에서 Claude API를 연동하는 실제 예제가 궁금하다면 이 글을 함께 참고하자.'
      ja: 'BunをパッケージマネージャーとするNext.jsプロジェクトでClaude APIを連携する実例が気になる場合は、この記事も一緒に参照してほしい。'
      en: 'If you want a real example of using Bun as a package manager in a Next.js project with Claude API, this companion post has you covered.'
      zh: '如果你想看在Next.js项目中使用Bun作为包管理器并集成Claude API的实际示例，可以参考这篇文章。'
---

シェルスクリプトを書くとき、ちょっとした悩みが生まれる。bashで書けば慣れているがWindowsで壊れる。Node.jsの`child_process`はコールバックまみれになる。`zx`は追加パッケージが必要だ。そんな中でBun Shellを直接試してみた。最初は「zxの劣化版じゃないか」と思っていたが、実際に動かすと少し考えが変わった。

この記事はBun 1.3.14をローカルにインストールして直接実験した結果に基づいている。ドキュメントに書いてあることと実際に動くものが違う部分もあったので、それを正直に書いた。

## Bun Shellとは何か、なぜ今使われているのか

BunはJavaScriptランタイムであり、パッケージマネージャー、バンドラー、テストランナーでもある。Node.jsが複数のツールに分散している生態系を一つにまとめようとするプロジェクトだ。[PythonのuvがPipとpyenvとpoetryを統合するように](/ja/blog/ja/uv-python-ai-development-setup-guide-2026)、Bunはnpm/yarn/pnpm + テストランナー + バンドラーを一つに統合する。

Bun Shellはこの統合の延長線上にある。`bun`をインストールするだけで、別途設定なしに`$`テンプレートリテラルでシェルコマンドをTypeScript内で直接実行できる。

### zxとの違い

正直、APIそのものは似ている。両方とも`` $`command` ``構文を使う。核心的な違いは一つ: **Bun ShellはBashに依存しない。**

zxは内部的にシステムのbash（またはsh）を呼び出す。WindowsでBashがなければWSLやGit Bashが必要になる。Bun ShellはRustで実装された自前のシェルを内蔵しているので、Bashなしでも動作する。`ls`、`rm`、`echo`、`cd`、`mkdir`などの命令がOSに関係なく同じように実行される。

チームにWindowsの開発者がいる場合、この違いは大きい。

## インストール方法

Bunのインストールは一行で済む:

```bash
curl -fsSL https://bun.sh/install | bash
```

インストール後、シェル設定ファイル（`~/.zshrc`または`~/.bashrc`）に`PATH`が自動追加される。現在のセッションに適用するには:

```bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
bun --version  # 1.3.14
```

新しいプロジェクトの初期化:

```bash
mkdir my-scripts && cd my-scripts
bun init -y
```

`bun init`は`package.json`、`tsconfig.json`、`index.ts`を自動生成する。TypeScriptを追加設定なしにすぐ実行できる点が便利だ。

## 基本パターン — $テンプレートリテラルでコマンドを実行する

最も基本的な使い方から始めよう。`bun`モジュールから`$`をインポートする:

```typescript
import { $ } from "bun";

// コマンド実行
await $`echo "Hello from Bun Shell"`;

// 出力キャプチャ
const files = await $`ls -la`.text();
console.log(files);

// JavaScript変数の補間（自動エスケープ！）
const filename = "my file.txt";  // スペース含む
await $`echo "${filename}" > output.txt`;
// → output.txtに"my file.txt"が保存される（スペースが正しくエスケープ）
```

変数補間の自動エスケープは実際に動作を確認した。スペースを含むファイル名を渡しても別途処理なしに正しく扱われる。bashスクリプトで`"${var}"`でくくるのを忘れてハマる事故が減る。

### 出力形式メソッド

```typescript
const result = await $`ls`;

// 文字列で
const text = await $`ls`.text();

// 行単位の配列で（Bun特有の便利メソッド）
const lines = await $`ls`.lines();
// → ["file1.ts", "file2.ts", ...]

// Blobで
const blob = await $`cat file.txt`.blob();
```

`.lines()`は出力を行単位の配列にパースしてくれる便利メソッドだ。`text().split('\n')`を自分で書くよりずっとすっきりする。

## エラー処理、環境変数、パイプライン

### エラー処理の二つのパターン

Bun Shellでコマンドが失敗すると（exit code != 0）、デフォルトで例外を投げる。

```typescript
// パターン1: try/catch
try {
  await $`ls /nonexistent-dir`;
} catch (e) {
  console.log("エラー:", e.message); // "Failed with exit code 1"
}

// パターン2: .nothrow() — エラーをexitCodeで返す
const result = await $`ls /nonexistent-dir`.nothrow();
console.log(result.exitCode); // 1
console.log(result.stderr.toString()); // エラーメッセージ
```

実務では`.nothrow()`をよく使う。ファイルの存在確認、コマンドのインストール確認などに`try/catch`より使いやすい:

```typescript
const nodeResult = await $`node --version`.nothrow();
if (nodeResult.exitCode === 0) {
  console.log("Node.js:", nodeResult.stdout.toString().trim());
} else {
  console.log("Node.jsがインストールされていません");
}
```

実験した結果、このパターンは正常に動作した。

### 環境変数の設定

```typescript
// グローバルデフォルト設定
$.env({ API_KEY: "secret123", PATH: process.env.PATH! });

// 単一コマンドにローカル適用
const result = await $`echo $LOCAL_VAR`
  .env({ LOCAL_VAR: "only this command", PATH: process.env.PATH! })
  .text();
```

注意: `.env()`を使う際は既存の`PATH`を明示的に渡す必要がある。渡し忘れるとPATHが空になり、`ls`などの基本コマンドも実行できなくなる可能性がある。

### パイプライン

```typescript
// Bun Shell内蔵パイプ
const sorted = await $`printf "banana\napple\ncherry\n" | sort`.text();
// → apple\nbanana\ncherry

// 重複除去 + ソート
await Bun.write("input.txt", "banana\napple\ncherry\napple\n");
const unique = await $`sort < input.txt | uniq`.text();
```

ここで一つ罠がある。macOSで`echo "banana\napple"`と書くと`\n`が改行として解釈されない。bashの`echo -e`と違い、macOSのデフォルトの`echo`はエスケープシーケンスを処理しない。`printf`を使う必要がある。

Bun ShellはBashなしで動くが、OS組み込みコマンドの動作はそのOSに従うという点を頭に入れておこう。

## 並列実行 — Promise.allが鍵だ

Bun Shellでコマンドを並列実行するには`Promise.all`を使う。コマンドを順番に書くと順次実行になる。

```typescript
// 順次実行 (~200ms)
await $`sleep 0.1`;
await $`sleep 0.1`;

// 並列実行 (~100ms)
await Promise.all([
  $`sleep 0.1`,
  $`sleep 0.1`,
]);
```

実際に計測したところ、順次実行は約471ms、並列実行は約263msだった。期待よりオーバーヘッドがあるのはmacOSでのプロセス生成コストのためだ。それでもIOが多い処理では並列化の効果がある。

### 実用的なビルドスクリプト例

Bun Shellの真価はビルドスクリプトに現れる。複数ファイルの生成・検証・移動をTypeScriptのロジックと混在させられる:

```typescript
import { $ } from "bun";

const DIST = "./dist";
const SRC = "./src";

async function build() {
  // 1. クリーンビルド
  await $`rm -rf ${DIST} && mkdir -p ${DIST}`;

  // 2. TypeScriptファイル一覧
  const tsFiles = await $`ls ${SRC}/*.ts`.text();
  const files = tsFiles.trim().split("\n");

  console.log(`ビルド対象: ${files.length}ファイル`);

  // 3. 並列処理
  await Promise.all(
    files.map(async (f) => {
      const name = f.split("/").pop()!.replace(".ts", ".js");
      await $`bun build ${f} --outfile ${DIST}/${name}`;
    })
  );

  // 4. 結果確認
  const built = await $`ls ${DIST}/`.text();
  console.log("ビルド完了:", built.trim().replace(/\n/g, ", "));
}

build().catch(console.error);
```

このスクリプトを`scripts/build.ts`として保存して`bun run scripts/build.ts`で実行する。Node.js + ts-nodeの組み合わせが不要になる点が体感として楽だ。[このビルドスクリプトをGitHub ActionsのCI/CDパイプラインと連携](/ja/blog/ja/github-actions-claude-code-ci-automation)するのも自然な次のステップだ。

## 実験で見つけた罠たち

正直に書く。

### 罠1: `.stdin()` APIが1.3.14で動かない

ドキュメントや例では`` $`command`.stdin("text") ``という形を見ることがある。1.3.14時点でこのAPIは存在しない。実行時に`stdin is not a function`エラーが発生する。

代替策: ファイルを経由するか、パイプチェーンで`printf`を使う。

```typescript
// ❌ 動かない (1.3.14)
await $`sort | uniq`.stdin("banana\napple\ncherry");

// ✅ 代替1: ファイル使用
await Bun.write("/tmp/input.txt", "banana\napple\ncherry\n");
await $`sort < /tmp/input.txt | uniq`;

// ✅ 代替2: printfでパイプ
await $`printf "banana\napple\ncherry\n" | sort | uniq`;
```

### 罠2: グローバルの$.env()がPATHを上書きする

`$.env()`に渡すオブジェクトが既存の環境変数を完全に置換する。`PATH`を忘れると以降のすべてのコマンドで実行ファイルが見つからなくなる:

```typescript
// ❌ 危険: PATHがなくなる
$.env({ MY_VAR: "value" });
await $`ls`;  // エラーになりうる

// ✅ 安全: PATHを明示的に含める
$.env({ MY_VAR: "value", PATH: process.env.PATH! });
```

### 罠3: macOSのechoは\nを解釈しない

前述の通り、Bun ShellはBashを使わないのでmacOSのデフォルトのechoが使われる。Linux bashでは`echo "a\nb"`が改行付きで出力されるが、macOSでは`a\nb`がそのまま出力される。

```typescript
// ❌ macOSで期待通りに動かない
await $`echo "apple\nbanana\ncherry" | sort`;
// → 一行で "apple\nbanana\ncherry" と出力

// ✅ printfを使う
await $`printf "apple\nbanana\ncherry\n" | sort`;
// → apple, banana, cherry (各行で)
```

クロスプラットフォームを謳っているが、組み込みコマンドの動作差異はOSに従うことを覚えておこう。

## いつBun Shellを使い、いつ使わないべきか

私の結論を言うと: **すでにBunを使っているプロジェクトならBun Shellを使う理由は十分ある。そうでなければzxから始める方が現実的だ。**

### Bun Shellを使うべきとき

- **プロジェクトがすでにBunベース**: パッケージマネージャーとしてbunを使っているなら追加依存なしでシェルスクリプトが使える。
- **チームにWindowsの開発者がいる**: Bashなしで動くクロスプラットフォームシェルが必要なとき。
- **ビルド/デプロイスクリプト**をTypeScriptで統合したいとき: 設定コードとシェル操作を同じファイルで処理。

### Bun Shellを使わなくていいとき

- プロジェクトがNode.js + npmベースでマイグレーション計画がない。
- 複雑なbashスクリプトが既にあり、Bun Shellのbash互換性が不確実。
- `zx`が既によく動いていてチームが慣れている。

Bun Shellがzxより「優れている」という主張には同意しない。エコシステムの成熟度とダウンロード数でzxが上だ。Bun Shellは「Bunを使う人には自然な選択」であって「すべてのプロジェクトでzxの代わりに使うべき」ということではない。

個人的には、`.stdin()` APIがまだ安定していない点が残念だ。これが安定したらstdinベースのパイプ処理がずっとすっきりするはずなのだが。

## まとめ

実際にインストールして動かしてみて感じたのは、Bun Shellの開発者体験が思ったより良いということだ。変数の自動エスケープ、`.nothrow()`パターン、`.lines()`などの便利メソッドはzxにも見られないディテールだ。

ただし、まだ1.xバージョンでAPIが安定していない部分がある。プロダクションのCI/CDスクリプトに使う前に実際の環境で十分に検証することを勧める。[Claude Codeフック](/ja/blog/ja/claude-code-hooks-workflow)のような自動化パイプラインに統合する際も同様だ。

Bunが進化し続ける中でShell APIも安定していくだろうと思う。今すぐzxを捨てる必要はないが、新しいBunプロジェクトなら内蔵シェルを先に試してみる価値はある。

---

**実験環境**:
- Bun: 1.3.14 (macOS arm64)
- サンドボックス: `/tmp/bun-lab-final/`
- 実験日: 2026-05-25
