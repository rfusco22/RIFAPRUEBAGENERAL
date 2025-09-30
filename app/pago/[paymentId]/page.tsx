"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, XCircle, Trophy, ArrowLeft, Upload, AlertCircle } from "lucide-react"
import Link from "next/link"

interface PaymentStatus {
  id: number
  status: string
  amount: number
  numbers: string[]
  paymentMethod: string
  user: {
    name: string
    email: string
  }
  rifa: {
    title: string
  }
  paymentReference?: string
  paymentProofUrl?: string
  paymentDetails?: any
  createdAt: string
}

interface AdminBankInfo {
  bank_name: string
  cedula: string
  phone: string
  zelle_email: string
  binance_id: string
}

export default function PaymentStatusPage() {
  const params = useParams()
  const paymentId = params.paymentId as string
  const [payment, setPayment] = useState<PaymentStatus | null>(null)
  const [adminInfo, setAdminInfo] = useState<AdminBankInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showProofForm, setShowProofForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const [proofData, setProofData] = useState({
    // Pago Móvil
    banco_origen: "",
    telefono: "",
    cedula: "",
    referencia: "",
    monto: "",
    // Zelle
    zelle_email_phone: "",
    // Binance
    transaction_id: "",
    // Común
    capture_url: "",
    notas: "",
  })

  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    if (paymentId) {
      fetchPaymentStatus()
      fetchAdminInfo()
      // Polling para actualizar el estado del pago
      const interval = setInterval(fetchPaymentStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [paymentId])

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`)
      const data = await response.json()

      if (data.success) {
        setPayment(data.payment)
        // Mostrar formulario si el pago está pendiente y no tiene comprobante
        if (
          data.payment.status === "pending" &&
          !data.payment.paymentProofUrl &&
          data.payment.paymentMethod !== "efectivo"
        ) {
          setShowProofForm(true)
        }
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

  const fetchAdminInfo = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()
      if (data.settings) {
        setAdminInfo({
          bank_name: data.settings.admin_bank_name || "Mercantil",
          cedula: data.settings.admin_cedula || "30090650",
          phone: data.settings.admin_phone || "04122928717",
          zelle_email: data.settings.admin_zelle_email || "",
          binance_id: data.settings.admin_binance_id || "",
        })
      }
    } catch (error) {
      console.error("Error fetching admin info:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProofFile(file)
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmitProof = async () => {
    if (!payment) return

    // Validaciones según método de pago
    if (payment.paymentMethod === "pago_movil") {
      if (!proofData.banco_origen || !proofData.telefono || !proofData.cedula || !proofData.referencia) {
        setError("Por favor completa todos los campos requeridos para Pago Móvil")
        return
      }
    } else if (payment.paymentMethod === "zelle") {
      if (!proofData.zelle_email_phone || !proofData.referencia) {
        setError("Por favor completa todos los campos requeridos para Zelle")
        return
      }
    } else if (payment.paymentMethod === "binance") {
      if (!proofData.transaction_id) {
        setError("Por favor ingresa el ID de transacción de Binance")
        return
      }
    }

    if (!proofFile) {
      setError("Por favor sube la captura del comprobante de pago")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // Crear FormData para enviar archivo
      const formData = new FormData()
      formData.append("file", proofFile)
      formData.append("paymentId", payment.id.toString())
      formData.append("paymentMethod", payment.paymentMethod)

      // Agregar datos específicos según método de pago
      if (payment.paymentMethod === "pago_movil") {
        formData.append("bankOrigin", proofData.banco_origen)
        formData.append("phone", proofData.telefono)
        formData.append("cedula", proofData.cedula)
        formData.append("reference", proofData.referencia)
        if (proofData.monto) formData.append("amount", proofData.monto)
      } else if (payment.paymentMethod === "zelle") {
        formData.append("zelleEmail", proofData.zelle_email_phone)
        formData.append("reference", proofData.referencia)
      } else if (payment.paymentMethod === "binance") {
        formData.append("transactionId", proofData.transaction_id)
        if (proofData.monto) formData.append("amount", proofData.monto)
      }

      const response = await fetch("/api/payments/upload-proof", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitSuccess(true)
        setShowProofForm(false)
        fetchPaymentStatus()
      } else {
        setError(data.error || "Error al enviar el comprobante")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setIsSubmitting(false)
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
        return "Esperando Verificación"
      case "failed":
        return "Pago Rechazado"
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
        return <Badge variant="destructive">Rechazado</Badge>
      default:
        return <Badge variant="outline">Desconocido</Badge>
    }
  }

  if (error && !payment) {
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
              {/* Mensajes de error y éxito */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {submitSuccess && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Comprobante enviado exitosamente. Tu pago será verificado pronto.
                  </AlertDescription>
                </Alert>
              )}

              {/* Estado del Pago */}
              <Card>
                <CardContent className="pt-6 text-center">
                  {getStatusIcon(payment.status)}
                  <h2 className="text-2xl font-bold mt-4 mb-2">{getStatusText(payment.status)}</h2>
                  {getStatusBadge(payment.status)}

                  {payment.status === "pending" && !payment.paymentProofUrl && payment.paymentMethod !== "efectivo" && (
                    <p className="text-muted-foreground mt-4">
                      Por favor completa los datos de tu pago para que podamos verificarlo.
                    </p>
                  )}

                  {payment.status === "pending" && payment.paymentProofUrl && (
                    <p className="text-muted-foreground mt-4">
                      Tu comprobante ha sido recibido. Estamos verificando tu pago...
                    </p>
                  )}

                  {payment.status === "completed" && (
                    <Alert className="mt-4 border-green-500 bg-green-50 dark:bg-green-950">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        ¡Felicidades! Tu pago ha sido verificado. Tus números han sido confirmados y participarán en el
                        sorteo.
                      </AlertDescription>
                    </Alert>
                  )}

                  {payment.status === "failed" && (
                    <Alert className="mt-4" variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        Tu pago no pudo ser verificado. Los números han sido liberados. Por favor contacta al
                        administrador.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {showProofForm && payment.status === "pending" && !payment.paymentProofUrl && adminInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle>Enviar Comprobante de Pago</CardTitle>
                    <CardDescription>
                      Completa los datos de tu{" "}
                      {payment.paymentMethod === "pago_movil"
                        ? "Pago Móvil"
                        : payment.paymentMethod === "zelle"
                          ? "Zelle"
                          : "Binance"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Información del destinatario */}
                    <Alert>
                      <AlertDescription>
                        <strong>Datos para realizar el pago:</strong>
                        <br />
                        {payment.paymentMethod === "pago_movil" && (
                          <>
                            Banco: <strong>{adminInfo.bank_name}</strong>
                            <br />
                            Cédula: <strong>{adminInfo.cedula}</strong>
                            <br />
                            Teléfono: <strong>{adminInfo.phone}</strong>
                            <br />
                          </>
                        )}
                        {payment.paymentMethod === "zelle" && adminInfo.zelle_email && (
                          <>
                            Email Zelle: <strong>{adminInfo.zelle_email}</strong>
                            <br />
                          </>
                        )}
                        {payment.paymentMethod === "binance" && adminInfo.binance_id && (
                          <>
                            ID Binance: <strong>{adminInfo.binance_id}</strong>
                            <br />
                          </>
                        )}
                        Monto a pagar: <strong>${Number(payment.amount).toFixed(2)}</strong>
                      </AlertDescription>
                    </Alert>

                    {/* Campos específicos para Pago Móvil */}
                    {payment.paymentMethod === "pago_movil" && (
                      <>
                        <div>
                          <Label htmlFor="banco_origen">Banco Origen *</Label>
                          <Select
                            value={proofData.banco_origen}
                            onValueChange={(value) => setProofData({ ...proofData, banco_origen: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tu banco" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Banesco">Banesco</SelectItem>
                              <SelectItem value="Mercantil">Mercantil</SelectItem>
                              <SelectItem value="Venezuela">Venezuela</SelectItem>
                              <SelectItem value="Provincial">Provincial</SelectItem>
                              <SelectItem value="Bicentenario">Bicentenario</SelectItem>
                              <SelectItem value="Bancaribe">Bancaribe</SelectItem>
                              <SelectItem value="Exterior">Exterior</SelectItem>
                              <SelectItem value="BOD">BOD</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="telefono">Teléfono *</Label>
                          <Input
                            id="telefono"
                            placeholder="04121234567"
                            value={proofData.telefono}
                            onChange={(e) => setProofData({ ...proofData, telefono: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="cedula">Cédula *</Label>
                          <Input
                            id="cedula"
                            placeholder="12345678"
                            value={proofData.cedula}
                            onChange={(e) => setProofData({ ...proofData, cedula: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="referencia">Referencia *</Label>
                          <Input
                            id="referencia"
                            placeholder="Número de referencia"
                            value={proofData.referencia}
                            onChange={(e) => setProofData({ ...proofData, referencia: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="monto">Monto Enviado</Label>
                          <Input
                            id="monto"
                            placeholder="Monto en Bs"
                            value={proofData.monto}
                            onChange={(e) => setProofData({ ...proofData, monto: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Campos específicos para Zelle */}
                    {payment.paymentMethod === "zelle" && (
                      <>
                        <div>
                          <Label htmlFor="zelle_email_phone">Email o Teléfono usado en Zelle *</Label>
                          <Input
                            id="zelle_email_phone"
                            placeholder="tu@email.com o +1234567890"
                            value={proofData.zelle_email_phone}
                            onChange={(e) => setProofData({ ...proofData, zelle_email_phone: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="referencia">Referencia de Zelle *</Label>
                          <Input
                            id="referencia"
                            placeholder="Número de confirmación"
                            value={proofData.referencia}
                            onChange={(e) => setProofData({ ...proofData, referencia: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {/* Campos específicos para Binance */}
                    {payment.paymentMethod === "binance" && (
                      <>
                        <div>
                          <Label htmlFor="transaction_id">ID de Transacción *</Label>
                          <Input
                            id="transaction_id"
                            placeholder="ID de transacción de Binance"
                            value={proofData.transaction_id}
                            onChange={(e) => setProofData({ ...proofData, transaction_id: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label htmlFor="monto">Monto Enviado (USDT)</Label>
                          <Input
                            id="monto"
                            placeholder="Monto en USDT"
                            value={proofData.monto}
                            onChange={(e) => setProofData({ ...proofData, monto: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="proof_file">Captura del Comprobante *</Label>
                      <Input
                        id="proof_file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Sube una imagen del comprobante de pago (JPG, PNG, etc.)
                      </p>
                      {/* Preview de la imagen */}
                      {previewUrl && (
                        <div className="mt-4 border rounded-lg overflow-hidden">
                          <img
                            src={previewUrl || "/placeholder.svg"}
                            alt="Preview del comprobante"
                            className="w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      )}
                    </div>

                    {/* Notas adicionales */}
                    <div>
                      <Label htmlFor="notas">Notas Adicionales (Opcional)</Label>
                      <Textarea
                        id="notas"
                        placeholder="Información adicional sobre tu pago"
                        value={proofData.notas}
                        onChange={(e) => setProofData({ ...proofData, notas: e.target.value })}
                        rows={3}
                      />
                    </div>

                    <Button className="w-full" onClick={handleSubmitProof} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Comprobante
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

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
                        Método:{" "}
                        {payment.paymentMethod === "pago_movil"
                          ? "Pago Móvil"
                          : payment.paymentMethod === "zelle"
                            ? "Zelle"
                            : payment.paymentMethod === "binance"
                              ? "Binance"
                              : "Efectivo"}
                      </p>
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
                      <span className="font-semibold">Total:</span>
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
