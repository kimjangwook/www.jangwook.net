---
title: 'The Google-Extended and Codex tests ended normally without determining actual behavior'
description: 'A test can finish without answering the question it was meant to answer. These Google-Extended and Codex reports lacked evidence needed to justify changing settings or documents.'
pubDate: '2026-09-13'
heroImage: ../../../assets/blog/harness-probe-fail-open-shell-builtin-collision-2026/hero.png
tags:
- AI
- testing
- Google-Extended
- Codex
---

## A finished report is not yet a reason to change anything

Artificial intelligence, or AI, is software that performs tasks such as writing and answering questions. A report written by AI says “normal exit” and “0 items found.” You now need to decide whether to change a site setting or shorten a document that AI reads.

Google-Extended is a website control concerning Google's use of content for AI. The first experiment examined it alongside robots.txt. A robots.txt file gives automated visitors instructions about which parts of a website they may access.

Codex is an AI tool that helps with coding. AGENTS.md is a project document that can give Codex instructions. The second experiment examined how Codex handles this file above 32 kibibytes, written as 32 KiB. A kibibyte measures the amount of data in a file.

These questions can affect everyday work. A site owner might change public access rules. A team might remove useful instructions because it believes Codex cannot read them.

The report appears precise. It contains status codes, run counts, file sizes, and empty result lists. Those details can create confidence even when they do not answer the original question.

A finished command answers one narrow question: did this particular processing step reach its end? It does not automatically prove that the test collected or checked the correct material.

Before deciding, check three things. Did the process finish? Did it use the right source? Could the results tell you which behavior the product showed?

How can we tell whether the report answered the question rather than just recorded that a command finished?

Check whether the commands finished. Then check whether their results answered your question.

## The robots.txt checks produced successful responses alongside command errors

The procedure first collected User-agent names from robots.txt. These names, also called tokens here, identify which automated visitors a set of rules applies to.

A regular expression is a text pattern used to find matching words. Here, a program used one to collect User-agent names from the website's current robots.txt file. The report calls these names tokens.

Its complete token summary was:

`All tokens: ['*'] / Google tokens: [] / OpenAI tokens: [] / Anthropic tokens: []`

The test found the `'*'` token. It found no token naming Google, OpenAI, or Anthropic in the website's current file.

The repeated searches reported `hits 0/3, exit 0,0,0`. Here, `hits 0/3` means none of the 3 searches found a match. An exit code is a number a command returns when it ends.

An exit code of `0` commonly reports that a command completed normally. It does not say whether the command examined the intended material or produced evidence that resolves the question.

The procedure also sent HEAD and GET requests under 6 User-agent names. A HEAD request asks for information about a web page or file, but not its contents.

A GET request asks for the page or file itself. The collected response result was straightforward.

Google-Extended, Googlebot, GPTBot, ClaudeBot, OAI-SearchBot, and Mozilla/5.0 all returned HTTP 200.

HTTP 200 means the computer hosting the website successfully answered the web request. A crawler is a program that automatically visits web pages. This response does not prove whether a real crawler would follow a robots.txt rule.

This response check also recorded `hits 0/3`. More importantly, the output contained command failures during all 3 executions:

`bash: Fetch: command not found`

`bash: Send: command not found`

The final exit sequence was still `0,0,0`. The test process treated Fetch and Send as commands. Those commands failed, but the process still produced output.

These observations describe different parts of the run. The token list describes the parsed file. HTTP 200 describes the server responses. The messages from the program running the commands describe failures.

None of those observations alone measures whether an actual crawler obeyed a provider-specific rule. There was no provider-specific rule in the parsed file to provide that comparison.

The same report recorded missing names, successful web responses, and command errors. These are separate findings.

## The live and repository comparison did not produce a usable result

A separate test step tried to compare the website's current robots.txt file with a copy in a local project folder. Git is a tool that tracks versions of project files. A project folder managed by Git is called a repository. The report calls each test step a cell.

This comparison failed in every recorded run. The summary was `live_vs_git_robots: hits=0/3 usable=0/3; exit 1,1,1`.

A usable run is an execution that produced material suitable for the intended comparison. Here, `usable=0/3` means none of the 3 runs qualified.

The exit code was `1` each time. Unlike the earlier exit code `0`, this directly marked the comparison command as unsuccessful.

The failed cell still left 2 temporary files and their line counts. `/tmp/live_robots.txt` contained `22` lines, while `/tmp/git_robots.txt` contained `0` lines.

Those counts do not establish why the files differed. The repository path might have been wrong, or the selected file might actually have been empty.

The available evidence does not distinguish those possibilities. The live-versus-repository comparison therefore never became valid.

Another check looked for groups of rules naming Google-Extended. It also checked whether the document mentioned both training and grounding.

Grounding means using information looked up while preparing an AI answer. Training uses examples to build the system's abilities instead.

The Google-Extended blocks list was empty. The check for the simultaneous presence of training and grounding returned `False`, with `hits 0/3`.

An empty block list left no Google-Extended example to test. The `False` value only described what the collected material contained.

It did not show whether Google-Extended controls both activities. It also did not establish whether the test collected and checked the intended documentation correctly.

Neither the line counts nor `False` establishes how the website's file differs from the local copy or what Google-Extended controls.

## The Codex checks confirmed arithmetic but not document handling

The Codex experiment asked what happens when AGENTS.md exceeds 32 KiB. It needed to distinguish whether Codex cuts the file at a boundary or skips the whole file.

The report contained 3 successful-looking cell summaries:

`doc-wording: hits=0/3 usable=3/3; exit 0,0,0`

`source-impl: hits=0/3 usable=3/3`

`boundary-math: hits=0/3 usable=3/3`

The search of the documentation found no relevant match. Neither did the search of the program code.

The searches still counted as `usable=3/3`. Their commands ran, but their results did not identify how Codex handles an oversized AGENTS.md file.

The collected quotation shows another problem. It contained code for an unrelated website menu:

`k hover:text-default hover:bg-primary-ghost-hover ' data-mobile-nav-link> Site tools (WebMCP)`

The quoted text came from a website menu, not a passage about the Codex behavior under test. The test collected irrelevant web page code.

If you needed an answer from a textbook’s main text but read only its contents page, `0` search results would not prove the answer was absent.

The file-size test created files of `32767`, `32768`, and `32769` bytes. A byte is a small unit of computer data. The test placed a recognizable byte near the size limit and checked its position.

The marker positions were `32763`, `32764`, and `32765`. The result changed with each file size, as the cell’s setup required.

The same cell reported:

`32768 <= 32KiB ? true`

That result confirms the test's arithmetic. It does not show Codex reading a file.

No observed result showed Codex reading only part of the file. No observed result showed Codex skipping the entire file either.

The document search, source search, and boundary arithmetic all ended without distinguishing those outcomes. Their `exit 0,0,0` values only show that the recorded commands completed.

The counts and file-size calculations do not show whether Codex reads only part of the document or skips it entirely.

## The failure path separated command completion from an answered question

The test process tried to run Fetch and Send as commands. Both failed, but processing continued. Later checks accepted empty files or unrelated web page code without marking the answer as unknown.

The logs show what happened, but not the exact commands that allowed the process to continue after the errors.

There were at least 3 separate checks to consider. The first was whether a command error occurred.

The second was whether the intended material had been collected. An empty repository file or unrelated HTML could not support the planned comparison.

The third was whether the resulting value could distinguish the possible answers. An empty list may be valid output, but it was not decisive in these experiments.

The process could finish without producing enough evidence to answer the question.

This does not mean every empty list is a hidden error. It means the report needed an explicit rule for cases where emptiness prevented the intended test.

Command errors, wrong source material, and checks that cannot answer the question are separate problems.

## Normal exits and usable runs still provide limited information

The strongest objection starts with a valid point. Exit code `0` can correctly mean that a search or arithmetic command ran normally.

The report also contained signals that exposed important failures. The live-versus-repository cell showed `usable 0/3`, and the recorded boundary information described limits on what had been determined.

The report therefore did not hide every problem. A careful reader could inspect those fields and notice that some comparisons had failed.

That objection is also right about the scope of an exit code. A command should not return failure merely because a correct search found no matching text.

Likewise, boundary arithmetic can be correct even when it does not test the product. The arithmetic cell did establish its narrow calculation.

The problem appears when these narrow successes are read as answers to broader questions. `usable=3/3` did not make the Codex searches relevant to actual document handling.

A completed search only proves that the search ran. It does not prove that the test searched the right document.

A completed calculation only proves that the calculation ran. It does not prove that Codex followed the calculated boundary.

The report fields were useful warnings. However, the available evidence does not show whether those warnings reached the headline, later totals, or a real decision.

The report's useful details do not establish product behavior. Neither do normal completion codes or `usable_runs`, the report's count of runs it marked as usable.

## Decisions should require evidence that can distinguish the possible answers

The opening question has a practical answer. Check command completion, source quality, and the ability to distinguish outcomes as separate requirements before changing a setting or document.

- **For people building automated inspection tools:** Check for command errors, correct source material, and results that answer the question. If any check fails, mark the answer as undetermined in the status, opening sentence, and summary counts.
- **For people using AI inspection reports:** Do not treat `hits 0/3` or empty lists as proof that a product feature is absent. Wait for another test that uses the right material and answers the question.

Tool builders should record whether the test answered the question separately from whether its commands ran successfully. A working command may still provide no useful answer.

They should put the failure notice where readers decide what to do. The first sentence should clearly say that the test did not establish the product's behavior.

Report users should avoid changing Google-Extended settings based on this empty block list. HTTP 200 did not test whether an actual crawler followed a rule.

They should also avoid shortening AGENTS.md based on the boundary arithmetic. That test did not check whether Codex read part of the file or skipped it entirely.

The safe reading is not that both products lack the tested behavior. The safe reading is that these experiments did not determine it.

Change settings or documents only when a test uses the right evidence and answers the relevant question.

## What this article could not verify

- This work did not measure whether actual crawlers follow robots.txt rules. There was no blocked comparison case because the block list was empty.

- HTTP 200 responses for the 6 User-agent names do not prove crawler compliance. They also do not prove that robots.txt is the only control method.

- This work did not verify whether Google-Extended controls AI training and grounding together through one token. The empty list and `False` do not prove that feature is absent.

- The tests did not establish why `/tmp/git_robots.txt` contained `0` lines. They may have used the wrong file location, or the source file may have been empty.

- The empty file alone does not establish what the local project file or the website's current file contained.

- This work did not determine whether Codex cuts off AGENTS.md at an exact data position above 32 KiB or skips the whole file.

- The marker positions and arithmetic were not results from running actual Codex reading behavior.

- Logs show that Fetch and Send were interpreted as commands and returned `not found`. They also show the final exit codes.

- The available records do not include the exact commands or show how later steps continued after errors. This article does not say whether Fetch and Send have special meanings in the program that runs commands.

- Empty lists and `0` search hits are not always failures. These experiments left the answer unknown. The records did not establish that the tests collected the right material or could answer the question.

- The report already counted usable runs and described why the file-size test did not answer the question. The records do not show whether anyone noticed this problem before the later review.

- The records also do not show whether later summaries or decisions incorrectly relied on these results.

- The verification status of References 1 to 4 is `unconfirmed`. Their URLs do not independently verify the experiment logs or product behavior.

- Reference 4 is not used as authoritative evidence about the Codex implementation.

- This article does not cover changes over time in companies' listed names, how often the testing tool fails, or the cost of improving it.

- This judgment must change if the same test run contains valid evidence showing what Google-Extended controls or how Codex handles the file. It must also change if the report consistently left inconclusive runs out of its totals.

## References

2. [Robots.txt Specifications](https://developers.google.com/search/docs/crawling-indexing/robots/robots_txt), Google Search Central
1. [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers), Google Search Central
4. [ClaudeBot and AI Crawling](https://support.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler), Anthropic
3. [OpenAI Crawlers](https://platform.openai.com/docs/bots), OpenAI