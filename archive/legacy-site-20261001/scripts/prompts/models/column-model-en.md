# The model — write something that reads like this

`src/content/blog/en/amazon-kiro-spec-driven-ai-ide-vs-claude-code-2026.md` is the column this blog is aiming at. Eight H2s. What follows is its skeleton.

**Steal the breathing and the way it takes a position. Leave the typography.** That piece's `---` section rules, and the H2 order it shares with the other three languages, break the current contract and fail the build.

---

## Opening — two paragraphs

The first opens on **an event with a date on it** or **a question you actually got asked**.

> A new player entered the AI coding tool market. Amazon's Kiro, released publicly in July 2025, isn't just another AI autocomplete — it's an IDE built on the philosophy that specs should come before code. As someone who uses Claude Code daily, I wanted to understand what that actually means in practice.

Another piece opened this way: `"I'm on Claude Code right now — should I switch to Codex?" I've been asked that three times in the last two weeks.`

The second gives away **the conclusion**. It creates a reason to keep reading; it is not a summary.

> Let me give you the bottom line first: Kiro and Claude Code aren't competing directly. They're solving different problems. But if you don't understand what those problems are, you'll misuse both.

The original has a third paragraph disclosing that it is a Source Review and that nothing untested is claimed as tested. **Do not write that paragraph.** Not claiming what you did not do is enough, and a disclosure that appears every time becomes its own template.

## Body — six to eight of the nine

| Block | What it does |
|---|---|
| What changed | The facts, briefly |
| Mechanism | Why it behaves that way. Directory trees and code blocks live here |
| The numbers | What the benchmark says and what it doesn't |
| Cost | Price, quota, time. The one place a table belongs |
| Axes of comparison | How it differs from what you already use. Three or four axes |
| **An explicit objection** | One whole section given to the counterargument. Required |
| Would I adopt it | Where you would actually get stuck |
| Who it fits | Fits / does not fit, as a symmetric pair |
| Limits | Optional |

**You choose the order.** Four or fewer reads thin; all nine reads like a table of contents. Pick an order that does not match the other languages — if all four share it, the build fails.

An axis looks like this. Name it, then a paragraph on each side.

> **Speed and flexibility.** Claude Code runs without a spec step. For a small bug fix, a quick refactor, or exploratory work, it is far faster. Kiro's spec generation is worth something, but it costs time. Writing a spec for a ten-minute change is overhead.

## Closing — three beats, no H2

After the last H2 come two or three paragraphs with no heading.

**Take a position.** Do not retreat into neutrality. Split it by condition.

> Here's my read. If several people are designing a new feature together, Kiro fits. If most of your work is fixing things quickly on your own, the spec step is just overhead.

**Restate the limit.** Not an apology — a boundary.

> If I get an environment where I can use it properly, I'll write that up separately. What you can compare from public material and what you can say after using something are different things.

**End on an observation larger than the topic.** Not a summary, not a moral.

> What I find interesting is that Amazon licenses Claude to power Kiro. They built an IDE that runs Anthropic's model on AWS infrastructure. That looks less like competition than like cooperation at a different layer.

## The last H2

```
## References
- [Kiro documentation](https://kiro.dev/docs/)
- [InfoQ — AWS Kiro, spec-driven AI IDE](https://www.infoq.com/news/2025/08/aws-kiro-spec-driven-agent/)
```

Same order as `sources[]` in the brief's LOCKED block. All four languages carry the same list in the same order.
