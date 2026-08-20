import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { PWARegister } from '@/components/pwa-register'
import { MotionConfigProvider } from '@/components/motion-config-provider'
import { NativeShell } from '@/components/native-shell'
import './globals.css'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // Matches --background in globals.css for light and dark, so the iOS status
  // bar and PWA chrome don't seam against the app surface. The runtime value is
  // kept in step by applyTheme() when the user overrides the OS setting.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F2' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1918' },
  ],
}

export const metadata: Metadata = {
  title: 'Sol Cycle',
  description:
    'Privacy-first cycle tracking. Log your period, symptoms, and mood — all on your device, no account needed.',
  applicationName: 'Sol Cycle',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Sol Cycle',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    // suppressHydrationWarning: the inline script below sets `class` and
    // `color-scheme` on <html> before React hydrates, so the server markup
    // deliberately differs from the client. The warning is expected here and
    // only applies to this element's own attributes.
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/*
          Applies the stored theme before first paint, so a dark-mode user
          doesn't get a flash of the light palette on every launch. Mirrors
          lib/theme.ts — keep the two in step.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t='system';var r=localStorage.getItem('sol-cycle-preferences');if(r){var p=JSON.parse(r).theme;if(p==='light'||p==='dark'||p==='system')t=p}var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <MotionConfigProvider>{children}</MotionConfigProvider>
        <PWARegister />
        <NativeShell />
      </body>
    </html>
  )
}
