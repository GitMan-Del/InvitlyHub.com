import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Get the pathname from the URL
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication checks
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/join" ||
      pathname.startsWith("/auth/callback") ||
      pathname.startsWith("/api/") ||
      pathname.includes("favicon") ||
      pathname.includes(".svg") ||
      pathname.includes(".png") ||
      pathname.includes(".jpg") ||
      pathname.includes(".ico") ||
      pathname.startsWith("/events/") ||
      pathname.startsWith("/invitations/") ||
      pathname.startsWith("/invites/")

    if (isPublicRoute) {
      return res
    }

    // If the user is not signed in and trying to access a protected route, redirect to sign in
    if (!session && (pathname.startsWith("/dashboard") || pathname.startsWith("/events"))) {
      const redirectUrl = new URL("/auth/signin", req.url)
      redirectUrl.searchParams.set("redirect", encodeURIComponent(pathname))
      return NextResponse.redirect(redirectUrl)
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
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
