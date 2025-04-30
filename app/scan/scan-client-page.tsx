"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import QRScanner from "@/components/events/qr-scanner"

export default function ScanClientPage() {
  const [showScanner, setShowScanner] = useState(true)

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="absolute top-0 w-full h-[300px] blur-[120px] bg-[#622A9A] opacity-30"></div>

      <header className="bg-[#0A0A0A] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center text-white/70 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {showScanner ? (
            <QRScanner onClose={() => setShowScanner(false)} />
          ) : (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Scanner Closed</h2>
              <p className="text-white/70 mb-6">You've closed the QR code scanner.</p>
              <button
                onClick={() => setShowScanner(true)}
                className="bg-[#9855FF] hover:bg-[#8144E5] text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Open Scanner Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
