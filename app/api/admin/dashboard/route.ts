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

    // Obtener estadísticas del dashboard
    const [totalRifasResult, activeRifasResult, totalUsersResult, totalRevenueResult, pendingPaymentsResult] =
      await Promise.all([
        query("SELECT COUNT(*) as count FROM rifas"),
        query('SELECT COUNT(*) as count FROM rifas WHERE status = "active"'),
        query("SELECT COUNT(*) as count FROM users"),
        query('SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_status = "completed"'),
        query('SELECT COUNT(*) as count FROM payments WHERE payment_status = "pending"'),
      ])

    const stats = {
      totalRifas: (totalRifasResult as any[])[0]?.count || 0,
      activeRifas: (activeRifasResult as any[])[0]?.count || 0,
      totalUsers: (totalUsersResult as any[])[0]?.count || 0,
      totalRevenue: (totalRevenueResult as any[])[0]?.total || 0,
      pendingPayments: (pendingPaymentsResult as any[])[0]?.count || 0,
    }

    return NextResponse.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
