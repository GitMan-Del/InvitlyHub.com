import type { Metadata } from "next"
import { Suspense } from "react"
import SignUpClientPage from "./signup-client-page"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>}>
      <SignUpClientPage />
    </Suspense>
  )
}
