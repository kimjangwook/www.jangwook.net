---
title: Enhancing Frontend Design Skills with UX Psychology
description: >-
  Learn how to integrate 40 UX psychology concepts and 30 Laws of UX into Claude
  Code frontend-design skill to create beautiful and effective interfaces.
pubDate: '2025-12-13'
heroImage: ../../../assets/blog/ux-psychology-skill.png
tags:
  - ux
  - claude-code
  - frontend
relatedPosts:
  - slug: aeo-implementation-experience
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: adsense-rejection-ai-analysis-improvement
    score: 0.93
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: llm-seo-aeo-practical-implementation
    score: 0.92
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: llm-blog-automation
    score: 0.9
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
  - slug: agent-effi-flow-pivot-omotenashi-bot
    score: 0.89
    reason:
      ko: '웹 개발, AI/ML 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、AI/ML分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, AI/ML with comparable
        difficulty.
      zh: 在Web开发、AI/ML领域涵盖类似主题，难度相当。
---

## Background: The Limitations of AI-Generated UI

If you've used Claude Code, you've probably noticed that AI-generated UIs often have that distinctive "AI smell." Inter fonts, purple gradients, predictable layouts... Functionally working but somehow bland and unmemorable designs.

To solve this problem, I found inspiration from [nori0724's article on Qiita](https://qiita.com/nori0724/items/5c1aa2a5d5327bb68b6c). The key insight: providing UX psychology context to AI dramatically improves the quality of generated UIs.

## Research: 70+ UX Psychology Principles

I researched two major sources:

### 1. shokasonjuku.com - 40 UX Psychology Concepts

From this Japanese source, I compiled concepts in the following categories:

| Category | Key Concepts |
|----------|--------------|
| Cognition | Cognitive Load, Selective Attention, Banner Blindness |
| Decision Making | Anchor Effect, Decoy Effect, Default Bias |
| Motivation | Loss Aversion, Scarcity, Gamification |
| User Experience | Doherty Threshold, Labor Illusion, Peak-End Rule |
| Trust | Social Proof, Halo Effect, Endowment Effect |

### 2. Laws of UX - 30 Laws

Scientific, evidence-based UX laws compiled by Jon Yablonski:

- <strong>Doherty Threshold</strong>: Response within 0.4 seconds maintains engagement
- <strong>Hick's Law</strong>: More choices = longer decision time
- <strong>Miller's Law</strong>: Working memory capacity of 7±2 items
- <strong>Fitts's Law</strong>: Larger, closer targets are easier to click
- <strong>Gestalt Principles</strong>: Proximity, Similarity, Continuity, Closure

## Analysis: Problems with the Existing Skill

After analyzing the existing `frontend-design` skill:

### Strengths
- Creative visual design guidelines
- "AI slop" avoidance instructions
- Encouragement of bold aesthetic decisions

### Weaknesses (Missing Principles)

```
Cognition         ❌ Not included
Responsiveness    ❌ Not included
Feedback          ⚠️ Partial
User Psychology   ❌ Not included
Accessibility     ❌ Not included
```

<strong>Core Problem</strong>: UIs could be beautiful but difficult to use.

## Implementation: UX Psychology Integrated Skill

### New Skill Structure

````markdown
## Design Thinking Framework
1. Purpose & Context - Goals and success metrics
2. Aesthetic Direction - Visual direction (preserved)
3. UX Psychology Strategy - Psychology strategy (new)

## UX Psychology Toolkit
1. Responsiveness (Doherty Threshold, Skeleton Loading)
2. Cognitive Load (Miller's Law, Chunking)
3. Visual Hierarchy (F/Z Patterns, Proximity)
4. Persuasion (Social Proof, Scarcity, Anchoring)
5. Motivation (Goal Gradient, Zeigarnik, Peak-End)
6. Accessibility (WCAG AA, Keyboard Navigation)
````

### Key Additions

#### 1. Responsiveness Guidelines

```tsx
// Time thresholds
const THRESHOLDS = {
  INSTANT: 100,      // Direct response
  FAST: 400,         // Doherty threshold
  ACCEPTABLE: 1000,  // Show loading
  SLOW: 10000,       // Show progress
};

// Skeleton loading pattern
const ProductCard = ({ isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }
  // ...
};
```

#### 2. Persuasion Psychology Patterns

```tsx
// Social proof
<div className="flex items-center gap-2 text-sm">
  <span className="pulse-dot bg-green-500" />
  <span>127 people purchased in the last 24 hours</span>
</div>

// Scarcity
{stockCount <= 10 && (
  <span className="text-orange-600 font-medium">
    🔥 Only {stockCount} left
  </span>
)}

// Anchoring (pricing)
<span className="line-through text-gray-400">$199</span>
<span className="text-4xl font-bold text-blue-600">$99</span>
```

#### 3. Page-Type Checklists

| Page Type | Checklist Items |
|-----------|-----------------|
| Landing | First content within 0.4s, Social proof, Single CTA |
| Product | Anchoring, Scarcity, Skeleton loading |
| Form | Multi-step split, Progress bar, Success screen |
| Dashboard | Information chunking, Progressive disclosure, Incomplete emphasis |

## Expected Results

### Quantitative Improvements

- Conversion Rate (CVR): +20〜40%
- Form Completion Rate: +30%
- Bounce Rate: -25%
- Average Order Value: +15%

### Qualitative Improvements

- Enhanced user satisfaction
- Improved inclusivity through accessibility
- Better developer experience (clear guidelines)

## Conclusion

<strong>Beauty without usability is art. Usability without beauty is engineering. Great design is both.</strong>

By integrating UX psychology into the frontend-design skill:

1. Preserved existing strengths (creative visual design)
2. Added scientifically-backed UX principles
3. Provided practical code examples and checklists
4. Defined measurable performance metrics

Now the UIs Claude Code generates are not just "pretty" but "effective."

## References

- [Laws of UX](https://lawsofux.com/)
- [shokasonjuku UX Psychology](https://www.shokasonjuku.com/ux-psychology)
- [Qiita - Claude Code UX Integration Case](https://qiita.com/nori0724/items/5c1aa2a5d5327bb68b6c)
- [Nielsen Norman Group](https://www.nngroup.com/topic/psychology-and-ux/)
