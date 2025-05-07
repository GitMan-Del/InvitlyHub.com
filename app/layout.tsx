import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import ClientInit from "@/components/client-init"
import SessionRecovery from "@/components/auth/session-recovery"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Event Management App",
  description: "A modern event management application",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Initialize client-side error handlers */}
        <ClientInit />

        {/* Handle session recovery */}
        <SessionRecovery />

        {children}
        <Toaster />
      </body>
    </html>
  )
}
