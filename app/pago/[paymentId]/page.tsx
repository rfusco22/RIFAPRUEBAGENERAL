"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle, Trophy, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PaymentStatus {
  id: number
  status: string
  amount: number
  numbers: string[]
  user: {
    name: string
    email: string
  }
  rifa: {
    title: string
  }
  paymentReference?: string
  createdAt: string
}

export default function PaymentStatusPage() {
  const params = useParams()
  const paymentId = params.paymentId as string
  const [payment, setPayment] = useState<PaymentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus()
      // Polling para actualizar el estado del pago
      const interval = setInterval(fetchPaymentStatus, 3000)
      return () => clearInterval(interval)
    }
  }, [paymentId])

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      const data = await response.json()

      if (data.success) {
        setPayment(data.payment)
        // Detener polling si el pago está completado o falló
        if (data.payment.status === "completed" || data.payment.status === "failed") {
          setIsLoading(false)
        }
      } else {
        setError(data.error || "Error al obtener el estado del pago")
        setIsLoading(false)
      }
    } catch (error) {
      setError("Error de conexión")
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case "pending":
        return <Clock className="h-16 w-16 text-yellow-500 animate-pulse" />
      case "failed":
        return <XCircle className="h-16 w-16 text-red-500" />
      default:
        return <Clock className="h-16 w-16 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Pago Completado"
      case "pending":
        return "Procesando Pago..."
      case "failed":
        return "Pago Fallido"
      default:
        return "Estado Desconocido"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">Completado</Badge>
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "failed":
        return <Badge variant="destructive">Fallido</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/rifas">
              <Button>Volver a Rifas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/rifas" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Rifas</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Estado del Pago</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {payment ? (
            <div className="space-y-6">
              {/* Estado del Pago */}
              <Card>
                <CardContent className="pt-6 text-center">
                  {getStatusIcon(payment.status)}
                  <h2 className="text-2xl font-bold mt-4 mb-2">{getStatusText(payment.status)}</h2>
                  {getStatusBadge(payment.status)}

                  {payment.status === "pending" && (
                    <p className="text-muted-foreground mt-4">
                      Tu pago está siendo procesado. Esto puede tomar unos momentos...
                    </p>
                  )}

                  {payment.status === "completed" && (
                    <Alert className="mt-4 border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        ¡Felicidades! Tu compra ha sido procesada exitosamente. Tus números han sido reservados y
                        participarán en el sorteo.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Detalles de la Compra */}
              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Compra</CardTitle>
                  <CardDescription>Información de tu transacción</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Información del Comprador</h4>
                      <p className="text-sm text-muted-foreground">Nombre: {payment.user.name}</p>
                      <p className="text-sm text-muted-foreground">Email: {payment.user.email}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Información del Pago</h4>
                      <p className="text-sm text-muted-foreground">ID: #{payment.id}</p>
                      <p className="text-sm text-muted-foreground">
                        Fecha: {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      {payment.paymentReference && (
                        <p className="text-sm text-muted-foreground">Referencia: {payment.paymentReference}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Rifa</h4>
                    <p className="text-sm text-muted-foreground">{payment.rifa.title}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Números Comprados ({payment.numbers.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {payment.numbers.map((number) => (
                        <Badge key={number} variant="secondary" className="font-mono">
                          {number}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Pagado:</span>
                      <span className="text-2xl font-bold text-primary">${Number(payment.amount).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              <div className="flex gap-4">
                <Link href="/rifas" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Otras Rifas
                  </Button>
                </Link>
                {payment.status === "completed" && (
                  <Button className="flex-1" onClick={() => window.print()}>
                    Imprimir Comprobante
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando información del pago...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
