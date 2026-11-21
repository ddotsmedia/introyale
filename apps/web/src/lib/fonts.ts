import localFont from 'next/font/local'

// Self-hosted, open-licence fonts (D14). No runtime request to Google.
export const fraunces = localFont({
  variable: '--font-fraunces',
  display: 'swap',
  src: [
    { path: '../fonts/fraunces-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/fraunces-600.woff2', weight: '600', style: 'normal' },
  ],
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

export const inter = localFont({
  variable: '--font-inter',
  display: 'swap',
  src: [
    { path: '../fonts/inter-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/inter-500.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/inter-600.woff2', weight: '600', style: 'normal' },
  ],
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

export const plexArabic = localFont({
  variable: '--font-plex-arabic',
  display: 'swap',
  src: [
    { path: '../fonts/plex-arabic-400.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/plex-arabic-500.woff2', weight: '500', style: 'normal' },
  ],
  fallback: ['Noto Naskh Arabic', 'sans-serif'],
})
