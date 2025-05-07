"use client"

import { useEffect } from "react"
import { setupGlobalErrorHandler } from "@/lib/utils/error-handler"

export default function ClientInit() {
  useEffect(() => {
    // Set up global error handlers
    setupGlobalErrorHandler()
  }, [])

  return null
}
