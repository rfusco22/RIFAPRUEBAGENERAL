import mysql from "mysql2/promise"

const connectionConfig = {
  host: process.env.DB_HOST || "ballast.proxy.rlwy.net",
  port: Number.parseInt(process.env.DB_PORT || "51590"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "tYRpxlvXCHqYQsyffpGTKOgfiQuFVjTA",
  database: process.env.DB_NAME || "rifa", // Cambiado de sistema_rifas a rifa
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
}

let connection: mysql.Connection | null = null

export async function getConnection() {
  try {
    if (!connection) {
      console.log("[v0] Creando nueva conexión a la base de datos...")
      console.log("[v0] Config de conexión:", {
        host: connectionConfig.host,
        port: connectionConfig.port,
        user: connectionConfig.user,
        database: connectionConfig.database,
      })
      connection = await mysql.createConnection(connectionConfig)
      console.log("[v0] Conexión establecida exitosamente")
    }
    return connection
  } catch (error) {
    console.error("[v0] Error al conectar a la base de datos:", error)
    throw error
  }
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
    connection = null
    throw error
  }
}

export async function closeConnection() {
  if (connection) {
    await connection.end()
    connection = null
  }
}
