import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rifaId = Number.parseInt(params.id)

    if (isNaN(rifaId)) {
      return NextResponse.json({ error: "ID de rifa inválido" }, { status: 400 })
    }

    const numbersQuery = `
      SELECT number 
      FROM raffle_numbers 
      WHERE rifa_id = ? AND status = 'available'
      ORDER BY CAST(number AS UNSIGNED)
    `

    const results = (await query(numbersQuery, [rifaId])) as any[]
    const availableNumbers = results.map((row) => row.number)

    return NextResponse.json({
      success: true,
      availableNumbers,
    })
  } catch (error) {
    console.error("Error fetching numbers:", error)
    return NextResponse.json({ error: "Error al obtener los números" }, { status: 500 })
  }
}
