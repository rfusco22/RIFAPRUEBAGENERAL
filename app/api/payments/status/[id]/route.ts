import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = Number.parseInt(params.id)

    if (isNaN(paymentId)) {
      return NextResponse.json({ error: "ID de pago inválido" }, { status: 400 })
    }

    const paymentResults = (await query(
      `SELECT p.*, u.name, u.email, r.title as rifa_title
       FROM payments p
       JOIN users u ON p.user_id = u.id
       JOIN rifas r ON p.rifa_id = r.id
       WHERE p.id = ?`,
      [paymentId],
    )) as any[]

    if (paymentResults.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    const payment = paymentResults[0]

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.payment_status,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        numbers: JSON.parse(payment.numbers_purchased),
        user: {
          name: payment.name,
          email: payment.email,
        },
        rifa: {
          title: payment.rifa_title,
        },
        paymentReference: payment.payment_reference,
        paymentProofUrl: payment.proof_image_url,
        paymentDetails: payment.payment_details ? JSON.parse(payment.payment_details) : null,
        proofSubmittedAt: payment.proof_submitted_at,
        createdAt: payment.created_at,
      },
    })
  } catch (error) {
    console.error("Payment status error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
