import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const paymentId = formData.get("paymentId") as string
    const paymentMethod = formData.get("paymentMethod") as string

    // Datos específicos según el método de pago
    const bankOrigin = formData.get("bankOrigin") as string
    const phone = formData.get("phone") as string
    const cedula = formData.get("cedula") as string
    const reference = formData.get("reference") as string
    const amount = formData.get("amount") as string

    // Para Zelle
    const zelleEmail = formData.get("zelleEmail") as string

    // Para Binance
    const transactionId = formData.get("transactionId") as string

    if (!file || !paymentId) {
      return NextResponse.json({ error: "Archivo y ID de pago requeridos" }, { status: 400 })
    }

    // Subir imagen a Blob storage
    const blob = await put(`payment-proofs/${paymentId}-${Date.now()}-${file.name}`, file, {
      access: "public",
    })

    // Actualizar el pago con los datos del comprobante
    await query(
      `UPDATE payments 
       SET proof_image_url = ?,
           bank_origin = ?,
           sender_phone = ?,
           sender_cedula = ?,
           payment_reference = ?,
           payment_amount = ?,
           zelle_email = ?,
           binance_transaction_id = ?,
           proof_submitted_at = NOW()
       WHERE id = ?`,
      [
        blob.url,
        bankOrigin || null,
        phone || null,
        cedula || null,
        reference || null,
        amount || null,
        zelleEmail || null,
        transactionId || null,
        paymentId,
      ],
    )

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: "Comprobante subido exitosamente. El pago está pendiente de verificación por el administrador.",
    })
  } catch (error) {
    console.error("Error al subir comprobante:", error)
    return NextResponse.json({ error: "Error al subir el comprobante" }, { status: 500 })
  }
}
