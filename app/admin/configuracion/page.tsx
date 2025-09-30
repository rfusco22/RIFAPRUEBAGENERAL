"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function ConfiguracionPage() {
  const router = useRouter()
  const [settings, setSettings] = useState({
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.settings) {
        setSettings({
          contact_person_name: data.settings.contact_person_name || "",
          contact_person_phone: data.settings.contact_person_phone || "",
          contact_person_email: data.settings.contact_person_email || "",
        })
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Configuración guardada exitosamente")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setMessage(data.error || "Error al guardar configuración")
      }
    } catch (error) {
      setMessage("Error de conexión")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>
              Configura la información de la persona encargada de recibir pagos en efectivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contact_person_name">Nombre de la persona encargada</Label>
              <Input
                id="contact_person_name"
                value={settings.contact_person_name}
                onChange={(e) => setSettings({ ...settings, contact_person_name: e.target.value })}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <Label htmlFor="contact_person_phone">Teléfono de contacto</Label>
              <Input
                id="contact_person_phone"
                value={settings.contact_person_phone}
                onChange={(e) => setSettings({ ...settings, contact_person_phone: e.target.value })}
                placeholder="Ej: +58 412 1234567"
              />
            </div>

            <div>
              <Label htmlFor="contact_person_email">Correo electrónico</Label>
              <Input
                id="contact_person_email"
                type="email"
                value={settings.contact_person_email}
                onChange={(e) => setSettings({ ...settings, contact_person_email: e.target.value })}
                placeholder="Ej: contacto@rifas.com"
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.includes("Error") ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                }`}
              >
                {message}
              </div>
            )}

            <Button onClick={handleSave} disabled={isSaving} className="w-full">
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
