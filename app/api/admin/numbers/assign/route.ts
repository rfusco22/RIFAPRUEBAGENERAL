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

    const { rifaId, userId, numbers } = await request.json()

    if (!rifaId || !userId || !numbers || numbers.length === 0) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Verificar que la rifa existe
    const rifaExists = (await query("SELECT id FROM rifas WHERE id = ?", [rifaId])) as any[]
    if (rifaExists.length === 0) {
      return NextResponse.json({ error: "Rifa no encontrada" }, { status: 404 })
    }

    // Verificar que el usuario existe
    const userExists = (await query("SELECT id FROM users WHERE id = ?", [userId])) as any[]
    if (userExists.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Verificar que todos los números están disponibles
    const availableNumbers = (await query(
      `SELECT number FROM raffle_numbers 
       WHERE rifa_id = ? AND number IN (${numbers.map(() => "?").join(",")}) AND status = 'available'`,
      [rifaId, ...numbers],
    )) as any[]

    if (availableNumbers.length !== numbers.length) {
      return NextResponse.json({ error: "Algunos números ya no están disponibles" }, { status: 400 })
    }

    // Asignar números al usuario
    for (const number of numbers) {
      await query(
        'UPDATE raffle_numbers SET user_id = ?, status = "paid", paid_at = NOW() WHERE rifa_id = ? AND number = ?',
        [userId, rifaId, number],
      )
    }

    // Obtener información de la rifa para calcular el monto
    const rifaInfo = (await query("SELECT ticket_price FROM rifas WHERE id = ?", [rifaId])) as any[]
    const totalAmount = numbers.length * rifaInfo[0].ticket_price

    // Crear registro de pago administrativo
    await query(
      `INSERT INTO payments (user_id, rifa_id, amount, payment_method, payment_status, numbers_purchased, payment_reference)
       VALUES (?, ?, ?, 'admin_assign', 'completed', ?, ?)`,
      [userId, rifaId, totalAmount, JSON.stringify(numbers), `ADMIN_${Date.now()}`],
    )

    return NextResponse.json({
      success: true,
      message: `${numbers.length} números asignados exitosamente`,
    })
  } catch (error) {
    console.error("Error assigning numbers:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
