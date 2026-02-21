---
title: 'Fixing OpenClaw Dev Update Error: unknown command ''doctor'''
description: >-
  How to fix the error: unknown command 'doctor' error when running openclaw
  update on the dev version. A step-by-step troubleshooting guide with 3
  approaches tried.
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

## Introduction

If you're running OpenClaw from source (dev version), you might occasionally run into unexpected errors. The one I hit recently was particularly frustrating — a failure during `openclaw update` that took some digging to resolve. Here's how I figured it out.

## The Problem

When running `openclaw update`, the process proceeds normally until the very last step — "Running doctor checks" — where it fails with:

```
error: unknown command 'doctor' (Did you mean docs?)
```

The update is essentially complete at this point, making the failure all the more annoying.

## Root Cause

After investigating, I found that the `doctor` command exists inside the `maintenance` subcommand, but it's <strong>not registered as a top-level command</strong> because `register.subclis.ts` doesn't reference it.

In other words, `openclaw maintenance doctor` works fine, but `openclaw doctor` doesn't. The update script, however, calls `openclaw doctor` directly.

## The Fix (3 Attempts)

### Attempt 1: git pull + reinstall → Failed

The first thing I tried was hoping it had already been fixed upstream:

```sh
cd /path/to/openclaw
git pull
rm -rf node_modules
pnpm install
openclaw update
```

<strong>Result: Same error.</strong> The fix hadn't been merged yet.

### Attempt 2: pnpm build then update → Failed

I confirmed that the `doctor` command exists under `maintenance`:

```sh
openclaw maintenance --help
```

Rebuilt and tried again:

```sh
pnpm build
openclaw update
```

<strong>Result: Still failed.</strong> Rebuilding doesn't fix a structural registration issue.

### Attempt 3: Modify register.subclis.ts → Success 🎉

Time to fix it myself. First, I checked if `maintenance` is referenced in `register.subclis.ts`:

```sh
grep -n "maintenance" src/cli/program/register.subclis.ts
```

Nothing. That's the problem.

Checked the export name in `register.maintenance.ts`:

```sh
grep "export" src/cli/program/register.maintenance.ts
# export function registerMaintenanceCommands(program: Command) {
```

Added the following to the end of the `entries` array in `register.subclis.ts`:

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

Built and verified doctor works:

```sh
pnpm build
openclaw doctor --help
```

The doctor command is now recognized! Made a clean git state and ran update:

```sh
git add . && git commit -m "add doctor command"
openclaw update
```

<strong>Update successful at last!</strong>

After the update completes, revert the temporary commit:

```sh
git reset HEAD~1 && git checkout -- .
```

## Important Note

Reverting means the same issue may recur on the next update. Until an official fix is released, you'll need to remember this workaround and repeat the process each time.

That's exactly why I'm documenting this — hopefully it saves someone else the same headache.

## Wrapping Up

Running a dev version means dealing with these kinds of issues from time to time. The key takeaway is to read error messages carefully and trace through the source code to find the root cause. This particular case was a straightforward command registration issue once you understood the structure.

## References

- [OpenClaw Official Docs](https://docs.openclaw.ai/)
