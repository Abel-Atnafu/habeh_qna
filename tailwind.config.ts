import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee:       '#5C3D2E',
        terracotta:   '#D4845A',
        'terracotta-dark': '#B8693F',
        cream:        '#F9F5F0',
        'cream-2':    '#FBF7F2',
        beige:        '#F5EDE3',
        espresso:     '#1A0F08',
        'espresso-2': '#28190F',
        forest:       '#2F4A42',
        gold:         '#C9A961',
        'gold-dark':  '#B8954E',
        whatsapp:     '#25D366',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        amh:     ['var(--font-noto-ethiopic)', 'var(--font-dm-sans)', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26,15,8,.04), 0 8px 24px rgba(26,15,8,.06)',
        lift: '0 4px 8px rgba(26,15,8,.06), 0 18px 40px rgba(26,15,8,.12)',
        glow: '0 0 48px rgba(212,132,90,.25)',
      },
      borderRadius: {
        card:    '16px',
        'card-lg': '24px',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.22,1.2,.36,1)',
        soft:   'cubic-bezier(.4,0,.2,1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(28px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg)' },
          '33%':      { transform: 'translate(20px,-30px) rotate(5deg)' },
          '66%':      { transform: 'translate(-10px,-15px) rotate(-3deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 24px rgba(212,132,90,.35))' },
          '50%':      { filter: 'drop-shadow(0 0 56px rgba(212,132,90,.7))' },
        },
        steamRise: {
          '0%':   { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '15%':  { opacity: '0.65' },
          '100%': { opacity: '0', transform: 'translateY(-80px) scaleX(1.5)' },
        },
        loadbar: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(350%)' },
        },
        stripFlow: {
          '0%':   { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        spinSlow: {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up':    'fadeUp .9s ease both',
        'drift':      'drift 14s ease-in-out infinite',
        'drift-slow': 'drift 20s ease-in-out infinite',
        'shimmer':    'shimmer 1.6s linear infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'steam':      'steamRise 3s ease-in-out infinite',
        'steam-2':    'steamRise 3s ease-in-out infinite 1s',
        'steam-3':    'steamRise 3s ease-in-out infinite 0.5s',
        'loadbar':    'loadbar 1.4s ease-in-out infinite',
        'strip-flow': 'stripFlow 12s linear infinite',
        'spin-slow':  'spinSlow 8s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
