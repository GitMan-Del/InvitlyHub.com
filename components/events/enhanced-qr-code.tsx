"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface EnhancedQRCodeProps {
  value: string
  size?: number
  logoUrl?: string
  logoSize?: number
  logoBackgroundColor?: string
  foregroundColor?: string
  backgroundColor?: string
}

export default function EnhancedQRCode({
  value,
  size = 200,
  logoUrl,
  logoSize = 50,
  logoBackgroundColor = "#FFFFFF",
  foregroundColor = "#000000",
  backgroundColor = "#FFFFFF",
}: EnhancedQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const generateQR = async () => {
      try {
        // Generate QR code on canvas
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 1,
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
        })

        // If logo is provided, add it to the center of the QR code
        if (logoUrl && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d")
          if (!ctx) return

          const logo = new Image()
          logo.crossOrigin = "anonymous" // Prevent CORS issues

          logo.onload = () => {
            // Calculate center position
            const centerX = (size - logoSize) / 2
            const centerY = (size - logoSize) / 2

            // Draw white background for logo
            ctx.fillStyle = logoBackgroundColor
            ctx.fillRect(centerX - 5, centerY - 5, logoSize + 10, logoSize + 10)

            // Draw logo
            ctx.drawImage(logo, centerX, centerY, logoSize, logoSize)
          }

          logo.src = logoUrl
        }
      } catch (error) {
        console.error("Error generating QR code:", error)
      }
    }

    generateQR()
  }, [value, size, logoUrl, logoSize, logoBackgroundColor, foregroundColor, backgroundColor])

  return <canvas ref={canvasRef} />
}
