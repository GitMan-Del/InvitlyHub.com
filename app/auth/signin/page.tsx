import type { Metadata } from "next"
import { Suspense } from "react"
import SignInClientPage from "./SignInClientPage"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your account",
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">Loading...</div>}>
      <SignInClientPage />
    </Suspense>
  )
}
