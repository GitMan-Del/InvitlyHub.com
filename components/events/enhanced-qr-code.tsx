"use client"

import { useState, useEffect } from "react"
import QRCode from "qrcode.react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface EnhancedQRCodeProps {
  value: string
  size?: number
  title?: string
  description?: string
  logoUrl?: string
  bgColor?: string
  fgColor?: string
  className?: string
}

export default function EnhancedQRCode({
  value,
  size = 200,
  title = "Event QR Code",
  description = "Scan this QR code to join the event",
  logoUrl,
  bgColor = "#ffffff",
  fgColor = "#000000",
  className = "",
}: EnhancedQRCodeProps) {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (!canvas) return

    const url = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = url
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "QR Code Downloaded",
      description: "The QR code has been downloaded successfully.",
      duration: 3000,
    })
  }

  const shareQRCode = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Web Share API is not supported in your browser.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    try {
      const canvas = document.getElementById("qr-code") as HTMLCanvasElement
      if (!canvas) return

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, "image/png")
      })

      const file = new File([blob], `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`, { type: "image/png" })

      await navigator.share({
        title: title,
        text: description,
        url: value,
        files: [file],
      })

      toast({
        title: "QR Code Shared",
        description: "The QR code has been shared successfully.",
        duration: 3000,
      })
    } catch (error) {
      console.error("Error sharing QR code:", error)
      toast({
        title: "Sharing failed",
        description: "There was an error sharing the QR code.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  if (!mounted) {
    return null // Prevent hydration errors
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-6 flex flex-col items-center">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">{description}</p>

        <div className="bg-white p-3 rounded-lg shadow-sm mb-4">
          <QRCode
            id="qr-code"
            value={value}
            size={size}
            bgColor={bgColor}
            fgColor={fgColor}
            level="H"
            includeMargin
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    excavate: true,
                    height: size * 0.2,
                    width: size * 0.2,
                  }
                : undefined
            }
          />
        </div>

        <div className="flex gap-2 w-full justify-center">
          <Button variant="outline" size="sm" onClick={downloadQRCode} className="flex items-center gap-1">
            <Download size={16} />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={shareQRCode} className="flex items-center gap-1">
            <Share2 size={16} />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
