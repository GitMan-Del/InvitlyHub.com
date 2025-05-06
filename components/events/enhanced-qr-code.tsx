"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface EnhancedQRCodeProps {
  value: string
  title?: string
  size?: number
  bgColor?: string
  fgColor?: string
  level?: "L" | "M" | "Q" | "H"
  includeMargin?: boolean
}

export function EnhancedQRCode({
  value,
  title = "QR Code",
  size = 200,
  bgColor = "#ffffff",
  fgColor = "#000000",
  level = "M",
  includeMargin = true,
}: EnhancedQRCodeProps) {
  const [isMounted, setIsMounted] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return

    try {
      // Get the SVG element
      const svgElement = qrCodeRef.current.querySelector("svg")
      if (!svgElement) return

      // Create a canvas element
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      if (!context) return

      // Set canvas dimensions
      canvas.width = size
      canvas.height = size

      // Create an image from the SVG
      const image = new Image()
      image.src = "data:image/svg+xml;base64," + btoa(new XMLSerializer().serializeToString(svgElement))

      image.onload = () => {
        // Draw the image on the canvas
        context.drawImage(image, 0, 0)

        // Convert canvas to data URL and download
        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `${title.replace(/\s+/g, "-").toLowerCase()}-qr-code.png`
        link.href = dataUrl
        link.click()

        toast({
          title: "QR Code Downloaded",
          description: "The QR code has been saved to your device.",
        })
      }
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "There was an error downloading the QR code.",
      })
    }
  }

  if (!isMounted) {
    return <div className="w-full h-[200px] bg-gray-100 animate-pulse rounded-md"></div>
  }

  return (
    <div className="flex flex-col items-center p-4 border rounded-lg bg-white">
      <div ref={qrCodeRef} className="mb-4">
        <QRCodeSVG
          value={value}
          size={size}
          bgColor={bgColor}
          fgColor={fgColor}
          level={level}
          includeMargin={includeMargin}
        />
      </div>
      <div className="flex justify-center w-full">
        <Button variant="outline" onClick={downloadQRCode} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
      </div>
    </div>
  )
}

export default EnhancedQRCode
