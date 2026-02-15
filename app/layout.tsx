import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'



const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'DreamPlay One - Crowdfunding Campaign',
  description: 'Back the DreamPlay One keyboard with narrower keys designed for your handspan. Stop over-stretching.',
  generator: 'v0.app',
  icons: {
    icon: '/ICON Black SQUARE.jpg',
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {


  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
        <Script
          src="https://data.dreamplaypianos.com/tracker.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
