/** Colors come from CSS variables in src/index.css so light/dark switch with one class. */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('--bg'),
        navbar: token('--navbar'),
        surface: token('--surface'),
        subtle: token('--subtle'),
        selected: token('--selected'),
        line: token('--line'),
        ink: token('--ink'),
        rank: token('--rank'),
        muted: token('--muted'),
        placeholder: token('--placeholder'),
        accent: {
          DEFAULT: token('--accent'),
          hover: token('--accent-hover'),
          fg: token('--accent-fg'),
          soft: token('--accent-soft'),
          text: token('--accent-text'),
        },
        easy: { DEFAULT: token('--easy'), soft: token('--easy-soft') },
        medium: { DEFAULT: token('--medium'), soft: token('--medium-soft') },
        hard: { DEFAULT: token('--hard'), soft: token('--hard-soft') },
        sun: { DEFAULT: token('--sun'), soft: token('--sun-soft'), text: token('--sun-text') },
        leaf: { DEFAULT: token('--leaf'), soft: token('--leaf-soft'), text: token('--leaf-text') },
      },
      fontFamily: {
        sans: ['"Inter Variable"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', '"Liberation Mono"', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'modal-in': {
          from: { opacity: '0', transform: 'translateY(4px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'modal-in': 'modal-in 160ms ease-out',
      },
    },
  },
  plugins: [],
};
