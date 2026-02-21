---
title: OpenClaw dev版アップデートエラー解決：unknown command doctorの対処法
description: >-
  OpenClaw dev版でopenclaw update実行時に発生するerror: unknown command
  'doctor'エラーの原因分析と、3つの試行を経た解決プロセスを共有します。
pubDate: '2026-02-14'
heroImage: ../../../assets/blog/openclaw-update-doctor-error-fix-hero.png
tags:
  - openclaw
  - troubleshooting
  - cli
  - devops
relatedPosts:
  - slug: openclaw-cron-fix-guide
    score: 0.85
    reason:
      ko: '다음 단계 학습으로 적합하며, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through DevOps
        topics.
      zh: 适合作为下一步学习资源，通过DevOps主题进行连接。
  - slug: terraform-ai-batch-infrastructure
    score: 0.85
    reason:
      ko: '다음 단계 학습으로 적합하며, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through DevOps
        topics.
      zh: 适合作为下一步学习资源，通过DevOps主题进行连接。
  - slug: weekly-analytics-2025-10-14
    score: 0.84
    reason:
      ko: 자동화 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: 自動化分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in automation with comparable difficulty.
      zh: 在自动化领域涵盖类似主题，难度相当。
  - slug: astro-scheduled-publishing
    score: 0.83
    reason:
      ko: '다음 단계 학습으로 적합하며, DevOps 주제에서 연결됩니다.'
      ja: 次のステップの学習に適しており、DevOpsのトピックで繋がります。
      en: >-
        Suitable as a next-step learning resource, connecting through DevOps
        topics.
      zh: 适合作为下一步学习资源，通过DevOps主题进行连接。
  - slug: mcp-servers-toolkit-introduction
    score: 0.83
    reason:
      ko: DevOps 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: DevOps分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in DevOps with comparable difficulty.
      zh: 在DevOps领域涵盖类似主题，难度相当。
---

## はじめに

OpenClawをdev版（ソースから直接ビルド）で使っていると、たまに予想外のエラーに遭遇します。今回私がぶつかったのは、`openclaw update`実行時に発生するなかなか厄介なエラーでした。試行錯誤の末に解決した過程を共有します。

## 問題状況

`openclaw update`を実行すると、アップデートプロセスが進行した後、最後のステップ「Running doctor checks」で以下のエラーが発生して失敗します：

```
error: unknown command 'doctor' (Did you mean docs?)
```

アップデート自体はほぼ完了している状態で、最後のヘルスチェック段階で落ちるので、余計にもどかしい状況でした。

## 原因

原因を掘り下げてみると、`doctor`コマンドが`maintenance`サブコマンド内には存在するものの、`register.subclis.ts`で参照されておらず、<strong>トップレベルコマンドとして登録されていない</strong>ことが問題でした。

つまり、`openclaw maintenance doctor`では実行可能ですが、`openclaw doctor`では実行できない状態。しかしアップデートスクリプトは`openclaw doctor`を呼び出していたわけです。

## 解決プロセス（試した方法3つ）

### 1つ目の方法：git pull + 再インストール → 失敗

最初に思いついたのは「もしかして既に修正されているかも？」という期待でした：

```sh
cd /path/to/openclaw
git pull
rm -rf node_modules
pnpm install
openclaw update
```

<strong>結果：同じエラーが発生。</strong>まだ公式には修正されていない問題でした。

### 2つ目の方法：pnpm build後にupdate → 失敗

`doctor`コマンドが`maintenance`内に存在することを確認しました：

```sh
openclaw maintenance --help
```

ビルドし直してから再試行：

```sh
pnpm build
openclaw update
```

<strong>結果：依然として失敗。</strong>ビルドし直しても構造的な問題なので解決しませんでした。

### 3つ目の方法：register.subclis.tsを修正 → 成功 🎉

直接ソースを修正することにしました。まず`maintenance`が`register.subclis.ts`で参照されているか確認：

```sh
grep -n "maintenance" src/cli/program/register.subclis.ts
```

何も出力されません。ここが原因でした。

`register.maintenance.ts`のexport名を確認：

```sh
grep "export" src/cli/program/register.maintenance.ts
# export function registerMaintenanceCommands(program: Command) {
```

`register.subclis.ts`の`entries`配列の末尾に以下を追加します：

```js
{
  name: "doctor",
  description: "Health checks + quick fixes for the gateway and channels",
  register: async (program) => {
    const mod = await import("./register.maintenance.js");
    mod.registerMaintenanceCommands(program);
  },
}
```

ビルド後、doctorが正常に動作するか確認：

```sh
pnpm build
openclaw doctor --help
```

これでdoctorコマンドが認識されます！Gitの状態をクリーンにしてupdateを実行します：

```sh
git add . && git commit -m "add doctor command"
openclaw update
```

<strong>ついにアップデート成功！</strong>

アップデートが完了したら、一時的なコミットを元に戻します：

```sh
git reset HEAD~1 && git checkout -- .
```

## 注意事項

コミットを元に戻すと、次回のアップデート時に同じ問題が再発する可能性があります。公式に修正されるまでは、この方法を覚えておいて、アップデートのたびに同じ手順を繰り返す必要があるかもしれません。

この記事を記録として残しておく理由でもあります。同じ問題で困っている方の参考になれば幸いです。

## まとめ

dev版を使っていると、この種の問題は避けられません。大切なのは、エラーメッセージをよく読み、ソースコードを追跡して原因を見つける習慣です。今回のケースは、コマンド登録構造を理解すれば比較的簡単に解決できる問題でした。

## 参考資料

- [OpenClaw公式ドキュメント](https://docs.openclaw.ai/)
