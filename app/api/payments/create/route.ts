import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { rifaId, selectedNumbers, userInfo, paymentMethod } = await request.json()

    // Validaciones
    if (!rifaId || !selectedNumbers || selectedNumbers.length === 0 || !userInfo) {
      return NextResponse.json({ error: "Datos incompletos para procesar el pago" }, { status: 400 })
    }

    const { name, email, phone } = userInfo

    if (!name || !email) {
      return NextResponse.json({ error: "Nombre y email son requeridos" }, { status: 400 })
    }

    // Verificar que la rifa existe y está activa
    const rifaResults = (await query('SELECT * FROM rifas WHERE id = ? AND status = "active"', [rifaId])) as any[]

    if (rifaResults.length === 0) {
      return NextResponse.json({ error: "Rifa no encontrada o no activa" }, { status: 404 })
    }

    const rifa = rifaResults[0]

    // Verificar que todos los números están disponibles
    const numbersCheck = (await query(
      `SELECT number FROM raffle_numbers 
       WHERE rifa_id = ? AND number IN (${selectedNumbers.map(() => "?").join(",")}) AND status = 'available'`,
      [rifaId, ...selectedNumbers],
    )) as any[]

    if (numbersCheck.length !== selectedNumbers.length) {
      return NextResponse.json({ error: "Algunos números ya no están disponibles" }, { status: 400 })
    }

    // Crear o encontrar usuario
    let userId
    const existingUser = (await query("SELECT id FROM users WHERE email = ?", [email])) as any[]

    if (existingUser.length > 0) {
      userId = existingUser[0].id
      // Actualizar información del usuario
      await query("UPDATE users SET name = ?, phone = ? WHERE id = ?", [name, phone, userId])
    } else {
      const userResult = (await query("INSERT INTO users (name, email, phone) VALUES (?, ?, ?)", [
        name,
        email,
        phone,
      ])) as any
      userId = userResult.insertId
    }

    // Calcular monto total
    const totalAmount = selectedNumbers.length * rifa.ticket_price

    // Crear registro de pago
    const paymentResult = (await query(
      `INSERT INTO payments (user_id, rifa_id, amount, payment_method, payment_status, numbers_purchased)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [userId, rifaId, totalAmount, paymentMethod || "card", JSON.stringify(selectedNumbers)],
    )) as any

    const paymentId = paymentResult.insertId

    // Reservar los números temporalmente (15 minutos)
    const reservationExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutos

    for (const number of selectedNumbers) {
      await query(
        'UPDATE raffle_numbers SET status = "reserved", user_id = ?, reserved_at = NOW() WHERE rifa_id = ? AND number = ?',
        [userId, rifaId, number],
      )
    }

    // Simular procesamiento de pago (en producción aquí iría la integración con Stripe, PayPal, etc.)
    // Por ahora, simularemos un pago exitoso después de 2 segundos
    setTimeout(async () => {
      try {
        // Marcar pago como completado
        await query('UPDATE payments SET payment_status = "completed", payment_reference = ? WHERE id = ?', [
          `PAY_${paymentId}_${Date.now()}`,
          paymentId,
        ])

        // Marcar números como pagados
        for (const number of selectedNumbers) {
          await query('UPDATE raffle_numbers SET status = "paid", paid_at = NOW() WHERE rifa_id = ? AND number = ?', [
            rifaId,
            number,
          ])
        }
      } catch (error) {
        console.error("Error completing payment:", error)
      }
    }, 2000)

    return NextResponse.json({
      success: true,
      paymentId,
      message: "Pago procesado exitosamente",
      totalAmount,
      selectedNumbers,
      reservationExpiry: reservationExpiry.toISOString(),
    })
  } catch (error) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
