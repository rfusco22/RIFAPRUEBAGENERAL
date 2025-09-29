import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { query } from "@/lib/database"

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

    const { title, description, prize_description, ticket_price, start_date, end_date, draw_date } =
      await request.json()

    // Validaciones
    if (!title || !prize_description || !ticket_price || !start_date || !end_date || !draw_date) {
      return NextResponse.json({ error: "Todos los campos requeridos deben ser completados" }, { status: 400 })
    }

    // Crear la rifa
    const rifaResult = (await query(
      `INSERT INTO rifas (title, description, prize_description, ticket_price, start_date, end_date, draw_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [title, description, prize_description, ticket_price, start_date, end_date, draw_date],
    )) as any

    const rifaId = rifaResult.insertId

    // Generar todos los números del 000 al 999
    const numbers = []
    for (let i = 0; i < 1000; i++) {
      const number = i.toString().padStart(3, "0")
      numbers.push([rifaId, number])
    }

    // Insertar números en lotes para mejor rendimiento
    const batchSize = 100
    for (let i = 0; i < numbers.length; i += batchSize) {
      const batch = numbers.slice(i, i + batchSize)
      const placeholders = batch.map(() => "(?, ?)").join(", ")
      const values = batch.flat()

      await query(`INSERT INTO raffle_numbers (rifa_id, number) VALUES ${placeholders}`, values)
    }

    return NextResponse.json({
      success: true,
      rifaId,
      message: "Rifa creada exitosamente",
    })
  } catch (error) {
    console.error("Error creating rifa:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
