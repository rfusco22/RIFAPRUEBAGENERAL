"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Lock, User } from "lucide-react"
import Link from "next/link"
import { setCookie } from "@/lib/cookies"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log("[v0] Enviando solicitud de login...")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("[v0] Respuesta recibida:", response.status)
      const data = await response.json()
      console.log("[v0] Datos de respuesta:", data)

      if (response.ok) {
        console.log("[v0] Login exitoso, guardando token...")
        // Guardar token en cookies
        setCookie("admin_token", data.token, 7) // 7 días de expiración
        console.log("[v0] Token guardado, redirigiendo...")
        router.push("/admin")
      } else {
        console.log("[v0] Error en login:", data.error)
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("[v0] Error de conexión:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <Trophy className="h-8 w-8" />
            <span>RifaMax</span>
          </Link>
          <p className="text-muted-foreground mt-2">Panel de Administración</p>
        </div>

        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Accede al panel de administración del sistema de rifas</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Volver al inicio
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo credentials info */}
        <Card className="mt-4 border-border bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium mb-2">Credenciales de demostración:</p>
              <p>
                Usuario: <code className="bg-background px-2 py-1 rounded text-foreground">admin</code>
              </p>
              <p>
                Contraseña: <code className="bg-background px-2 py-1 rounded text-foreground">1</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
