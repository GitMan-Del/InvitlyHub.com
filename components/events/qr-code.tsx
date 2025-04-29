"use client"

import { useState, useRef } from "react"
import QRCode from "react-qr-code"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Share } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface QRCodeDisplayProps {
  value: string
  eventTitle: string
  size?: number
}

export default function QRCodeDisplay({ value, eventTitle, size = 200 }: QRCodeDisplayProps) {
  const { toast } = useToast()
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${eventTitle.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      toast({
        title: "QR Code Downloaded",
        description: "The QR code has been downloaded successfully.",
      })
    }
  }

  const shareQRCode = async () => {
    try {
      if (navigator.share) {
        const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
        if (canvas) {
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob)
              }
            }, "image/png")
          })

          const file = new File([blob], `${eventTitle}-qr-code.png`, { type: "image/png" })

          await navigator.share({
            title: `QR Code for ${eventTitle}`,
            text: "Scan this QR code to view event details",
            files: [file],
          })
        } else {
          await navigator.share({
            title: `QR Code for ${eventTitle}`,
            text: "Scan this QR code to view event details",
            url: value,
          })
        }
      } else {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Link Copied",
          description: "Event link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error("Error sharing:", error)
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: "Unable to share the QR code. Try copying the link instead.",
      })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <QRCode value={value} size={size} level="H" className="mx-auto" />
      </div>

      {/* Hidden canvas for download */}
      <div className="hidden">
        <QRCodeCanvas
          id="qr-code-canvas"
          value={value}
          size={size * 2} // Higher resolution for download
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/Logo.png",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
      </div>

      <div className="flex space-x-2">
        <button
          onClick={downloadQRCode}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition-colors"
        >
          <Download size={16} />
          <span>Download</span>
        </button>

        <button
          onClick={shareQRCode}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition-colors"
        >
          <Share size={16} />
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
      </div>

      <p className="mt-4 text-center text-white/70 text-sm">Scan this QR code to view event details</p>
    </div>
  )
}
