import { NextResponse } from "next/server"
import { query } from "@/lib/database"

export async function GET() {
  try {
    const rifasQuery = `
      SELECT 
        r.*,
        COUNT(CASE WHEN rn.status = 'available' THEN 1 END) as available_numbers
      FROM rifas r
      LEFT JOIN raffle_numbers rn ON r.id = rn.rifa_id
      WHERE r.status = 'active'
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `

    const rifas = await query(rifasQuery)

    return NextResponse.json({
      success: true,
      rifas,
    })
  } catch (error) {
    console.error("Error fetching rifas:", error)
    return NextResponse.json({ error: "Error al obtener las rifas" }, { status: 500 })
  }
}
