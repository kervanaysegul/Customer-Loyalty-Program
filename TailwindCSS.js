// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        stellar: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        loyalty: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          gold: '#f59e0b',
          silver: '#6b7280',
          bronze: '#92400e',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'stellar-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'loyalty-gradient': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          'from': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(139, 92, 246, 0.8)' },
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.5)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.6)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

// app/globals.css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-family: 'Inter', system-ui, sans-serif;
  }
  
  body {
    @apply bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900;
    @apply text-white antialiased;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  }
  
  .btn-primary {
    @apply bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600;
    @apply text-white font-semibold py-3 px-6 rounded-full;
    @apply transition-all duration-300 transform hover:scale-105;
    @apply shadow-lg hover:shadow-glow;
  }
  
  .btn-secondary {
    @apply bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600;
    @apply text-white font-semibold py-3 px-6 rounded-full;
    @apply transition-all duration-300 transform hover:scale-105;
  }
  
  .btn-success {
    @apply bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600;
    @apply text-white font-semibold py-3 px-6 rounded-full;
    @apply transition-all duration-300 transform hover:scale-105;
  }
  
  .btn-danger {
    @apply bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600;
    @apply text-white font-semibold py-3 px-6 rounded-full;
    @apply transition-all duration-300 transform hover:scale-105;
  }
  
  .input-glass {
    @apply bg-white/20 backdrop-blur-sm border border-white/30;
    @apply text-white placeholder-gray-300 rounded-lg px-4 py-3;
    @apply focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20;
    @apply transition-all duration-300;
  }
  
  .balance-card {
    @apply bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500;
    @apply rounded-xl p-6 text-center text-white;
    @apply shadow-lg transform hover:scale-105 transition-all duration-300;
  }
  
  .feature-card {
    @apply glass-card p-6 text-center hover:bg-white/20;
    @apply transition-all duration-300 transform hover:scale-105;
    @apply group cursor-pointer;
  }
  
  .nav-link {
    @apply text-white/80 hover:text-white transition-colors duration-300;
    @apply hover:underline underline-offset-4;
  }
  
  .loading-spinner {
    @apply inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full;
    animation: spin 1s linear infinite;
  }
  
  .glow-text {
    @apply bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent;
    text-shadow: 0 0 30px rgba(168, 85, 247, 0.5);
  }
  
  .floating-element {
    animation: float 6s ease-in-out infinite;
  }
  
  .pulse-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }
}

@layer utilities {
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .text-shadow-lg {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .backdrop-blur-glass {
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  
  .border-gradient {
    border-image: linear-gradient(45deg, #667eea, #764ba2) 1;
  }
  
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}

/* Custom animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes glow {
  from { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
  to { box-shadow: 0
