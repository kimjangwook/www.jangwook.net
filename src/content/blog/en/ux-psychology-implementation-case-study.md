---
title: 'UX Psychology-Based Frontend Improvements: A Practical Case Study'
description: >-
  A detailed look at implementing UX psychology principles including BlogCard
  reading time, card hover effects, Back to Top button, and reading progress bar
  with code examples.
pubDate: '2025-12-14'
heroImage: ../../../assets/blog/en-blog-list.webp
tags:
  - ux-psychology
  - frontend
  - astro
relatedPosts:
  - slug: ux-psychology-frontend-design-skill
    score: 0.89
    reason:
      ko: 웹 개발 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: Web開発分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in web development with comparable difficulty.
      zh: 在Web开发领域涵盖类似主题，难度相当。
  - slug: aeo-implementation-experience
    score: 0.89
    reason:
      ko: '웹 개발, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, architecture with comparable
        difficulty.
      zh: 在Web开发、架构领域涵盖类似主题，难度相当。
  - slug: adsense-rejection-ai-analysis-improvement
    score: 0.88
    reason:
      ko: 웹 개발 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.
      ja: Web開発分野で類似したトピックを扱い、同程度の難易度です。
      en: Covers similar topics in web development with comparable difficulty.
      zh: 在Web开发领域涵盖类似主题，难度相当。
  - slug: llm-seo-aeo-practical-implementation
    score: 0.86
    reason:
      ko: '웹 개발, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, architecture with comparable
        difficulty.
      zh: 在Web开发、架构领域涵盖类似主题，难度相当。
  - slug: chrome-devtools-mcp-performance
    score: 0.84
    reason:
      ko: '웹 개발, 아키텍처 분야에서 유사한 주제를 다루며 비슷한 난이도입니다.'
      ja: Web開発、アーキテクチャ分野で類似したトピックを扱い、同程度の難易度です。
      en: >-
        Covers similar topics in web development, architecture with comparable
        difficulty.
      zh: 在Web开发、架构领域涵盖类似主题，难度相当。
---

## Overview

This article presents a case study of applying UX psychology principles to improve user experience on a real website. We implemented improvements based on 10 core UX psychology principles including **Goal Gradient Effect**, **Von Restorff Effect**, **Fitts's Law**, and **Doherty Threshold**.

## Implemented UX Improvements

### 1. BlogCard Reading Time Calculation Enhancement

Previously, reading time was estimated based on description text length. In this improvement, we calculate **actual word count from the post body at build time** to display accurate reading time.

```typescript
// src/lib/content.ts
export function calculateReadingTime(content: string): number {
  if (!content) return 1;

  // Remove code blocks
  let cleanContent = content.replace(/```[\s\S]*?```/g, "");

  // Remove inline code
  cleanContent = cleanContent.replace(/`[^`]+`/g, "");

  // Remove HTML tags
  cleanContent = cleanContent.replace(/<[^>]+>/g, "");

  // Count CJK characters (Chinese, Japanese, Korean)
  const cjkRegex = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/g;
  const cjkCount = (cleanContent.match(cjkRegex) || []).length;

  // Count non-CJK words
  const nonCjkContent = cleanContent.replace(cjkRegex, " ");
  const wordCount = nonCjkContent.split(/\s+/).filter(w => w.length > 0).length;

  // Calculate reading time: English 200 WPM, CJK 400 CPM
  const englishMinutes = wordCount / 200;
  const cjkMinutes = cjkCount / 400;

  return Math.max(1, Math.ceil(englishMinutes + cjkMinutes));
}
```

**Applied UX Principle**: Cognitive Load Reduction - Helps users understand time commitment before engaging with content.

![BlogCard with reading time badge](../../../assets/blog/en-blog-list.webp)

### 2. Card Hover Effect (Card Lift)

Added a **subtle lift effect** on hover to BlogCard, clearly indicating the currently interacted element.

```css
/* src/styles/global.css */
.card-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

**Applied UX Principle**: Von Restorff Effect - The hovered card visually stands out from other cards.

### 3. Tag Pills

Tags on blog cards are visually grouped for better recognition.

```css
.tag-pill {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  @apply bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300;
  transition: all 0.2s ease;
}

.tag-pill:hover {
  @apply bg-blue-200 dark:bg-blue-800/50;
}
```

**Applied UX Principle**: Law of Similarity - Tags with similar styling are perceived as a group.

### 4. Reading Progress Bar

A fixed progress bar at the top of blog posts showing current reading progress.

```astro
<!-- src/components/ReadingProgress.astro -->
<div class="reading-progress-container">
  <div id="reading-progress" class="reading-progress"></div>
</div>

<script>
  const progressBar = document.getElementById('reading-progress');

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;

    progressBar.style.width = `${progress}%`;

    // Color change at 80%+ (Goal Gradient)
    if (progress >= 80) {
      progressBar.classList.add('near-complete');
    }
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
</script>
```

![Reading progress bar in blog post](../../../assets/blog/en-blog-post.webp)

**Applied UX Principles**:
- **Goal Gradient Effect**: Motivation increases as users approach completion
- **Peak-End Rule**: Celebration message at 100% creates positive memory

### 5. Back to Top Button

A button for quick navigation to the top on long pages.

```astro
<!-- src/components/BackToTop.astro -->
<button
  id="back-to-top"
  class="back-to-top touch-target"
  aria-label="Back to top"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M5 10l7-7m0 0l7 7m-7-7v18"/>
  </svg>
</button>

<script>
  const btn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
</script>
```

![Back to Top button in footer](../../../assets/blog/en-footer.webp)

**Applied UX Principles**:
- **Tesler's Law**: Reduces complexity for quick navigation
- **Fitts's Law**: 48x48px size for easy touch/click

### 6. Touch Target Optimization

Ensured all interactive elements have minimum 44x44px touch areas for mobile users.

```css
.touch-target {
  @apply min-w-[44px] min-h-[44px];
  @apply flex items-center justify-center;
}
```

**Applied UX Principle**: Fitts's Law - Larger targets are faster and more accurate to click/touch.

## Implementation Screenshots

### Homepage (Latest Posts Section)

![Home page with blog cards](../../../assets/blog/en-home.webp)

BlogCards with reading time badges and tag pills. Cards show lift effect on hover.

### Blog Post Page

![Blog post with reading progress](../../../assets/blog/en-blog-post.webp)

Reading progress bar fixed at the top, updating with scroll.

### Post Bottom Area

![Blog post bottom with back to top](../../../assets/blog/en-blog-post-bottom.webp)

Progress bar turns green when post is fully read, and Back to Top button appears.

## Applied UX Psychology Principles Summary

| Principle | Applied Component | Effect |
|-----------|------------------|--------|
| **Goal Gradient Effect** | ReadingProgress | Increased completion rate |
| **Von Restorff Effect** | BlogCard (card-lift) | Clear focus indication |
| **Fitts's Law** | TouchTarget, BackToTop | Improved touch accuracy |
| **Doherty Threshold** | Animations (<400ms) | Better responsiveness |
| **Peak-End Rule** | Completion celebration | Positive memory |
| **Tesler's Law** | BackToTop | Simplified navigation |
| **Cognitive Load** | Reading time badge | Decision support |
| **Law of Similarity** | Tag Pills | Visual grouping |
| **WCAG AA** | focus-visible | Accessibility |
| **Progressive Disclosure** | Stagger Animation | Sequential information |

## Build Verification

```bash
npm run build
# Result: 1153 page(s) built in 29.99s
# Status: Complete - No errors
```

## Conclusion

By implementing UX psychology principles into actual code, we can systematically improve user experience. Features like **accurate reading time**, **card hover effects**, and **progress bars** provide significant UX improvements with relatively simple implementations.

Next steps include analyzing actual user data (time on page, completion rate, click-through rate) to quantitatively measure improvement effects.

## References

- [Laws of UX](https://lawsofux.com/)
- [research/ux-psychology/](https://github.com/kimjangwook/www.jangwook.net/tree/main/research/ux-psychology) - Project UX psychology research documentation
