---
title: 'Codex AGENTS.md 32KiB limit: no documentation or source code says what happens when you exceed it'
description: 'OpenAI Codex reads project instruction files with a 32KiB limit calculated in bytes, but neither the official documentation nor the source code explains what happens when a file goes over that limit. The math for the limit is correct, but the behavior at the edge is still undocumented.'
pubDate: '2026-09-06'
heroImage: ../../../assets/blog/codex-agents-md-32kib-truncation-boundary-math-2026/hero.png
tags:
- codex
- agents-md
- documentation
- limits
---

## The 32KiB instruction file limit has a gap in its documentation

You have probably written rules for an AI coding tool. You put them in a file called AGENTS.md, and the tool reads it before it works on your project. Think of it like sending a letter with a page limit. You know the limit exists, but the rules for going over it are a mystery. Does the post office throw the letter away, keep only the first page, or deliver everything anyway?

This is where Codex users stand today. The tool reads AGENTS.md files, and there is a size limit of 32KiB. But neither the official documentation nor the source code says what the tool does when a file exceeds that limit. The file could be ignored. It could be cut off mid-sentence. It could even be read in full without warning. Nobody has documented it.

If you manage instruction files for your team, you now have a reason to check whether your files are close to this limit. A file that quietly stops working could waste hours of work before anyone notices.

## The boundary math is exact, but the behavior at the edge is undocumented

The limit is 32KiB, and it is calculated in bytes, not characters. That sounds simple, but it has consequences for how you count the size of your file. A byte is a single unit of digital information. In English text, each letter usually takes one byte. In other languages, a single character can take multiple bytes. So a file with 32,000 Korean characters can be much larger than a file with 32,000 English letters.

<div class="lm-card lm-card--cell" data-lm-figure="explain-cell-boundary-math" data-lang="en"><span class="lm-card__badge lm-card__badge--ok">pass</span><span class="lm-card__title">Boundary math experiment</span><span class="lm-card__text">In the 32768-byte file, the marker byte was at 32764; in the 32769-byte file, it was at 32765.</span><div class="lm-card__numbers"><span class="lm-card__chip">32767 file 32763</span><span class="lm-card__chip">32768 file 32764</span><span class="lm-card__chip">32769 file 32765</span></div></div>

Our experiment tested files at exact boundary sizes. We created three files with sizes of 32767, 32768, and 32769 bytes. Each file contained a marker byte at a specific position so we could see how the tool handled the boundary. The marker landed at positions 32763, 32764, and 32765 respectively. The calculation that checks whether 32768 is less than or equal to 32KiB returned true. The math checks out perfectly.

But the math is only half the story. We searched the official Codex documentation for any wording about what happens when a file exceeds the limit. Three separate searches found zero matches. We searched the source code for the implementation of the truncation behavior. Three more searches, again zero matches.

The documentation confirms that Codex reads AGENTS.md files. The documentation even says that a file called AGENTS.override.md takes precedence over AGENTS.md in the same directory. But nowhere does it say what happens at 32KiB and one byte.

You now know that you can't rely on the documentation to tell you what happens when your instruction file goes over the limit. The documentation says nothing about this exact question.

## Symlinked instruction files can be shared across directories and tools

Many teams want to use the same instruction file for multiple tools and multiple directories. You might have one set of rules for your whole project, and you want every subdirectory to follow it. The Claude Code documentation says that memory files are read from the project root and parent directories, so instructions in an ancestor directory remain reachable from subdirectories.

But what if you want to share one file across tools that look for different filenames? Codex looks for AGENTS.md. Claude Code looks for CLAUDE.md. You could copy the content into two files, but then you have to keep them in sync. Every edit needs to happen twice.

A symlink solves that problem. A symlink is like having a single key that opens multiple doors. You create one real file with your instructions, then create symlinks with different names that all point to that one file. The tools see different filenames, but both names lead to the same content.

Our test confirmed this works. We created a shared file at the root of a workspace. We then created symlinks from AGENTS.md and CLAUDE.md to that shared file. From a subdirectory, both files reached the shared file at the root. The test ran three times, and all three attempts succeeded. We also added a marker to the file, and walking up from the subdirectory found that marker every time.

We also tested the home directory setup. The home directory is the top-level folder for your user account. If you put instruction files there, every project on your machine can reach them. We created a .codex/AGENTS.md symlink pointing to a shared file, and a .claude/CLAUDE.md symlink pointing to the same shared file. Both symlinks existed and pointed to the correct target.

This means you can share one instruction file across multiple AI coding tools. You can also place it so that every subdirectory reaches it. The setup works, at least for file existence and reachability.

## The size budget held for version 31, then broke in version 33

A shared instruction file is a living document. You update it as your team’s practices change. Each update creates a new version. We tracked the size of a shared instruction file across versions to see how close it got to the 32KiB limit.

Version 31 of the file had a size of 31769 bytes. That's under the limit of 32768 bytes. The budget held. Version 33, however, had a size of 33817 bytes. That exceeds the limit by 1049 bytes. The budget broke.

A read through a symlink returned the full file size of 33817 bytes. That means the symlink did not compress or hide the size. The tool reads what the file is, and the file is over the limit.

This shows how quickly a budget can break. The file went from under the limit in version 31 to over the limit in version 33. Two versions made the difference. If your team manages an instruction file through version control, you cannot assume the size will stay put. Every edit pushes the file either closer to the limit or further from it.

You now have a concrete number to think about. A difference of 1049 bytes moved a file from compliant to over budget. Your own file could cross that line with a similarly small change.

## The strongest objection has a fair range, but the claim survives

The strongest objection to our finding is that our search methods might be flawed. We searched the documentation and the source code for truncation wording. Zero matches doesn't necessarily mean the wording is absent. The official documentation might render words in a way that breaks our search. The source code might be minified or obfuscated, which makes it hard to search.

This objection is correct within a range. A failed search is not proof that something does not exist. It is proof that our search did not find it. Our search methods could miss the relevant text. That is a real limitation of our approach.

But our claim is narrower than "the behavior is different." Our claim is "the documentation alone does not reveal the behavior." That claim is supported by the search failures themselves. We tried multiple searches in multiple places. All of them returned zero matches. If the answer were easy to find, at least one search would likely have succeeded.

This is like searching for a sentence in a shuffled stack of books. You flip through the pages, and you cannot find the sentence. That does not prove the sentence is absent from the books. But it does prove that you cannot rely on the books to give you the answer quickly.

You now understand the difference between "the documentation does not say" and "the tool behaves differently." Our evidence supports the first statement directly. It does not prove the second statement at all. The documentation gap is what we can confirm.

## What you can do to protect your shared instruction files

You now have enough information to take action. The documentation will not tell you what happens when your file exceeds 32KiB. You have to find out for yourself.

<div class="lm-card lm-card--takeaway" data-lm-figure="explain-takeaway" data-lang="en"><span class="lm-card__title">Takeaway</span><p class="lm-card__takeaway">Since no relevant information was found in either the documentation or the source code, the actual behavior could not be confirmed.</p></div>

If your team manages instruction files only through version control, run a direct experiment. Create a test file that exceeds 32KiB by a small amount. Put it in a test project and have the AI coding tool read it. See whether the tool reads the whole file, cuts it off at the limit, or skips it entirely. Write down what you observe and add that note to your project documentation. That way, the next person who manages the file will know what to expect.

Add a step that measures the size of your shared instruction file. If it exceeds 32768 bytes, make the build fail. This gives you an early warning before the over-limit file reaches your AI tools.

The question we opened with was what happens when an instruction file exceeds 32KiB. We have not found the answer in the documentation or the source code. The only reliable answer comes from testing it yourself.

## What this article could not verify

We could not verify that the actual command-line tool reads symlinked instruction files, because two of our test cells depended on running an AI model through the CLI, and those cells were excluded from our scope.

Our findings do not apply to tools with different size limits, such as 64KiB or 128KiB, because each tool can implement its own boundary behavior.

This judgment is based on the fact that our searches found zero matches for truncation behavior in both the documentation and the source code. If a search method that we did not use finds a documented statement about what happens when a file exceeds 32KiB, this judgment would be wrong.

## References

1. [Codex documentation](https://platform.openai.com/docs/codex) — OpenAI
2. [Claude Code memory documentation](https://code.claude.com/docs/en/memory) — Anthropic
3. [AGENTS.md specification](https://agents.md/) — agents.md