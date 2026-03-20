import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Neon colors
        'neon-blue': '#00D4FF',
        'neon-purple': '#7C3AED',
        'neon-pink': '#FF006E',
        'neon-green': '#00FF88',
        // Dark background layers
        'void': '#050508',
        'base': '#0A0A0F',
        'elevated': '#111827',
        'surface': '#1F2937',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
        'neon-blue-lg': '0 0 30px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)',
        'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5), 0 0 40px rgba(124, 58, 237, 0.3)',
        'neon-purple-lg': '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)',
        'neon-pink': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
        'neon-pink-lg': '0 0 30px rgba(255, 0, 110, 0.5), 0 0 60px rgba(255, 0, 110, 0.3)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.5), 0 0 40px rgba(0, 255, 136, 0.3)',
        'neon-green-lg': '0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 255, 136, 0.3)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'glitch': 'glitch 0.3s ease infinite',
        'beam': 'beam-move 4s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'scan': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'beam-move': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-neon': 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 50%, #FF006E 100%)',
        'gradient-void': 'radial-gradient(ellipse at 50% 0%, #1a1a2e 0%, #050508 70%)',
        'gradient-glow': 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};

export default config;