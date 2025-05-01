import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get the pathname from the URL
  const { pathname, search } = req.nextUrl

  // If the user is not signed in and trying to access a protected route, redirect to sign in
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/auth/signin", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Special handling for invitation pages - don't redirect, but let the page handle auth state
  if (pathname.startsWith("/invitations/") || pathname.startsWith("/invites/")) {
    return res
  }

  // If the user is signed in and trying to access auth pages, redirect to dashboard
  if (session && (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup"))) {
    // Check if there's a redirect parameter
    const redirectTo = req.nextUrl.searchParams.get("redirect")

    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo, req.url))
    }

    const redirectUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/signin", "/auth/signup", "/invitations/:path*", "/invites/:path*"],
}
