"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (mobileMenuOpen && !target.closest("#mobile-menu") && !target.closest("#menu-button")) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [mobileMenuOpen])

  // Close mobile menu when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [mobileMenuOpen])

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex items-center fixed justify-center border-b border-white/10 top-0 left-0 w-full h-fit p-3 bg-[#020103]/30 backdrop-blur-xl z-[1000]"
    >
      <div className="max-w-6xl w-full px-4 sm:px-6 flex flex-row items-center justify-between">
        <Link href="/">
          <Image className="p-1" src="/Logo.png" alt="logo" width={40} height={40} priority />
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex opacity-80 text-sm md:text-base flex-row items-center space-x-6 bg-transparent py-2 px-6 text-white border border-white/15 rounded-full">
          <li>
            <Link href="/" className="hover:text-white/70 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <Link href="#features" className="hover:text-white/70 transition-colors">
              Features
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-white/70 transition-colors">
              Company
            </Link>
          </li>
          <li>
            <Link href="#" className="hover:text-white/70 transition-colors">
              Changelog
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Button */}
        <button
          id="menu-button"
          className="md:hidden text-white p-2 focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu"
            className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-xl border-b border-white/10 p-4 md:hidden"
          >
            <ul className="flex flex-col space-y-4 text-white">
              <li>
                <Link
                  href="/"
                  className="block py-2 hover:text-white/70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="block py-2 hover:text-white/70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-2 hover:text-white/70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Company
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="block py-2 hover:text-white/70 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Changelog
                </Link>
              </li>
              <li className="pt-2 border-t border-white/10">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/auth/signin"}
                  className="block py-2 text-center bg-[#8C45FF]/40 hover:bg-[#8C45FF]/60 rounded-full transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
              </li>
            </ul>
          </div>
        )}

        {/* Dashboard Button */}
        <Link href={isLoggedIn ? "/dashboard" : "/auth/signin"} className="hidden md:block">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative opacity-90 overflow-hidden rounded-3xl border-2 border-[#1a1a1a] p-1 backdrop-blur-md bg-transparent hover:cursor-pointer"
          >
            <div
              className="relative flex items-center justify-center rounded-3xl bg-gradient-to-b backdrop-blur-md bg-[#8C45FF]/40 from-[#5a2c91] to-[#311b57] px-6 py-2 shadow-inner shadow-white/20"
              style={{
                boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.3),
                  inset 0 -1px 3px rgba(255,255,255,0.2),
                  inset 1px 0 3px rgba(255,255,255,0.2),
                  inset -1px 0 3px rgba(255,255,255,0.3)
                `,
              }}
            >
              <span className="text-white font-bold text-sm md:text-base">DASHBOARD</span>
            </div>
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}
