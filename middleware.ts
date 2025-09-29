import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Proteger rutas del admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const admin = verifyToken(token)
    if (!admin) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
