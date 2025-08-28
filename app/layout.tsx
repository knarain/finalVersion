import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === "production"
      ? "https://rashmiphotography.com"
      : "http://localhost:3000"
  ),
  title: "Rashmi Photography - Capturing Happiness | Professional Wedding & Portrait Photographer",
  description:
    "Professional photography services in Hyderbad & Bengaluru, India. Specializing in weddings, portraits, and landscape photography. Capturing your most precious memories with artistic vision and technical excellence.",
  keywords:
    "photography, wedding photographer, portrait photographer, Hyderbad & Bengaluru photographer, professional photography, wedding photography, engagement photography",
  authors: [{ name: "Rashmi", url: "https://rashmiphotography.com" }],
  creator: "Rashmi Photography",
  publisher: "Rashmi Photography",
  openGraph: {
    title: "Rashmi Photography - Capturing Happiness",
    description:
      "Professional photography services specializing in weddings, portraits, and landscapes in Hyderbad & Bengaluru, India.",
    url: "https://rashmiphotography.com",
    siteName: "Rashmi Photography",
    images: [
      {
        url: "/aerial-view-of-couple-walking-on-beach-with-golden.png",
        width: 1200,
        height: 630,
        alt: "Rashmi Photography - Professional Wedding Photography",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rashmi Photography - Capturing Happiness",
    description: "Professional photography services specializing in weddings, portraits, and landscapes.",
    images: ["/aerial-view-of-couple-walking-on-beach-with-golden.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} dark antialiased`}>{children}</body>
    </html>
  )
}
