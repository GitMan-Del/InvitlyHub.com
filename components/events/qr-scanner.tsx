"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"

interface QRScannerProps {
  onClose?: () => void
}

export default function QRScanner({ onClose }: QRScannerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null

    const startScanner = async () => {
      try {
        setScanning(true)
        setError(null)

        html5QrCode = new Html5Qrcode("qr-reader")

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Handle the scanned code
            handleScan(decodedText)
            if (html5QrCode) {
              html5QrCode.stop().catch((error) => console.error("Error stopping scanner:", error))
            }
          },
          (errorMessage) => {
            // QR code scan error (usually just means no QR code in view)
            console.log(errorMessage)
          },
        )
      } catch (err) {
        console.error("Error starting scanner:", err)
        setError("Could not access camera. Please ensure you've granted camera permissions.")
        setScanning(false)
      }
    }

    startScanner()

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch((error) => console.error("Error stopping scanner:", error))
      }
    }
  }, [])

  const handleScan = (result: string) => {
    setScanning(false)

    try {
      // Check if the scanned URL is from our application
      const url = new URL(result)

      // Extract event ID or invitation code from URL based on the path pattern
      const pathSegments = url.pathname.split("/")

      // Handle different URL patterns
      if (pathSegments.length >= 3) {
        if (pathSegments[1] === "events") {
          // Event URL: /events/[id]
          const eventId = pathSegments[2]
          toast({
            title: "Event QR Code Scanned",
            description: `Navigating to event details`,
          })
          router.push(`/events/${eventId}`)
        } else if (pathSegments[1] === "invitations") {
          // Invitation URL: /invitations/[id]
          const invitationId = pathSegments[2]
          toast({
            title: "Invitation QR Code Scanned",
            description: `Navigating to invitation response`,
          })
          router.push(`/invitations/${invitationId}${url.search}`)
        } else if (pathSegments[1] === "invites") {
          // New invitation URL: /invites/[code]
          const inviteCode = pathSegments[2]
          toast({
            title: "Invitation QR Code Scanned",
            description: `Navigating to invitation response`,
          })
          router.push(`/invites/${inviteCode}`)
        } else {
          // Handle external URLs or invalid formats
          toast({
            title: "Valid QR Code",
            description: `Scanned URL: ${result}`,
          })
          // Optionally open the URL
          window.open(result, "_blank")
        }
      } else {
        // Handle external URLs or invalid formats
        toast({
          title: "Valid QR Code",
          description: `Scanned URL: ${result}`,
        })
        // Optionally open the URL
        window.open(result, "_blank")
      }
    } catch (error) {
      // Not a URL, might be just an event code
      toast({
        title: "QR Code Scanned",
        description: `Content: ${result}`,
      })

      // Try to interpret as an event or invitation code
      if (result.length >= 6 && result.length <= 36) {
        router.push(`/invites/${result}`)
      }
    }

    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="bg-black text-white p-4 rounded-xl flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4">
        <button onClick={onClose} className="flex items-center text-white/70 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        <h2 className="text-xl font-bold">Scan QR Code</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm w-full">
          {error}
        </div>
      )}

      <div
        id="qr-reader"
        className="w-full max-w-sm aspect-square bg-black/50 border border-white/10 rounded-lg overflow-hidden"
      ></div>

      <p className="mt-4 text-white/70 text-center text-sm">Position the QR code within the frame to scan</p>
    </div>
  )
}
