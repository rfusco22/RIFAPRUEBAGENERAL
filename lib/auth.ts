import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { query } from "./database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export interface Admin {
  id: number
  username: string
  email: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function authenticateAdmin(username: string, password: string): Promise<Admin | null> {
  try {
    console.log("[v0] Intentando autenticar usuario:", username)
    const results = (await query("SELECT id, username, email, password_hash FROM admins WHERE username = ?", [
      username,
    ])) as any[]

    console.log("[v0] Resultados de la consulta:", results.length)

    if (results.length === 0) {
      console.log("[v0] No se encontró el usuario")
      return null
    }

    const admin = results[0]
    console.log("[v0] Admin encontrado:", { id: admin.id, username: admin.username, email: admin.email })

    const isValidPassword = await verifyPassword(password, admin.password_hash)
    console.log("[v0] Contraseña válida:", isValidPassword)

    if (!isValidPassword) {
      return null
    }

    return {
      id: admin.id,
      username: admin.username,
      email: admin.email,
    }
  } catch (error) {
    console.error("[v0] Error authenticating admin:", error)
    return null
  }
}

export function generateToken(admin: Admin): string {
  return jwt.sign({ id: admin.id, username: admin.username, email: admin.email }, JWT_SECRET, { expiresIn: "24h" })
}

export function verifyToken(token: string): Admin | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    }
  } catch (error) {
    return null
  }
}
