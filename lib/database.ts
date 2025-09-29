import mysql from "mysql2/promise"

const connectionConfig = {
  host: process.env.DB_HOST || "ballast.proxy.rlwy.net",
  port: Number.parseInt(process.env.DB_PORT || "51590"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "tYRpxlvXCHqYQsyffpGTKOgfiQuFVjTA",
  database: process.env.DB_NAME || "rifa", // Cambiado de sistema_rifas a rifa
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
}

let connection: mysql.Connection | null = null

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(connectionConfig)
  }
  return connection
}

export async function query(sql: string, params?: any[]) {
  try {
    console.log("[v0] Ejecutando query:", sql.substring(0, 100) + "...")
    console.log("[v0] Parámetros:", params)
    const conn = await getConnection()
    const [results] = await conn.execute(sql, params)
    console.log("[v0] Resultados obtenidos:", Array.isArray(results) ? results.length : "No array")
    return results
  } catch (error) {
    console.error("[v0] Error en query:", error)
    throw error
  }
}

export async function closeConnection() {
  if (connection) {
    await connection.end()
    connection = null
  }
}
