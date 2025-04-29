"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import AuthForm from "@/components/auth/auth-form"

export default function SignInClientPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="absolute top-0 w-full h-[300px] blur-[120px] bg-[#622A9A] opacity-30"></div>

      <main className="flex-grow flex items-center justify-center p-6 relative z-10">
        <AuthForm type="signin" />
      </main>
    </div>
  )
}
