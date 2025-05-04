import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { respondToInvite } from "@/app/actions/invite-actions"

export default async function QuickResponsePage({
  params,
}: {
  params: { code: string; response: string }
}) {
  const { code, response } = params

  // Validate response type
  if (!["yes", "no", "maybe"].includes(response)) {
    redirect(`/invites/${code}?error=invalid_response`)
  }

  // Get the current session
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If not logged in, redirect to the invitation page
  if (!session) {
    redirect(`/invites/${code}?auth_required=true&intended_response=${response}`)
  }

  try {
    // Process the response
    const result = await respondToInvite(code, response as "yes" | "no" | "maybe")

    if (result.success) {
      // Redirect to the event page with success message
      redirect(`/events/${result.eventId}?response_success=true&response=${response}`)
    } else if (result.requiresAuth) {
      // Redirect to auth
      redirect(`/invites/${code}?auth_required=true&intended_response=${response}`)
    } else if (result.wrongEmail) {
      // Redirect with wrong email error
      redirect(`/invites/${code}?error=wrong_email&email=${encodeURIComponent(result.invitationEmail || "")}`)
    } else {
      // Redirect with general error
      redirect(`/invites/${code}?error=${encodeURIComponent(result.error || "unknown_error")}`)
    }
  } catch (error) {
    console.error("Error processing quick response:", error)
    redirect(`/invites/${code}?error=server_error`)
  }
}
