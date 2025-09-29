import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Token no proporcionado" }, { status: 401 })
    }

    const admin = verifyToken(token)

    if (!admin) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      admin,
    })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
