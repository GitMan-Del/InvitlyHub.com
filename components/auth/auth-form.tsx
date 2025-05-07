"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { createClient, handleAuthError } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

type AuthFormProps = {
  type: "signin" | "signup"
  redirectUrl?: string | null
}

export default function AuthForm({ type, redirectUrl }: AuthFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for error parameter in URL
  useEffect(() => {
    const errorMessage = searchParams.get("error")
    if (errorMessage) {
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: errorMessage,
      })
    }
  }, [searchParams, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (type === "signup") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`,
          },
        })

        if (authError) throw authError

        // Create a profile record for the new user
        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").insert({
            id: authData.user.id,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          })

          if (profileError) {
            console.error("Error creating profile:", profileError)
          }
        }

        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your signup.",
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // Redirect to the specified URL or dashboard
        if (redirectUrl) {
          router.push(redirectUrl)
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
    } catch (error: any) {
      const errorMessage = handleAuthError(error)
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-black/80 border border-white/15 backdrop-blur-xl p-8 rounded-2xl shadow-lg"
      >
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {type === "signin" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400">
            {type === "signin" ? "Sign in to access your account" : "Sign up to get started with our platform"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === "signup" && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-black/50 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#9855FF] to-[#622A9A] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {type === "signin" ? "Signing in..." : "Signing up..."}
              </span>
            ) : (
              <>{type === "signin" ? "Sign In" : "Sign Up"}</>
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            {type === "signin" ? "Don't have an account? " : "Already have an account? "}
            <Link
              href={
                type === "signin"
                  ? `/auth/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`
                  : `/auth/signin${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`
              }
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {type === "signin" ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
