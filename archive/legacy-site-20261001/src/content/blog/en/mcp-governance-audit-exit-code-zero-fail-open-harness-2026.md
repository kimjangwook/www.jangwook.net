---
title: 'Exit code 0 does not prove success in MCP governance audits: all 15 runs ended with success but the measurement failed'
description: 'A governance audit pipeline reported success on all 15 runs, yet produced no actual measurements. The exit code alone cannot distinguish a clean result from a failed one, so teams must verify that result files exist before trusting a green light.'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-audit-exit-code-zero-fail-open-harness-2026/hero.png
tags:
- MCP
- governance
- audit
- exit-code
- fail-open
relatedPosts:
- slug: declared-rules-fail-open-robots-txt-agents-md-2026
  score: 0.7
  reason:
    ko: '''규칙이 잘려도 에러는 나지 않는다 robots.txt와 AGENTS.md 219런 실측''와 같은 문제를 다른 측정으로 다시 잰
      글이다.'
    ja: '「ルールが届かないとき処理は止まらず素通りする: robots.txtとAGENTS.mdの実測」と同じ問題を別の実測で捉え直した記事。'
    en: Revisits the same problem as 'robots.txt and AGENTS.md both fail open' with
      a different measurement.
    zh: 用另一组实测重新审视与《规则没有生效，为什么两边都当成通过了》相同的问题。
- slug: mcp-builtin-vs-external-harness-cost-28x-measured-2026
  score: 0.7
  reason:
    en: This piece on exit code 0 masking failed measurements forces a re-check of
      the earlier claim that harness choice drives the 28x cost gap.
    ko: 측정 실패를 성공으로 위장하는 exit code의 함정을 다룬 이번 글이, 하네스 선택이 비용 격차를 만든다는 기존 분석의 신뢰성을
      다시 검증하게 만든다.
    ja: 終了コード0が測定失敗を隠す問題を扱う本稿は、ハーネス選定がコスト差を生むという既存分析の信頼性を再検証させる。
    zh: 本文揭示退出码0掩盖测量失败的问题，促使你重新审视此前关于工具链选择导致28倍成本差异的结论。
---

## Your pipeline's green light may not mean what you think

Your verification pipeline just turned green. Again. The screen says success, the log says exit code 0, and your team moves on to the next task. But that green light may not have measured anything at all. This is not a hypothetical worry. In a recent audit of an MCP governance pipeline, all 15 runs ended with exit code 0, and every single one of them failed to produce a single measurement. The pipeline reported success while doing almost nothing.

Think of a student who hands in a blank exam paper. The act of handing it in is complete, but that does not mean the student answered any questions. The pipeline in this audit handed in its work 15 times, and each time the paper was blank.

This raises a simple question: if the enumeration succeeded, why did no flags come out at all?

## All 15 runs reported zero hits, but zero hits is not a measurement

The audit ran five cells, each three times, for a total of 15 runs. Every run reported hits=0. According to the OWASP rubric, not a single flag was produced across the four evaluation areas: install schema, permission scope, update absence, and crosswalk. Every run exited with code 0. Every run reported zero hits.

<div class="lm-card lm-card--how" data-lm-figure="explain-how" data-lang="en"><span class="lm-card__title">How we measured</span><ol class="lm-card__steps"><li class="lm-card__text">Step 1. Enumerated the list of connected MCP servers from the harness configuration file.</li><li class="lm-card__text">Step 2. Attempted scoring by mapping each server onto the install schema cell of the OWASP criteria.</li><li class="lm-card__text">Step 3. Attempted to evaluate the permission scope cell in the same way.</li><li class="lm-card__text">Step 4. Attempted to evaluate the update absence cell by looking for a remote address evidence file.</li><li class="lm-card__text">Step 5. Finally, attempted to aggregate the overall results by mapping them onto the OWASP rubric.</li></ol></div>

Here is what each cell actually did. The first cell, c1-inventory-enumeration, enumerated MCP servers from the claude.json file. It ran three times. Each time it exited with code 0. Each time it reported hits=0/3. The file it read was 184322 bytes, and it did find one server: analytics-mcp, installed via stdio and pipx. So the enumeration itself worked. The server was identified.

The second cell, c2-install-schema-scoring, was supposed to score the install schema against the OWASP rubric. It ran three times. Each time it exited with code 0. Each time it reported hits=0/3. But the cell only checked a reference file, a 6376-byte readme, and never actually produced a score.

The third cell, c3-permission-scope-scoring, was supposed to score permission scopes. It ran three times. Each time it exited with code 0. Each time it reported hits=0/3. Its output was completely empty.

A zero in a measurement is only meaningful if a measurement actually happened. If a scale is broken and shows zero, that does not mean you weigh nothing. The same applies here. A hits count of zero from a cell that produced no output is not a result. It is an absence of a result.

A flag count of zero can mean the measurement failed, not that the system is safe.

## Missing files and failed aggregation all happened with success exit codes

The fourth cell, c4-update-absence-remote, was supposed to evaluate whether remote servers were missing updates. It ran three times. Each time it exited with code 0. Each time it reported hits=0/3. But the snapshot files it needed were not there. The output showed MISSING_FILE for snapshot/.mcp.json and MISSING_FILE for snapshot/claude.json, followed by NO_REMOTE_URL_FOUND. Without those files, there was no basis for the evaluation at all.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Rubric aggregation</span><span class="lm-card__text">All 3 runs exited normally but the results file was absent, so the aggregation tool failed to open the file.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Normal exits 3/3</span></div><span class="lm-card__chip">Flags 0</span></div></div>

The fifth cell, c5-owasp-rubric-crosswalk, was supposed to aggregate results across all cells. It ran three times. Each time it exited with code 0. Each time it reported hits=0/3. But the aggregation tool could not find its input. The error read: jq: error: Could not open file results/c*.json: No such file or directory. The result files were never created, so the aggregation had nothing to aggregate.

This is like saying dinner is ready when the kitchen is empty and no food was ever cooked. The statement is a completed sentence, but it is not a true description of what happened.

The pattern is consistent. Files were missing, and the pipeline still reported success. The aggregation failed, and the pipeline still reported success. The exit code and the actual outcome had nothing to do with each other.

A missing-file error can be disguised as a success.

## The exit code and the actual output diverged in three cells, repeatedly

Why did this happen? The mechanism is not fully known, but the pattern is clear. The exit code and the actual output are handled as separate paths. A script can return exit code 0 even when it produces no output and creates no files. The exit code says the script finished. It does not say the script succeeded.

The divergence appeared in three cells. Cell c2 checked a reference file but produced no score. Cell c3 produced completely empty output. Cell c5 failed to find its input files. All three exited with code 0. All three reported hits=0. The success signal and the actual result disagreed in every one of these cases.

The exact reason cell c3 produced empty output is unknown, and without access to the pipeline code, the cause cannot be confirmed. But the observation stands: the exit code did not reflect what actually happened.

This is the core problem. When a pipeline treats exit code 0 as proof of success, it cannot tell the difference between "the check ran and found nothing" and "the check never ran at all." Both look identical on the dashboard.

The mechanism is clear: exit code 0 does not prove success.

## The "zero flags means safe" interpretation only works when the measurement actually happened

There is a strong counterargument. If the pipeline found zero flags, maybe that is good news. Maybe the servers are fine. Maybe zero flags means no problems exist.

This interpretation is correct under one condition: the measurement must have actually happened. If the snapshot files exist, if the crosswalk aggregation ran properly, if the output is not empty, then zero flags is a meaningful result. It means the audit looked and found nothing.

That condition was not met in this experiment. The snapshot files were missing. The crosswalk failed to find its input. The permission scoring cell produced empty output. In this environment, there is no way to distinguish "zero flags because the system is safe" from "zero flags because the measurement failed." The expected outcome, which was to see multiple flags in at least two cells, could not be judged at all.

Choosing the "safe" interpretation here is not cautious; it is a guess dressed up as a conclusion. When you cannot tell the difference between a clean result and a failed measurement, assuming the clean result is the riskier choice.

The condition under which the "safe" interpretation becomes dangerous is now clear.

## Check your own pipeline for exit code 0 with no output

Here is what you can do tomorrow. Open your verification pipeline and look for one specific pattern: a cell that exits with code 0 but produces no result file, or produces output that is completely empty. If you find one, your pipeline has the same fail-open structure this experiment revealed.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">Flags were 0 in every cell and aggregation also failed, so this experiment could not determine which server has a problem in which cell.</p></div>

For teams that currently pass verification based on exit code alone: add a gate that checks whether the result file was actually created and whether the output is not empty. This check is cheap. In this experiment, a single jq command checking for the existence of results/c*.json would have caught the failure immediately. The cost of this gate is close to zero.

For teams that already specify output paths and minimum hit counts: this experiment confirms your structure is sound. You have nothing to change. The finding here is a validation of your approach, not a call to action.

The original question of this experiment, whether the OWASP rubric would flag the audited servers, was never answered. The measurement failed. But the way it failed is itself the finding: a pipeline that reports success while producing nothing cannot be trusted.

## What this article could not verify

The actual flag determination under the OWASP rubric was not measured. The crosswalk never aggregated, so no rubric-based judgment was possible.

The generalization that other harnesses and other audit scripts reproduce the same fail-open behavior is outside the scope of this article. This experiment ran on one machine, with one harness configuration, over 15 runs in a single day.

The condition under which this judgment would be wrong: if a pipeline always creates its result files whenever it exits with code 0, and those files are never empty, then that pipeline does not have this fail-open problem. In that case, exit code 0 would be a reliable signal for that specific pipeline.

## References

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project) — OWASP
2. [Model Context Protocol documentation](https://modelcontextprotocol.io) — modelcontextprotocol.io
3. [Anthropic Claude Code documentation](https://docs.anthropic.com) — docs.anthropic.com
4. [Claude Code settings and configuration](https://code.claude.com) — code.claude.com