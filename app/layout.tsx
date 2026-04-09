import type { Metadata, Viewport } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Smart Service Booker | Stop Calling Around, Get Matched Instantly',
  description: 'Stop wasting time. Join multiple waitlists for local services - vets, doctors, restaurants, plumbers. Get notified the moment a spot opens.',
  keywords: ['waitlist', 'booking', 'appointments', 'local services', 'healthcare', 'restaurants'],
}

export const viewport: Viewport = {
  themeColor: '#5e6ba8',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  )
}
