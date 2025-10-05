// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.jangwook.net',
	integrations: [mdx(), sitemap(), tailwind()],
	image: {
		// 이미지 최적화 설정
		service: {
			entrypoint: 'astro/assets/services/sharp',
		},
	},
	build: {
		// CSS 인라인 임계값 (4KB 이하는 인라인)
		inlineStylesheets: 'auto',
	},
	vite: {
		// CSS 코드 분할 활성화
		build: {
			cssCodeSplit: true,
			// 청크 크기 경고 임계값
			chunkSizeWarningLimit: 600,
		},
	},
});
