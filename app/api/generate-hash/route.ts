import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // Generar hash para la contraseña "admin123"
    const password = "admin123"
    const hash = await bcrypt.hash(password, 12)

    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(password, hash)

    return NextResponse.json({
      password,
      hash,
      isValid,
      sqlUpdate: `UPDATE admins SET password_hash = '${hash}' WHERE username = 'admin';`,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
