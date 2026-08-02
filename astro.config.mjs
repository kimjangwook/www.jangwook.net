// @ts-check

import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { visit } from "unist-util-visit";

// GFM 태스크 리스트(`- [ ] 항목`)는 disabled checkbox 하나만 남기고 라벨을 만들지 않는다.
// axe-core `label` 규칙(WCAG 2.2 SC 4.1.2) 위반이 되므로, 같은 li의 텍스트를
// 접근 가능한 이름으로 붙인다. 2026-08-02 전수 감사에서 907개 노드가 잡혀 상설화.
function rehypeTaskListLabels() {
  /** @type {(node: any) => string} */
  const textOf = (node) => {
    if (node.type === "text") return node.value;
    if (!node.children) return "";
    return node.children.map(textOf).join("");
  };

  /** @param {any} tree */
  return (tree) => {
    visit(tree, "element", (/** @type {any} */ node) => {
      if (node.tagName !== "li") return;
      const box = node.children?.find(
        (/** @type {any} */ child) =>
          child.type === "element" &&
          child.tagName === "input" &&
          child.properties?.type === "checkbox"
      );
      if (!box || box.properties.ariaLabel) return;
      const label = textOf(node).replace(/\s+/g, " ").trim();
      if (!label) return;
      box.properties.ariaLabel = label.slice(0, 120);
    });
  };
}

// https://astro.build/config
export default defineConfig({
  site: "https://jangwook.net",
  integrations: [mdx(), tailwind()],
  markdown: {
    rehypePlugins: [rehypeTaskListLabels],
  },
  image: {
    // 이미지 최적화 설정
    service: {
      entrypoint: "astro/assets/services/sharp",
    },
  },
  build: {
    // CSS 인라인 임계값 (4KB 이하는 인라인)
    inlineStylesheets: "auto",
  },
  vite: {
    // CSS 코드 분할 활성화
    build: {
      cssCodeSplit: true,
      // 청크 크기 경고 임계값
      chunkSizeWarningLimit: 600,
    },
    cacheDir: '/tmp/vite-cache-confident',
  },
});
