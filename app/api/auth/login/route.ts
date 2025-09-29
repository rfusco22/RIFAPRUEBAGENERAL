import { type NextRequest, NextResponse } from "next/server"
import { authenticateAdmin, generateToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Iniciando proceso de login")
    const { username, password } = await request.json()
    console.log("[v0] Datos recibidos:", { username, password: password ? "***" : "vacío" })

    if (!username || !password) {
      console.log("[v0] Faltan credenciales")
      return NextResponse.json({ error: "Usuario y contraseña son requeridos" }, { status: 400 })
    }

    console.log("[v0] Intentando autenticar...")
    const admin = await authenticateAdmin(username, password)
    console.log("[v0] Resultado de autenticación:", admin ? "exitoso" : "fallido")

    if (!admin) {
      console.log("[v0] Credenciales inválidas")
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const token = generateToken(admin)
    console.log("[v0] Token generado exitosamente")

    return NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    })
  } catch (error) {
    console.error("[v0] Error en login API:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
