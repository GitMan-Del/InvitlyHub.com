"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function SessionRecovery() {
  const [isRecovering, setIsRecovering] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    // Check if there was an auth error
    const hasAuthError = localStorage.getItem("auth_error") === "true"

    if (hasAuthError && !isRecovering) {
      setIsRecovering(true)

      // Clear the auth error flag
      localStorage.removeItem("auth_error")

      // Don't show toast on auth pages
      if (!pathname?.startsWith("/auth/")) {
        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
        })

        // Redirect to sign in page
        router.push("/auth/signin")
      }

      setIsRecovering(false)
    }
  }, [router, pathname, toast, isRecovering])

  return null
}
