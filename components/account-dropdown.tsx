"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, LogOut, UserIcon, Bell, HelpCircle } from "lucide-react"

interface AccountDropdownProps {
  user: User
  fullName?: string | null
}

export default function AccountDropdown({ user, fullName }: AccountDropdownProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)
      await supabase.auth.signOut()
      router.refresh()
      router.push("/auth/signin")
    } catch (error) {
      console.error("Sign out error:", error)

      // Check if it's a refresh token error
      if (error.message?.includes("refresh_token") || error.status === 400) {
        // Clear any auth-related items
        if (typeof window !== "undefined") {
          localStorage.removeItem("supabase.auth.token")
          localStorage.removeItem("supabase.auth.refreshToken")
        }

        toast({
          title: "Session expired",
          description: "Your session has expired. Please sign in again.",
        })

        router.push("/auth/signin")
      } else {
        toast({
          variant: "destructive",
          title: "Sign out failed",
          description: "There was a problem signing you out. Please try again.",
        })
      }

      setIsSigningOut(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }
    return user.email?.substring(0, 2).toUpperCase() || "U"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-9 w-9 border border-white/20">
          <AvatarImage src={user.user_metadata?.avatar_url || ""} alt={fullName || user.email || "User"} />
          <AvatarFallback className="bg-purple-800 text-white">{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black/90 border border-white/15 text-white">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{fullName || "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-white/10">
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-white/10">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-white/10">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-white/10">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          className="flex items-center cursor-pointer hover:bg-white/10 text-red-400 hover:text-red-300"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
