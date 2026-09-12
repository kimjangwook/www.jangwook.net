/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class', // Enable dark mode with class strategy
	theme: {
		extend: {
			colors: {
				// Keep legacy utility names mapped to the editorial semantic palette.
				primary: {
					DEFAULT: 'rgb(var(--ink-rgb) / <alpha-value>)',
					dark: 'rgb(var(--slate-rgb) / <alpha-value>)',
					light: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
				},
				accent: {
					DEFAULT: 'rgb(var(--accent-rgb) / <alpha-value>)',
					dark: 'rgb(var(--accent-dark-rgb) / <alpha-value>)',
					light: 'rgb(var(--accent-rgb) / <alpha-value>)',
				},
				secondary: {
					DEFAULT: 'rgb(var(--muted-rgb) / <alpha-value>)',
					dark: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
					light: 'rgb(var(--ink-3-rgb) / <alpha-value>)',
				},
				success: {
					DEFAULT: 'rgb(var(--success-rgb) / <alpha-value>)',
					dark: 'rgb(var(--success-rgb) / <alpha-value>)',
					light: 'rgb(var(--success-rgb) / <alpha-value>)',
				},
				gray: {
					50: 'rgb(var(--surface-rgb) / <alpha-value>)',
					100: 'rgb(var(--surface-rgb) / <alpha-value>)',
					200: 'rgb(var(--paper-rule-rgb) / <alpha-value>)',
					300: 'rgb(var(--paper-edge-rgb) / <alpha-value>)',
					400: 'rgb(var(--ink-4-rgb) / <alpha-value>)',
					500: 'rgb(var(--muted-rgb) / <alpha-value>)',
					600: 'rgb(var(--ink-2-rgb) / <alpha-value>)',
					700: 'rgb(var(--ink-rgb) / <alpha-value>)',
					800: 'rgb(var(--slate-2-rgb) / <alpha-value>)',
					900: 'rgb(var(--slate-rgb) / <alpha-value>)',
				},
			},
			fontFamily: {
				sans: ['var(--font-sans)'],
				serif: ['var(--font-serif)'],
				mono: ['var(--font-mono)'],
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
