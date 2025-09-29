import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Proteger rutas del admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token =
      request.headers.get("authorization")?.replace("Bearer ", "") || request.cookies.get("admin_token")?.value

    console.log("[v0] Middleware - Ruta protegida:", request.nextUrl.pathname)
    console.log("[v0] Middleware - Token presente:", token ? "sí" : "no")

    if (!token) {
      console.log("[v0] Middleware - Sin token, redirigiendo a login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const admin = verifyToken(token)
    console.log("[v0] Middleware - Token válido:", admin ? "sí" : "no")

    if (!admin) {
      console.log("[v0] Middleware - Token inválido, redirigiendo a login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("[v0] Middleware - Acceso permitido para:", admin.username)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
