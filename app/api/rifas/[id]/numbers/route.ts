import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const rifaId = params.id
    console.log("[v0] Fetching numbers for rifa:", rifaId)

    // Get the rifa details to know total_numbers
    const rifaQuery = `SELECT total_numbers FROM rifas WHERE id = ?`
    const rifaResult: any = await query(rifaQuery, [rifaId])

    if (!rifaResult || rifaResult.length === 0) {
      return NextResponse.json({ error: "Rifa no encontrada" }, { status: 404 })
    }

    const totalNumbers = rifaResult[0].total_numbers || 1000

    // Get all numbers with their status
    const numbersQuery = `
      SELECT number, status, user_id
      FROM raffle_numbers
      WHERE rifa_id = ?
    `
    const existingNumbers: any = await query(numbersQuery, [rifaId])

    console.log("[v0] Found existing numbers:", existingNumbers.length)

    // Create a map of number -> status
    const numberStatusMap = new Map()
    existingNumbers.forEach((row: any) => {
      numberStatusMap.set(row.number, row.status)
    })

    // Generate all numbers from 0 to totalNumbers-1 with their status
    const allNumbers = []
    for (let i = 0; i < totalNumbers; i++) {
      const numberStr = i.toString().padStart(3, "0")
      const status = numberStatusMap.get(numberStr) || "available"
      allNumbers.push({
        number: numberStr,
        status: status, // available, reserved, sold
      })
    }

    console.log("[v0] Returning", allNumbers.length, "numbers")

    return NextResponse.json({
      success: true,
      numbers: allNumbers,
    })
  } catch (error) {
    console.error("[v0] Error fetching numbers:", error)
    return NextResponse.json({ error: "Error al obtener los números" }, { status: 500 })
  }
}
