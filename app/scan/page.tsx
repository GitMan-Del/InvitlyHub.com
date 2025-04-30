import type { Metadata } from "next"
import ScanClientPage from "./scan-client-page"

export const metadata: Metadata = {
  title: "Scan QR Code",
  description: "Scan event QR codes",
}

export default function ScanPage() {
  return <ScanClientPage />
}
