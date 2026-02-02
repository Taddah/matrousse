import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'primary-blue': '#1e3a8a',
				'secondary-yellow': '#fef08a',
				'accent-pink': '#fbcfe8',
				'success-green': '#059669',
				'bg-paper': '#fafafa',
				'border-ink': '#e2e8f0'
			}
		}
	},
	plugins: []
} satisfies Config;
