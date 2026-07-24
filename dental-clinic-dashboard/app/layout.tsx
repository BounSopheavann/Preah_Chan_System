import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dental Clinic Dashboard',
  description: 'Professional dental clinic management system',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: '/Logo.png',
    shortcut: '/Logo.png',
    apple: '/Logo.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Preah Chan',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#f5f7fa" />
      </head>
      <body className="antialiased bg-background" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">{`
          (function () {
            try {
              var storageKey = 'dental-dashboard-theme';
              var storedTheme = localStorage.getItem(storageKey);
              var theme = storedTheme === 'light' || storedTheme === 'dark'
                ? storedTheme
                : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

              var root = document.documentElement;
              root.classList.toggle('dark', theme === 'dark');
              root.style.colorScheme = theme;

              var themeColor = document.querySelector('meta[name="theme-color"]');
              if (themeColor) {
                themeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f5f7fa');
              }
            } catch (error) {}
          })();
        `}</Script>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
