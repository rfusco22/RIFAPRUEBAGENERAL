import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export function middleware(request: NextRequest) {
  // Proteger rutas del admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    console.log("[v0] Middleware - Ruta protegida:", request.nextUrl.pathname)

    const authHeader = request.headers.get("authorization")
    const cookieToken = request.cookies.get("admin_token")?.value
    const token = authHeader?.replace("Bearer ", "") || cookieToken

    console.log("[v0] Middleware - Auth header:", authHeader ? "presente" : "ausente")
    console.log(
      "[v0] Middleware - Cookie token:",
      cookieToken ? `presente (${cookieToken.substring(0, 20)}...)` : "ausente",
    )
    console.log("[v0] Middleware - Token final:", token ? `presente (${token.substring(0, 20)}...)` : "ausente")

    if (!token) {
      console.log("[v0] Middleware - Sin token, redirigiendo a login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    try {
      console.log("[v0] Middleware - Verificando token...")
      const admin = verifyToken(token)
      console.log("[v0] Middleware - Resultado verificación:", admin ? `válido (${admin.username})` : "inválido")

      if (!admin) {
        console.log("[v0] Middleware - Token inválido, redirigiendo a login")
        return NextResponse.redirect(new URL("/login", request.url))
      }

      console.log("[v0] Middleware - Acceso permitido para:", admin.username)
      return NextResponse.next()
    } catch (error) {
      console.error("[v0] Middleware - Error verificando token:", error)
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
