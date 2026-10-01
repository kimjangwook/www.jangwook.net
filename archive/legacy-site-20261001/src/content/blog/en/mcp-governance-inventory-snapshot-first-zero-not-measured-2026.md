---
title: 'MCP Server Risk Checks Record Zero When No Result File Exists. A Storage Rule Must Come Before Scoring'
description: 'A security check that finishes successfully can still leave no results. When the result files are missing, a zero score means "not measured," not "no risk," so teams need a storage rule before they adopt any scoring tool.'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/mcp-governance-inventory-snapshot-first-zero-not-measured-2026/hero.png
tags:
- MCP
- security
- governance
- risk-assessment
relatedPosts:
- slug: mcp-governance-audit-exit-code-zero-fail-open-harness-2026
  score: 0.7
  reason:
    ko: '''MCP 거버넌스 감사에서 exit code 0은 안전을 증명하지 않는다''와 같은 문제를 다른 측정으로 다시 잰 글이다.'
    ja: 「MCPガバナンス監査でexit code 0は安全性を証明しない」と同じ問題を別の実測で捉え直した記事。
    en: Revisits the same problem as 'Exit code 0 does not prove safety in MCP governance audits'
      with a different measurement.
    zh: 用另一组实测重新审视与《MCP治理审计中，退出码0不能证明安全性》相同的问题。
- slug: mcp-server-production-deployment-kubernetes-guide
  score: 0.7
  reason:
    en: If the deployment guide focuses on keeping servers alive, this article shows
      why a live server's score can still signal false safety.
    ko: 배포 가이드가 서버를 살리는 데 집중했다면, 이 글은 살아난 서버의 점수가 왜 거짓 안전을 부를 수 있는지 보여준다.
    ja: デプロイガイドがサーバーを生かすことに焦点を当てたなら、この記事は生きたサーバーのスコアがなぜ偽りの安全を招くかを示す。
    zh: 若部署指南专注于让服务器存活，本文则揭示存活服务器的评分为何仍可能带来虚假的安全感。
---

## Your check said success, but it left no results

Today you ran an audit script to check whether the AI tools connected to your system are safe. The screen showed every item as successful. But when you looked for the actual findings, there was nothing there.

The audit tool reported success, and the results were empty. Both things are true at the same time.

Here is what happened in the actual test. The harness ran five cells, three times each, for fifteen runs total. All fifteen runs finished with exit code 0, which normally means "completed successfully." But the hits, which are the flags that mark a security finding, came back as zero across all five cells. One cell produced completely empty output. Another cell failed because a file was missing. The tool reported success, but it found nothing.

The problem is that the tool cannot tell the difference between "we checked and found zero risks" and "we could not check at all." Both look the same in the output. Both show up as zero.

You learn that a check tool's "success" display does not mean the check actually happened.

## What the tool actually found: one server and four empty boxes

The tool looked at a configuration file called claude.json. This file is 184322 bytes, which is about the size of a small novel. It lists the MCP servers your system is set up to use. The tool found exactly one server in that file, named analytics-mcp. It is installed using a tool called pipx, which runs Python programs in their own separate space. The connection type is stdio, which means the server and the AI tool talk through a direct text stream.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c1-inventory-enumeration" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Server inventory</span><span class="lm-card__text">All 3 runs exited normally but enumerated only one configuration entry for the analytics-mcp server with no flags.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Normal exits 3/3</span></div><span class="lm-card__chip">Flags 0</span></div></div>

The first check, called c1-inventory-enumeration, reads this file and lists what it finds. It ran three times. Each time it exited with code 0, which is the standard "everything went fine" signal. Each time it found zero issues. The one server it found was analytics-mcp, and that was the only useful result in the entire test.

The other four checks produced nothing. The second check, c2-install-schema-scoring, was supposed to score how the server is installed. It references a document called ref/owasp-mcp-readme.md, which is 6376 bytes. OWASP is the Open Worldwide Application Security Project, a nonprofit that publishes security standards. The check ran three times, exited with code 0 each time, and produced zero scores. The third check, c3-permission-scope-scoring, was supposed to score what the server can access. Its output was completely empty. No server got a permission score. The fourth check, c4-update-absence-remote, was supposed to see if the server has a way to receive updates. The fifth check, c5-owasp-rubric-crosswalk, was supposed to combine all the results into a final risk score.

The tool found one server and four empty boxes.

## Why the results were empty: the input files were never there

The empty results were not caused by a flaw in the evaluation logic. They were caused by missing input files.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c4-update-absence-remote" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Update absence</span><span class="lm-card__text">All 3 runs exited normally but the evaluation evidence file was missing, so no remote address could be found.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Normal exits 3/3</span></div><span class="lm-card__chip">Flags 0</span></div></div>

The fourth cell needed snapshot files to check for updates. A snapshot is a saved copy of a configuration at a specific point in time. The tool looked for snapshot/.mcp.json and snapshot/claude.json. Both were marked as MISSING_FILE. The tool also printed NO_REMOTE_URL_FOUND, meaning it could not find a remote address to check for updates.

The fifth cell had a different but related problem. It was supposed to combine the results from the other cells into an overall score. It used a tool called jq, which is a program for reading and processing JSON files. The command tried to open files that match a pattern called results/c*.json. The error message was: jq: error: Could not open file results/c*.json: No such file or directory.

The files did not exist, so the command could not read them. The cell failed. But the exit code was still 0, which normally means success. The tool recorded the failure as a success, with zero findings.

You learn that the empty results came from missing input files, not from a bad evaluation method.

## The strongest objection: one server means zero risk is normal

You might say that this whole test is not surprising. There was only one MCP server on the machine. A small setup with one server naturally has low risk. Zero hits is the correct answer, not a failure.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-c5-owasp-rubric-crosswalk" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Rubric aggregation</span><span class="lm-card__text">All 3 runs exited normally but the results file was absent, so the aggregation tool failed to open the file.</span><div class="lm-card__numbers"><div class="lm-card__bar"><div class="lm-card__bar-fill" style="--lm-bar-w:100.0%"></div><span class="lm-card__text">Normal exits 3/3</span></div><span class="lm-card__chip">Flags 0</span></div></div>

That objection is valid, but only in a narrow range. On one machine, on one day, with one server, the risk surface is genuinely small. If the tool had actually checked everything and found nothing, zero would be the right score.

But the evidence does not support that objection. The fifth cell did not produce a zero score. It failed to run at all. The jq command could not open the result files because they did not exist. That is not a zero. That is a "could not compute." The tool did not measure the risk and find it low. It did not measure anything at all.

For the objection to work, the result files would need to exist and contain real data. They did not. So even the objection depends on the storage rule being in place first.

You learn that even with one server, a failed aggregation is different from a legitimate zero score.

## What to change: make missing files count as failure

The fix is not a better scoring formula. The fix is a storage rule that treats an empty result as a failed check, not as a clean bill of health.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">Flags were 0 in every cell and aggregation also failed, so this experiment could not determine which server has a problem in which cell.</p></div>

Think of it this way. You send someone to inspect a restaurant kitchen. They come back, stamp the inspection form "complete," and hand it in. But the form has no notes, no checkmarks, no measurements. Would you call that a passing inspection? No. You would call it an incomplete inspection. The stamp says "done," but the paper says "nothing was recorded." Those are two different things, and the form should make that difference visible.

The same logic applies to the risk check tool. Right now, the tool reports success when a check runs and finishes. But finishing is not the same as measuring. If the check runs and produces no result file, the tool records a zero. That zero looks identical to a zero that came from a real measurement. The reader of the report cannot tell the difference. That is the problem.

The rule to add is simple. If a check is supposed to produce a result file, and that file is not there when the check finishes, the check must be recorded as failed. Not as zero. Not as "no issues found." As "could not measure." The absence of a file is itself a finding. It means the check did not actually happen, even though the process exited cleanly.

This rule must come before the scoring tool is used. Otherwise, every run of the tool produces a report that looks complete but is mostly empty. The report says "zero risk" when the truth is "we do not know." Those are not the same thing, and a governance report should never confuse them.

The change is small. The effect is large. With this rule in place, a check that cannot produce a result file will fail loudly. The team will see the failure and fix the input. Without this rule, the check fails silently, and the team sees a clean zero and moves on. The silent failure is the dangerous one. The storage rule makes it visible, and a visible failure can be fixed. A hidden one cannot.

## What this article could not verify

This article could not verify why the snapshot files were not created. The test could not tell whether the snapshot step was missing entirely or whether the files were saved to a different path.

This experiment was a single measurement on a single machine with one server. The results do not apply to environments with multiple remote servers.

This judgment would be wrong if an environment existed where the result files were created normally and all cells still showed zero hits. In that case, zero would be a real measurement, not a missing one.

## References

1. [OWASP MCP Governance and Risk Project](https://github.com/OWASP/OWASP-MCP-Governance-and-Risk-Project) — OWASP
2. [Model Context Protocol documentation](https://modelcontextprotocol.io) — modelcontextprotocol.io
3. [Claude Code documentation — settings and MCP configuration](https://code.claude.com) — code.claude.com