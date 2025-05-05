"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Copy, Share2 } from "lucide-react"

interface InviteCodeShareProps {
  eventId: string
  inviteCode?: string | null
}

export default function InviteCodeShare({ eventId, inviteCode: initialInviteCode }: InviteCodeShareProps) {
  const [inviteCode, setInviteCode] = useState(initialInviteCode || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generateInviteCode = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-invite-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId }),
      })

      const data = await response.json()

      if (response.ok) {
        setInviteCode(data.inviteCode)
        toast({
          title: "Success!",
          description: "Invite code generated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to generate invite code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating invite code:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyInviteCode = async () => {
    if (!inviteCode) return

    try {
      await navigator.clipboard.writeText(inviteCode)
      setIsCopied(true)
      toast({
        title: "Copied!",
        description: "Invite code copied to clipboard",
      })

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Error copying invite code:", error)
      toast({
        title: "Error",
        description: "Failed to copy invite code",
        variant: "destructive",
      })
    }
  }

  const shareInviteCode = async () => {
    if (!inviteCode) return

    const shareData = {
      title: "Join my event",
      text: `Join my event with this invite code: ${inviteCode}`,
      url: `${window.location.origin}/join?code=${inviteCode}`,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        toast({
          title: "Shared!",
          description: "Invite code shared successfully",
        })
      } else {
        // Fallback to copying the link
        await navigator.clipboard.writeText(shareData.url)
        toast({
          title: "Copied!",
          description: "Invite link copied to clipboard",
        })
      }
    } catch (error) {
      console.error("Error sharing invite code:", error)
      // User might have cancelled the share operation, so we don't show an error toast
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Invite Code</h3>
      <div className="space-y-4">
        {inviteCode ? (
          <>
            <div className="flex items-center space-x-2">
              <Input value={inviteCode} readOnly className="font-mono" aria-label="Invite code" />
              <Button size="sm" variant="outline" onClick={copyInviteCode} className="flex items-center gap-1">
                <Copy className="h-4 w-4" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
              <Button size="sm" variant="outline" onClick={shareInviteCode} className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-500">Share this code with others to let them join your event.</p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={generateInviteCode} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate New Code"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">Generate an invite code to allow others to join this event.</p>
            <Button onClick={generateInviteCode} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Invite Code"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
