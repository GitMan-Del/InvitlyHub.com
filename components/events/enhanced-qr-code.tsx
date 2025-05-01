"use client"

import { useState, useRef } from "react"
import QRCode from "react-qr-code"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Share, FileImage, Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface EnhancedQRCodeProps {
  eventId: string
  eventTitle: string
  invitationId?: string
  baseUrl: string
  size?: number
  useInviteRoute?: boolean
}

export default function EnhancedQRCode({
  eventId,
  eventTitle,
  invitationId,
  baseUrl,
  size = 200,
  useInviteRoute = false,
}: EnhancedQRCodeProps) {
  const { toast } = useToast()
  const qrRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState<"png" | "jpg" | "svg">("png")
  const [showFormatOptions, setShowFormatOptions] = useState(false)

  // Generate QR code value (URL to event invitation)
  // If useInviteRoute is true, use the new /invites/[code] route
  // Otherwise, use the existing /events/[id] or /invitations/[id] routes
  const qrCodeValue = useInviteRoute
    ? `${baseUrl}/invites/${invitationId || eventId}`
    : invitationId
      ? `${baseUrl}/invitations/${invitationId}?event=${eventId}`
      : `${baseUrl}/events/${eventId}`

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
    if (canvas) {
      let dataUrl: string

      if (format === "svg") {
        // For SVG format
        const svgElement = document.getElementById("qr-code-svg") as SVGElement
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement)
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
          dataUrl = URL.createObjectURL(svgBlob)
        } else {
          dataUrl = canvas.toDataURL("image/png")
        }
      } else {
        // For PNG or JPG format
        const mimeType = format === "png" ? "image/png" : "image/jpeg"
        dataUrl = canvas.toDataURL(mimeType, 1.0)
      }

      const downloadLink = document.createElement("a")
      downloadLink.href = dataUrl
      downloadLink.download = `${eventTitle.replace(/\s+/g, "-").toLowerCase()}-qr-code.${format}`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      toast({
        title: "QR Code Downloaded",
        description: `The QR code has been downloaded as ${format.toUpperCase()}.`,
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
            text: "Scan this QR code to view event details and respond",
            files: [file],
          })
        } else {
          await navigator.share({
            title: `QR Code for ${eventTitle}`,
            text: "Scan this QR code to view event details and respond",
            url: qrCodeValue,
          })
        }
      } else {
        await navigator.clipboard.writeText(qrCodeValue)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)

        toast({
          title: "Link Copied",
          description: "Invitation link has been copied to clipboard.",
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      toast({
        title: "Link Copied",
        description: "Invitation link has been copied to clipboard.",
      })
    } catch (error) {
      console.error("Error copying:", error)
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Unable to copy the link. Please try again.",
      })
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div ref={qrRef} className="bg-white p-4 rounded-lg shadow-lg mb-4">
        <QRCode id="qr-code-svg" value={qrCodeValue} size={size} level="H" className="mx-auto" />
      </div>

      {/* Hidden canvas for download */}
      <div className="hidden">
        <QRCodeCanvas
          id="qr-code-canvas"
          value={qrCodeValue}
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

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="relative">
          <button
            onClick={() => setShowFormatOptions(!showFormatOptions)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition-colors"
          >
            <FileImage size={16} />
            <span>Export as {format.toUpperCase()}</span>
          </button>

          {showFormatOptions && (
            <div className="absolute top-full left-0 mt-1 bg-[#0A0A0A] border border-white/10 rounded-md shadow-lg overflow-hidden z-10">
              <button
                onClick={() => {
                  setFormat("png")
                  setShowFormatOptions(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                PNG
              </button>
              <button
                onClick={() => {
                  setFormat("jpg")
                  setShowFormatOptions(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                JPG
              </button>
              <button
                onClick={() => {
                  setFormat("svg")
                  setShowFormatOptions(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/5"
              >
                SVG
              </button>
            </div>
          )}
        </div>

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
          <span>{copied ? "Shared!" : "Share"}</span>
        </button>

        <button
          onClick={copyLink}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md transition-colors"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? "Copied!" : "Copy Link"}</span>
        </button>
      </div>

      <p className="text-center text-white/70 text-sm">
        {invitationId ? "Scan this QR code to respond to the invitation" : "Scan this QR code to view event details"}
      </p>
    </div>
  )
}
