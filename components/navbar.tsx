"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"

export default function Navbar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

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

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex items-center fixed justify-center border-b border-white/10 top-0 left-0 w-full h-fit p-3 bg-[#020103]/30 backdrop-blur-xl z-50"
    >
      <div className="max-w-6xl w-full px-6 flex flex-row items-center justify-between">
        <Link href="/">
          <Image className="p-1" src="/Logo.png" alt="logo" width={40} height={40} />
        </Link>

        <ul className="hidden md:flex opacity-80 text-sm md:text-base flex-row items-center space-x-6 bg-transparent py-2 px-6 text-white border border-white/15 rounded-full">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="#features">Features</Link>
          </li>
          <li>
            <Link href="#">Company</Link>
          </li>
          <li>
            <Link href="#">Changelog</Link>
          </li>
        </ul>

        <Link href={isLoggedIn ? "/dashboard" : "/auth/signin"}>
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
