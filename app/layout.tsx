import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"], display: "swap" })

export const metadata: Metadata = {
  title: "InvitlyHub.com",
  description: "Easy to design invitations for any event and track your guest responses in real-time",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster />
        {/* Polyfill for older browsers */}
        <Script id="browser-compatibility" strategy="beforeInteractive">
          {`
            // Object-fit polyfill for IE and Edge
            if (typeof window !== 'undefined' && !('objectFit' in document.documentElement.style)) {
              document.addEventListener('DOMContentLoaded', function() {
                Array.prototype.forEach.call(
                  document.querySelectorAll('img[data-object-fit]'),
                  function(image) {
                    (image.runtimeStyle || image.style).background = 'url("' + image.src + '") no-repeat 50%/' + (image.dataset.objectFit || 'cover');
                    image.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="' + image.width + '" height="' + image.height + '"%3E%3C/svg%3E';
                  }
                );
              });
            }
            
            // Smooth scroll polyfill
            if (typeof window !== 'undefined' && !('scrollBehavior' in document.documentElement.style)) {
              import('scroll-behavior-polyfill');
            }
          `}
        </Script>
      </body>
    </html>
  )
}
