"use client"

import { useSearchParams } from "next/navigation"
import AuthForm from "@/components/auth/auth-form"

export default function SignUpClientPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect")

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="absolute top-0 w-full h-[300px] blur-[120px] bg-[#622A9A] opacity-30"></div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <AuthForm type="signup" redirectUrl={redirect} />
      </main>
    </div>
  )
}
