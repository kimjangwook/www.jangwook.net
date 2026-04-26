/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Enable dark mode with class strategy
	theme: {
		extend: {
			colors: {
				// AI/생산성 블로그 컬러 스킴
				primary: {
					DEFAULT: '#2c3039',
					dark: '#1f232b',
					light: '#4d5663',
				},
				accent: {
					DEFAULT: '#2aa8c7',
					dark: '#176985',
					light: '#8bd9e7',
				},
				secondary: {
					DEFAULT: '#8B5CF6',
					dark: '#7C3AED',
					light: '#A78BFA',
				},
				success: {
					DEFAULT: '#10B981',
					dark: '#059669',
					light: '#34D399',
				},
				gray: {
					50: '#F9FAFB',
					100: '#F3F4F6',
					200: '#E5E7EB',
					300: '#D1D5DB',
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563',
					700: '#374151',
					800: '#1F2937',
					900: '#111827',
				},
			},
			fontFamily: {
				sans: ['Geist', 'Noto Sans KR', 'Noto Sans JP', 'sans-serif'],
				serif: ['Newsreader', 'Noto Serif KR', 'Noto Serif JP', 'Noto Serif SC', 'Iowan Old Style', 'Georgia', 'serif'],
				mono: ['Geist Mono', 'JetBrains Mono', 'Consolas', 'monospace'],
			},
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1' }],
			},
			spacing: {
				'128': '32rem',
				'144': '36rem',
			},
			borderRadius: {
				'4xl': '2rem',
			},
		},
	},
	plugins: [],
}
