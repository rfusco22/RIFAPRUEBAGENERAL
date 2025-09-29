import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

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

    const usersQuery = `
      SELECT 
        u.*,
        COUNT(rn.id) as total_numbers,
        GROUP_CONCAT(CONCAT(rn.number, ':', r.title) SEPARATOR '|') as purchased_numbers
      FROM users u
      LEFT JOIN raffle_numbers rn ON u.id = rn.user_id AND rn.status = 'paid'
      LEFT JOIN rifas r ON rn.rifa_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `

    const users = (await query(usersQuery)) as any[]

    const formattedUsers = users.map((user) => ({
      ...user,
      purchased_numbers: user.purchased_numbers
        ? user.purchased_numbers.split("|").map((item: string) => {
            const [number, rifaTitle] = item.split(":")
            return { number, rifaTitle }
          })
        : [],
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const { name, email, phone } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = (await query("SELECT id FROM users WHERE email = ?", [email])) as any[]
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    const result = (await query("INSERT INTO users (name, email, phone) VALUES (?, ?, ?)", [name, email, phone])) as any

    return NextResponse.json({
      success: true,
      userId: result.insertId,
      message: "Usuario creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
