---
title: 'OpenClaw dev 버전 업데이트 에러 해결: unknown command doctor'
description: >-
  OpenClaw dev 버전에서 openclaw update 실행 시 발생하는 error: unknown command 'doctor'
  에러의 원인 분석과 3가지 시도를 거친 해결 과정을 공유합니다.
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

## 들어가며

OpenClaw을 dev 버전(소스에서 직접 빌드)으로 사용하다 보면, 가끔 예상치 못한 에러를 만나게 됩니다. 이번에 제가 겪은 건 `openclaw update` 실행 시 발생하는 꽤 당황스러운 에러였는데요. 삽질 끝에 해결한 과정을 공유합니다.

## 문제 상황

`openclaw update`를 실행하면 업데이트 프로세스가 진행되다가, 마지막 단계인 "Running doctor checks"에서 다음 에러가 발생하며 실패합니다:

```
error: unknown command 'doctor' (Did you mean docs?)
```

업데이트 자체는 거의 다 끝난 상태에서 마지막 헬스체크 단계에서 터지니, 더 답답한 상황이었습니다.

## 원인

원인을 파고들어보니, `doctor` 커맨드가 `maintenance` 서브커맨드 안에는 존재하지만, `register.subclis.ts`에서 참조되지 않아 <strong>탑레벨 커맨드로 등록되지 않은 것</strong>이 문제였습니다.

즉, `openclaw maintenance doctor`로는 실행 가능하지만, `openclaw doctor`로는 실행할 수 없는 상태. 그런데 업데이트 스크립트는 `openclaw doctor`를 호출하고 있었던 거죠.

## 해결 과정 (시도한 방법 3가지)

### 첫번째 방법: git pull + 재설치 → 실패

가장 먼저 떠오른 건 "혹시 이미 수정됐을까?" 하는 기대감이었습니다:

```sh
cd /path/to/openclaw
git pull
rm -rf node_modules
pnpm install
openclaw update
```

<strong>결과: 같은 에러 발생.</strong> 아직 공식적으로 수정되지 않은 문제였습니다.

### 두번째 방법: pnpm build 후 update → 실패

`doctor` 커맨드가 `maintenance` 안에 존재하는 것을 확인했습니다:

```sh
openclaw maintenance --help
```

빌드를 새로 한 뒤 다시 시도:

```sh
pnpm build
openclaw update
```

<strong>결과: 여전히 실패.</strong> 빌드를 다시 해도 구조적인 문제라 해결되지 않았습니다.

### 세번째 방법: register.subclis.ts 수정 → 성공 🎉

직접 소스를 수정하기로 했습니다. 먼저 `maintenance`가 `register.subclis.ts`에서 참조되는지 확인:

```sh
grep -n "maintenance" src/cli/program/register.subclis.ts
```

아무것도 나오지 않습니다. 여기가 원인이었습니다.

`register.maintenance.ts`의 export 이름을 확인:

```sh
grep "export" src/cli/program/register.maintenance.ts
# export function registerMaintenanceCommands(program: Command) {
```

`register.subclis.ts`의 `entries` 배열 마지막에 다음을 추가합니다:

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

빌드 후 doctor가 정상 동작하는지 확인:

```sh
pnpm build
openclaw doctor --help
```

이제 doctor 커맨드가 인식됩니다! Git 상태를 깨끗하게 만들고 update를 실행합니다:

```sh
git add . && git commit -m "add doctor command"
openclaw update
```

<strong>드디어 업데이트 성공!</strong>

업데이트가 완료되면 임시 커밋을 되돌립니다:

```sh
git reset HEAD~1 && git checkout -- .
```

## 주의사항

커밋을 되돌리면 다음 업데이트 시 같은 문제가 다시 발생할 수 있습니다. 공식적으로 수정될 때까지는 이 방법을 기억해두고, 업데이트할 때마다 같은 절차를 반복해야 할 수 있습니다.

이 포스트를 기록으로 남겨두는 이유이기도 합니다. 같은 문제로 고생하는 분이 있다면 도움이 되길 바랍니다.

## 마무리

dev 버전을 사용하다 보면 이런 종류의 이슈는 피할 수 없습니다. 중요한 건 에러 메시지를 잘 읽고, 소스 코드를 추적해서 원인을 찾는 습관입니다. 이번 케이스는 커맨드 등록 구조를 이해하면 비교적 간단하게 해결할 수 있는 문제였습니다.

## 참고 자료

- [OpenClaw 공식 문서](https://docs.openclaw.ai/)
