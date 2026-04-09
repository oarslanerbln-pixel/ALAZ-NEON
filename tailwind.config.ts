import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      colors: {
        neonGreen: '#39FF14',
        neonPink: '#FF3D96',
        neonBlue: '#1F8EF1',
        neonPurple: '#A45EBE',
        darkBackground: '#1A1A2E',
        darkAccent: '#0F3460',
      },
      animation: {
        'pulse-neon': 'pulse 1s infinite',
      },
      keyframes: {
        pulse: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;