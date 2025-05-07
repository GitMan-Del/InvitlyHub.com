import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirect") || "/dashboard"

  if (code) {
    try {
      const supabase = createRouteHandlerClient({ cookies })
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback error:", error)
        // Redirect to sign in page with error message
        const errorUrl = new URL("/auth/signin", request.url)
        errorUrl.searchParams.set("error", "Authentication failed. Please try again.")
        return NextResponse.redirect(errorUrl)
      }

      if (data?.user) {
        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .maybeSingle()

        // If profile doesn't exist, create one
        if (!profileError && !profile) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || null,
            updated_at: new Date().toISOString(),
          })
        }
      }
    } catch (err) {
      console.error("Unexpected error in auth callback:", err)
      // Redirect to sign in page with error message
      const errorUrl = new URL("/auth/signin", request.url)
      errorUrl.searchParams.set("error", "An unexpected error occurred. Please try again.")
      return NextResponse.redirect(errorUrl)
    }
  }

  // URL to redirect to after sign in process completes
  // Use the redirect parameter if provided, otherwise go to dashboard
  return NextResponse.redirect(new URL(decodeURIComponent(redirectTo), request.url))
}
