import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { paymentId, paymentProofUrl, paymentDetails } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: "ID de pago requerido" }, { status: 400 })
    }

    // Verificar que el pago existe
    const paymentCheck = (await query("SELECT id, payment_status FROM payments WHERE id = ?", [paymentId])) as any[]

    if (paymentCheck.length === 0) {
      return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 })
    }

    // Actualizar el pago con los datos de verificación
    await query(
      `UPDATE payments 
       SET payment_proof_url = ?, 
           payment_details = ?,
           updated_at = NOW() 
       WHERE id = ?`,
      [paymentProofUrl || null, JSON.stringify(paymentDetails || {}), paymentId],
    )

    return NextResponse.json({
      success: true,
      message: "Comprobante de pago enviado exitosamente",
    })
  } catch (error) {
    console.error("Error updating payment proof:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
