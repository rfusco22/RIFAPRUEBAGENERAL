import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const storedHash = "$2b$12$LQv3c1yqBwEHXyvHrCL2/.VRVmZ.eeHXuBiLoSO7j3NOsRQaFunlG"

    // Probar diferentes contraseñas
    const passwords = ["1", "admin", "admin123", "password"]
    const results = []

    for (const password of passwords) {
      const isMatch = await bcrypt.compare(password, storedHash)
      results.push({ password, matches: isMatch })
    }

    // Generar hash para contraseña "1"
    const newHash = await bcrypt.hash("1", 12)

    return NextResponse.json({
      currentHash: storedHash,
      passwordTests: results,
      newHashForPassword1: newHash,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
