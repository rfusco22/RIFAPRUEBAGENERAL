import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Obtener configuración
export async function GET() {
  try {
    const settingsResults = (await query("SELECT setting_key, setting_value FROM settings")) as any[]

    const settings: Record<string, string> = {}
    settingsResults.forEach((row) => {
      settings[row.setting_key] = row.setting_value
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
  }
}

// PUT - Actualizar configuración (solo admin)
export async function PUT(request: NextRequest) {
  try {
    // Verificar autenticación de admin
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    try {
      jwt.verify(token.value, JWT_SECRET)
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const { settings } = await request.json()

    if (!settings || typeof settings !== "object") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
    }

    // Actualizar cada configuración
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?`,
        [key, value, value],
      )
    }

    return NextResponse.json({ success: true, message: "Configuración actualizada" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 })
  }
}
