import type { Metadata } from 'next'
import { Inter, Playfair_Display, Merriweather } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

// 1. Configure Fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const merriweather = Merriweather({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Christ University Newsletter',
  description: 'Official digital newsletter and articles platform.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfair.variable} ${merriweather.variable}`}>
      <body className="flex flex-col min-h-screen bg-cream-50">
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  )
}