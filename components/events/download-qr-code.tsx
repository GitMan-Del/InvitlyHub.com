"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface DownloadQRCodeProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  eventTitle: string
}

export default function DownloadQRCode({ canvasRef, eventTitle }: DownloadQRCodeProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = () => {
    if (!canvasRef.current) return

    setIsDownloading(true)

    try {
      // Create a safe filename from the event title
      const safeTitle = eventTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase()
      const filename = `event_qr_${safeTitle}.png`

      // Convert canvas to data URL
      const dataUrl = canvasRef.current.toDataURL("image/png")

      // Create download link
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)

      // Trigger download
      link.click()

      // Clean up
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading QR code:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      className="w-full flex items-center justify-center mt-2"
      disabled={isDownloading}
    >
      <Download className="w-4 h-4 mr-2" />
      {isDownloading ? "Downloading..." : "Download QR Code"}
    </Button>
  )
}
