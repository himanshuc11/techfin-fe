import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "TechFin - Login",
  description: "Secure login for your financial account",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head><script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script></head>
      <body className={`${inter.className} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
        <Toaster richColors />
      </body>
    </html>
  )
}
