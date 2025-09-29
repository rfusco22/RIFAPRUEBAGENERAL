import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    console.log("[v0] Probando conexión a la base de datos...")

    // Probar conexión básica
    const result = await query("SELECT 1 as test")
    console.log("[v0] Conexión exitosa:", result)

    // Verificar si existe la tabla admins
    const tables = await query("SHOW TABLES LIKE 'admins'")
    console.log("[v0] Tabla admins existe:", tables)

    // Verificar si existe el usuario admin
    const admins = await query("SELECT id, username, email, password_hash FROM admins WHERE username = 'admin'")
    console.log("[v0] Usuario admin existe:", admins)

    const tableStructure = await query("DESCRIBE admins")
    console.log("[v0] Estructura de tabla admins:", tableStructure)

    return NextResponse.json({
      success: true,
      connection: "OK",
      tables: tables,
      admins: admins,
      tableStructure: tableStructure,
    })
  } catch (error) {
    console.error("[v0] Error en test de DB:", error)
    return NextResponse.json(
      {
        error: "Error de conexión a la base de datos",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
