"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import AccountDropdown from "./account-dropdown"
import type { User } from "@supabase/supabase-js"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()

        if (!error && data.user) {
          setUser(data.user)

          // Get user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.user.id)
            .single()

          if (profileData) {
            setFullName(profileData.full_name)
          }
        }
      } catch (err) {
        console.error("Failed to get user:", err)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
      } else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        setUser(null)
        setFullName(null)
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image src="/Logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
              <span className="ml-2 text-xl font-bold text-white">EventHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex opacity-80 text-sm md:text-base flex-row items-center space-x-6 bg-transparent py-2 px-6 text-white border border-white/15 rounded-full">
            <li>
              <Link href="/" className="hover:text-white/70 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/features" className="hover:text-white/70 transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link href="/company" className="hover:text-white/70 transition-colors">
                Company
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-white/70 transition-colors">
                Changelog
              </Link>
            </li>
          </ul>

          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {user ? (
                  <AccountDropdown user={user} fullName={fullName} />
                ) : (
                  <div className="hidden md:flex items-center space-x-4">
                    <Link href="/auth/signin" className="text-white hover:text-white/80 transition-colors">
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="bg-gradient-to-r from-[#9855FF] to-[#622A9A] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden bg-white/10 rounded-md p-2 text-white hover:bg-white/20 focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">{isMenuOpen ? "Close menu" : "Open menu"}</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/95 border-b border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/features"
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/company"
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Company
            </Link>
            <Link
              href="/changelog"
              className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              Changelog
            </Link>

            {!user && (
              <>
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 rounded-md text-white hover:bg-white/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="block px-3 py-2 rounded-md bg-gradient-to-r from-[#9855FF] to-[#622A9A] text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
