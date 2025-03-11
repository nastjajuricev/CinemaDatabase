import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { FilmDatabaseProvider } from "./providers"
import dynamic from "next/dynamic"
import FaviconHandler from "./favicon-handler"

const OfflineDetector = dynamic(() => import("@/components/offline-detector"), {
  ssr: false,
})

const Toaster = dynamic(() => import("@/components/toaster").then((mod) => mod.Toaster), {
  ssr: true,
})

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CineVault | Your Personal Film Collection",
  description:
    "Manage and organize your personal film collection with CineVault. Add, search, and categorize your favorite movies.",
  keywords: "film database, movie collection, film catalog, personal movies",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://cinevault.vercel.app",
    title: "CineVault | Your Personal Film Collection",
    description: "Manage and organize your personal film collection with CineVault",
    siteName: "CineVault",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CineVault - Film Database",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineVault | Your Personal Film Collection",
    description: "Manage and organize your personal film collection with CineVault",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#FF7F50",
      },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CineVault",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* Add preload for the favicon */}
        <link rel="preload" href="/favicon.svg" as="image" type="image/svg+xml" />
        {/* Add color scheme meta tag */}
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} text-base md:text-lg`}>
        <FilmDatabaseProvider>
          <FaviconHandler />
          {children}
          <OfflineDetector />
          <Toaster />
        </FilmDatabaseProvider>
      </body>
    </html>
  )
}



import './globals.css'