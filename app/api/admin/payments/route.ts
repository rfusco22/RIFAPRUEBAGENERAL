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

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const rifaId = searchParams.get("rifaId")

    // Construir query dinámicamente
    let paymentsQuery = `
      SELECT 
        p.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        r.title as rifa_title
      FROM payments p
      JOIN users u ON p.user_id = u.id
      JOIN rifas r ON p.rifa_id = r.id
      WHERE 1=1
    `
    const queryParams: any[] = []

    if (status) {
      paymentsQuery += " AND p.payment_status = ?"
      queryParams.push(status)
    }

    if (rifaId) {
      paymentsQuery += " AND p.rifa_id = ?"
      queryParams.push(rifaId)
    }

    paymentsQuery += " ORDER BY p.created_at DESC"

    const payments = (await query(paymentsQuery, queryParams)) as any[]

    const formattedPayments = payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paymentMethod: payment.payment_method,
      paymentStatus: payment.payment_status,
      paymentReference: payment.payment_reference,
      numbersPurchased: JSON.parse(payment.numbers_purchased || "[]"),
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      user: {
        id: payment.user_id,
        name: payment.user_name,
        email: payment.user_email,
        phone: payment.user_phone,
      },
      rifa: {
        id: payment.rifa_id,
        title: payment.rifa_title,
      },
    }))

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    const { paymentId, status } = await request.json()

    if (!paymentId || !status) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    // Validar que el status sea válido
    const validStatuses = ["pending", "completed", "failed", "refunded"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Estado de pago inválido" }, { status: 400 })
    }

    // Obtener información del pago
    const paymentInfo = (await query("SELECT * FROM payments WHERE id = ?", [paymentId])) as any[]

    if (paymentInfo.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    const payment = paymentInfo[0]

    // Si se está marcando como completado, actualizar los números a "paid"
    if (status === "completed" && payment.payment_status !== "completed") {
      const numbers = JSON.parse(payment.numbers_purchased || "[]")

      for (const number of numbers) {
        await query(
          'UPDATE raffle_numbers SET status = "paid", paid_at = NOW(), payment_id = ? WHERE rifa_id = ? AND number = ?',
          [paymentId, payment.rifa_id, number],
        )
      }

      // Generar referencia de pago si no existe
      const paymentReference = payment.payment_reference || `ADMIN_VERIFIED_${paymentId}_${Date.now()}`

      await query("UPDATE payments SET payment_status = ?, payment_reference = ?, updated_at = NOW() WHERE id = ?", [
        status,
        paymentReference,
        paymentId,
      ])
    } else if (status === "failed" || status === "refunded") {
      // Si se marca como fallido o reembolsado, liberar los números
      const numbers = JSON.parse(payment.numbers_purchased || "[]")

      for (const number of numbers) {
        await query(
          'UPDATE raffle_numbers SET status = "available", user_id = NULL, reserved_at = NULL, paid_at = NULL, payment_id = NULL WHERE rifa_id = ? AND number = ?',
          [payment.rifa_id, number],
        )
      }

      await query("UPDATE payments SET payment_status = ?, updated_at = NOW() WHERE id = ?", [status, paymentId])
    } else {
      // Solo actualizar el estado
      await query("UPDATE payments SET payment_status = ?, updated_at = NOW() WHERE id = ?", [status, paymentId])
    }

    return NextResponse.json({
      success: true,
      message: "Estado del pago actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
