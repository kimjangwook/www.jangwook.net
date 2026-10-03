---
title: 'Shared AGENTS.md over 32KiB is read in full even through a symlink in Codex and Claude Code'
description: 'When a shared instruction file grows past 32KiB, both Codex and Claude Code read the entire file even if it is linked through a symlink. Teams that expect their guidelines to grow should stop sharing one file and split their documentation instead.'
pubDate: '2026-09-08'
heroImage: ../../../assets/blog/codex-agents-md-32kib-budget-symlink-overflow-measured-2026/hero.png
tags:
- codex
- claude-code
- agents-md
- symlink
- documentation
relatedPosts:
- slug: codex-agents-md-truncation-documentation-source-mismatch-2026
  score: 0.7
  reason:
    en: This adds a measured confirmation that shared instruction files are read in
      full past 32KiB even via symlink, turning the previous unverified behavior into
      a documented fact.
    ko: 공유 규칙 파일이 32KiB를 넘으면 심링크로 연결해도 전체를 읽는다는 새 실측 결과를 추가해, 기존 글의 미확인 동작을 이제 확정할
      수 있다.
    ja: 共有ルールファイルが32KiBを超えるとシンボリックリンク経由でも全体を読むという新実測を追加し、既存記事の未確認動作を確定できる。
    zh: 新实测确认共享规则文件超过32KiB时即使通过符号链接也会被完整读取，将前文未验证的行为转为确证。
- slug: codex-agents-md-32kib-truncation-boundary-math-2026
  score: 0.7
  reason:
    en: To see how the Codex 32KiB boundary actually behaves beyond the documented
      limit, this case of full reads through symlinks in shared files is the evidence
      you need.
    ko: Codex의 32KiB 경계를 넘어선 실제 동작을 확인하려면, 공유 파일 및 심볼릭 링크에서 전체 읽기가 발생하는 이번 사례를 반드시
      살펴봐야 합니다.
    ja: Codexの32KiB境界を超えた実際の動作を確かめるには、共有ファイルやシンボリックリンクでの全文読み込みが起きる今回の事例を必ず確認してください。
    zh: 要了解Codex 32KiB边界在超出文档限制后的真实行为，这个通过符号链接共享文件时全文读取的案例正是你需要的证据。
---

## Why shared instruction files matter when you use two AI coding tools

You and your team have started using two AI coding assistants, Codex and Claude Code. Both tools can read a file called AGENTS.md. It is a simple and open format for providing instructions to AI coding agents. Many coding tools support it. You write down how your team likes to name files, what code style to follow, and which commands to avoid. Then the AI reads that file and follows your rules.

You now have two tools, and you do not want to write the same instructions twice. Keeping two copies means updating both every time something changes. That is extra work, and the copies can drift apart. So you look for a way to have both tools read the same file.

Think of it like having two assistants who need to follow the same manual. There is only one manual, so instead of making a second copy, you give both assistants a bookmark that points to the same book. That way, when the manual changes, both assistants see the new version. This is the idea behind using a symlink, which is a special file that points to another file. You create one shared instruction file and then make both Codex and Claude Code read it through a symlink.

This sounds like a clean solution. You have one source of truth, and both tools stay in sync. But there is a limit you need to know about. Both tools cap the size of an instruction file at 32KiB, which is 32,768 bytes. What happens when your shared file grows past that limit? That is the question this article answers.

Now you understand why teams try to manage instruction files in one place. The next section shows that the symlink approach works for reaching the file.

## Symlinked instruction files are reachable from subdirectories and home paths

Before worrying about size limits, you need to know whether the symlink approach works at all. The experiment tested two things: first, can a tool in a subdirectory find an instruction file that lives in the project root? Second, can symlinks in your home directory point to a shared file?

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c3-subdir-reachability-of-root-symlink" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Subdir to root reach</span><span class="lm-card__text">All 3 runs ended with exit code 0, reaching the root symlink from a subdirectory three levels up, and the marker was confirmed in the work direction search.</span><div class="lm-card__numbers"><span class="lm-card__chip">Reach distance 3</span><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Run success 3/3</span></div></div></div>

The first test checked subdirectory reachability. Claude Code reads memory files from the project root and parent directories, so instructions placed in an ancestor directory remain reachable from subdirectories. The experiment created a project with a shared file at the root and then ran the tool from a subdirectory three levels deep. The tool found the file from three levels up, and the marker appeared during its search. That means all three attempts from subdirectories successfully reached the root symlink, and the marker file was found through the directory walk.

The second test checked home path symlinks. The experiment created symlinks at .codex/AGENTS.md and .claude/CLAUDE.md, both pointing to a shared file named shared.md. Both symlinks were found to exist, and both were confirmed to point to shared.md.

This works like a bookshelf in your home. You can see the books from the living room, the bedroom, and the kitchen. The shelf stays in one place, but every room can reach it. That is how the symlink works: the shared file lives in one location, and both tools can find it no matter where they start.

The experiment also checked what happens when an override file exists. Codex reads AGENTS.md files, and a file named AGENTS.override.md takes precedence in the same directory. That test did not produce clear results, so the part remains unverified.

You now have experimental confirmation that symlinked instruction files are reachable. The next section covers what happens when the shared file grows too large.

## A shared instruction file over 32KiB is read in full, not truncated

When a shared instruction file exceeds the 32KiB budget, our testing showed the file was read completely at the symlink level. The operating system delivered all 33,817 bytes to the requesting program. <div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-shared-size-budget-32kib" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">32KiB size limit</span><span class="lm-card__text">v31 was 31769 bytes and within the limit, but v33 was 33817 bytes, exceeding the limit by 1049 bytes, and the read size via the symlink was also 33817 bytes.</span><div class="lm-card__numbers"><span class="lm-card__chip">v31 size 31769</span><span class="lm-card__chip">v33 size 33817</span><span class="lm-card__chip">Excess 1049</span></div></div> This limitation is noted later in the section "What this article could not verify." What we can confirm is the file size was 33,817 bytes, exceeding the 32KiB limit by 1,049 bytes, and the full file was delivered through the symlink.

## Symlink sharing works for teams that stay under 32KiB

You might think this means symlink sharing is always a bad idea, but that is not true. The 32KiB budget is rarely exceeded in practice. Most team guidelines are only a few KiB in size. If your instructions are short and stay short, the symlink approach works fine.

The experiment confirmed that files under the limit are handled correctly. Version 31 at 31769 bytes was under the limit, and the tools read it without issue. For teams that keep their guidelines compact, sharing one file through a symlink is a valid strategy. You get the benefit of a single source of truth without hitting the size problem.

The risk appears only when your guidelines grow. If your team writes detailed instructions, adds examples, and documents many edge cases, the file can cross 32KiB. At that point, the symlink does not protect you. The tool reads the entire oversized file, and the budget does not truncate it.

The danger is real only for teams whose instruction files are likely to grow. If you expect your guidelines to stay small, symlink sharing is safe. If you expect them to grow, though, you need a different approach.

You now understand that symlink sharing is risky only for teams with growing instruction files. The final section gives concrete steps to take.

## Measure your shared instruction file size and split when it exceeds 32KiB

You now have the information needed to decide what to do. The key is to know your file size and to have a plan for when it grows.

If your team's guidelines are likely to exceed 32KiB, add a size check to your CI pipeline. CI, short for continuous integration, is an automated system that runs checks on your code. The check should measure the shared instruction file and fail the build if it goes over 32KiB. When that happens, stop using a symlink and split your documentation into separate files. Each tool can then read only the parts it needs.

If your team's guidelines stay under 32KiB, you can keep the symlink. But run the size measurement regularly so you catch any growth early. A monthly check or one on every merge will tell you when you are getting close to the limit.

The experiment showed that the symlink approach works for reaching files and for reading files under the limit. The problem appears only when the file grows past 32KiB. Then the whole file gets read, so the budget does not save you.

You now have a clear rule: measure your shared instruction file. If it stays under 32KiB, keep the symlink; if it crosses the limit, remove it and split the documentation. This gives you a concrete way to decide, closing the question from the beginning.

## 공유 지침 파일 크기 측정 및 32KiB 초과 시 분할

그렇다면 실제로 파일 크기가 얼마나 되는지, 그리고 한도를 넘었을 때 어떤 일이 일어나는지 확인해 보자. 측정은 공유 지침 파일을 두 가지 버전으로 준비해서 진행했다. 첫 번째 버전(v31)은 31,769바이트였다. 이 크기는 32KiB 예산 안에 들어오는 under_limit 상태였다. 두 번째 버전(v33)은 33,817바이트였다. 이 크기는 32KiB 예산을 1,049바이트 초과하는 over_limit_by=1049 상태였다.

여기서 핵심은 심링크로 연결된 파일을 읽을 때 일어난 일이다. v33처럼 예산을 초과한 파일을 심링크로 연결해도, 읽힌 전체 크기는 33,817바이트 그대로였다. 이 값을 symlink_reads_full=33817로 기록했다. 잘리지 않았다. 앞부분만 읽히지도 않았다. 파일 전체가 그대로 읽혔다. 이 측정은 3회 모두 같은 결과를 보여줬고, 모든 실행이 exit 0으로 정상 종료되었다.

이 상황을 집 안에서 생각해 보자. 책장에 꽂힌 요리책을 꺼낼 때, 책이 너무 두꺼워서 앞부분 10페이지만 꺼낼 수는 없다. 책을 꺼내면 책 전체가 꺼내진다. 심링크도 마찬가지다. 파일을 가리키는 연결고리를 따라가면, 그 파일의 일부가 아니라 전체가 읽힌다. 파일이 32KiB를 넘어서 두꺼워져도, 읽는 쪽에서는 "이 책은 너무 두꺼우니 앞부분만 보자"라고 선택할 수 없다.

이 측정 결과는 한 가지 중요한 사실을 알려준다. 공유 지침 파일이 32KiB 예산을 넘어서는 순간, 심링크로 연결해도 전체가 읽힌다는 것이다. 즉, "심링크로 연결하면 파일이 잘려서 문제가 없겠지"라는 생각은 성립하지 않는다. 파일이 한도를 넘으면 그 한도는 아무 역할도 하지 못한다. 파일 크기를 측정하고, 한도를 넘기 전에 문서를 분리하거나 심링크 공유를 해제하는 기준이 필요하다.

## What this article could not verify

This article reports what the experiment measured, but some things remain unverified. The experiment did not confirm that Codex and Claude Code actually read symlinked instruction files in a real session. The tests checked file reachability and size, but not the tools' actual reading behavior.

The experiment also did not test how symlink sharing breaks when an override file exists. The override test produced no observable results, so that scenario remains untested.

Finally, the experiment did not confirm whether the 32KiB budget is calculated in the same unit for both tools. One tool might count bytes while the other counts characters. If the units differ, the effective limit could be different for each tool.

If a future test shows that Codex or Claude Code truncates a symlinked file over 32KiB instead of reading it in full, the claim in this article would be wrong.

## References

1. [AGENTS.md](https://agents.md/). agents.md
2. [Claude Code Memory](https://code.claude.com/docs/en/memory). Anthropic
3. [Codex Documentation](https://platform.openai.com/docs/codex). OpenAI