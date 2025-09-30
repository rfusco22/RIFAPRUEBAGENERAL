"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, Clock, Search, ShoppingCart, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

interface Rifa {
  id: number
  title: string
  description: string
  prize_description: string
  ticket_price: number
  total_numbers: number
  start_date: string
  end_date: string
  draw_date: string
  status: string
  available_numbers: number
}

interface RaffleNumber {
  number: string
  status: "available" | "reserved" | "sold"
}

export default function RifasPage() {
  const router = useRouter()
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [selectedRifa, setSelectedRifa] = useState<Rifa | null>(null)
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([])
  const [searchNumber, setSearchNumber] = useState("")
  const [allNumbers, setAllNumbers] = useState<RaffleNumber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    fetchRifas()
  }, [])

  const fetchRifas = async () => {
    try {
      const response = await fetch("/api/rifas")
      const data = await response.json()
      setRifas(data.rifas || [])
    } catch (error) {
      console.error("Error fetching rifas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableNumbers = async (rifaId: number) => {
    try {
      console.log("[v0] Fetching numbers for rifa:", rifaId)
      const response = await fetch(`/api/rifas/${rifaId}/numbers`)
      const data = await response.json()
      console.log("[v0] Received numbers:", data.numbers?.length)
      setAllNumbers(data.numbers || [])
    } catch (error) {
      console.error("[v0] Error fetching numbers:", error)
      setAllNumbers([])
    }
  }

  const handleSelectRifa = (rifa: Rifa) => {
    setSelectedRifa(rifa)
    setSelectedNumbers([])
    fetchAvailableNumbers(rifa.id)
  }

  const handleNumberSelect = (numberObj: RaffleNumber) => {
    if (numberObj.status !== "available") return

    const number = numberObj.number
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number))
    } else {
      setSelectedNumbers([...selectedNumbers, number])
    }
  }

  const handleQuickSelect = (count: number) => {
    const available = allNumbers
      .filter((n) => n.status === "available" && !selectedNumbers.includes(n.number))
      .map((n) => n.number)
    const randomNumbers = available.sort(() => 0.5 - Math.random()).slice(0, count)
    setSelectedNumbers([...selectedNumbers, ...randomNumbers])
  }

  const handlePurchase = async () => {
    if (!selectedRifa || selectedNumbers.length === 0) return

    setIsProcessingPayment(true)

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rifaId: selectedRifa.id,
          selectedNumbers,
          userInfo,
          paymentMethod: "card",
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/pago/${data.paymentId}`)
      } else {
        alert(data.error || "Error al procesar el pago")
      }
    } catch (error) {
      alert("Error de conexión. Intenta nuevamente.")
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const filteredNumbers = allNumbers.filter((numberObj) => numberObj.number.includes(searchNumber))

  const totalPrice = selectedNumbers.length * (selectedRifa?.ticket_price || 0)

  const getNumberButtonClass = (numberObj: RaffleNumber, isSelected: boolean) => {
    if (isSelected) return "bg-primary text-primary-foreground hover:bg-primary/90"

    switch (numberObj.status) {
      case "available":
        return "bg-green-500 text-white hover:bg-green-600 border-green-600"
      case "reserved":
        return "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-600 cursor-not-allowed"
      case "sold":
        return "bg-red-500 text-white hover:bg-red-600 border-red-600 cursor-not-allowed"
      default:
        return "bg-green-500 text-white hover:bg-green-600 border-green-600"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando rifas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Rifas Disponibles</h1>
              </div>
            </div>
            {selectedNumbers.length > 0 && (
              <Button onClick={() => setShowPurchaseDialog(true)} className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Comprar ({selectedNumbers.length})</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {!selectedRifa ? (
          // Lista de rifas
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Rifas Activas</h2>
              <p className="text-muted-foreground">Selecciona una rifa para ver los números disponibles</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rifas.map((rifa) => (
                <Card
                  key={rifa.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleSelectRifa(rifa)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={rifa.status === "active" ? "default" : "secondary"}>
                        {rifa.status === "active" ? "Activa" : "Finalizada"}
                      </Badge>
                      <span className="text-2xl font-bold text-primary">${Number(rifa.ticket_price).toFixed(2)}</span>
                    </div>
                    <CardTitle className="text-xl">{rifa.title}</CardTitle>
                    <CardDescription>{rifa.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{rifa.prize_description}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm">{rifa.available_numbers} números disponibles</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm">Sorteo: {new Date(rifa.draw_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4">Ver Números</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Selección de números
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button variant="ghost" onClick={() => setSelectedRifa(null)} className="mb-2">
                  ← Volver a rifas
                </Button>
                <h2 className="text-3xl font-bold">{selectedRifa.title}</h2>
                <p className="text-muted-foreground">{selectedRifa.prize_description}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">${Number(selectedRifa.ticket_price).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">por número</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Panel de selección */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Selecciona tus números</CardTitle>
                    <CardDescription>Números del 000 al 999. Selecciona los que más te gusten.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Disponible</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                        <span>Reservado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded"></div>
                        <span>Vendido</span>
                      </div>
                    </div>

                    {/* Búsqueda y selección rápida */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <Label htmlFor="search">Buscar número</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="search"
                            placeholder="Ej: 123, 007, 999"
                            value={searchNumber}
                            onChange={(e) => setSearchNumber(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleQuickSelect(1)}>
                          1 al azar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickSelect(5)}>
                          5 al azar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleQuickSelect(10)}>
                          10 al azar
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2 max-h-96 overflow-y-auto">
                      {filteredNumbers.map((numberObj) => {
                        const isSelected = selectedNumbers.includes(numberObj.number)
                        const isDisabled = numberObj.status !== "available" && !isSelected

                        return (
                          <Button
                            key={numberObj.number}
                            size="sm"
                            className={`h-10 text-xs ${getNumberButtonClass(numberObj, isSelected)}`}
                            onClick={() => handleNumberSelect(numberObj)}
                            disabled={isDisabled}
                          >
                            {numberObj.number}
                          </Button>
                        )
                      })}
                    </div>

                    {filteredNumbers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        {searchNumber ? "No se encontraron números" : "Cargando números..."}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Panel de resumen */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumen de compra</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Números seleccionados ({selectedNumbers.length})</Label>
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        {selectedNumbers.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {selectedNumbers.map((number) => (
                              <Badge
                                key={number}
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() => {
                                  const numberObj = allNumbers.find((n) => n.number === number)
                                  if (numberObj) handleNumberSelect(numberObj)
                                }}
                              >
                                {number} ×
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Ningún número seleccionado</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span>Subtotal:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-primary">${totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      disabled={selectedNumbers.length === 0}
                      onClick={() => setShowPurchaseDialog(true)}
                    >
                      Proceder al Pago
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de compra */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Completar Compra</DialogTitle>
            <DialogDescription>Ingresa tus datos para proceder con el pago</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                placeholder="Tu nombre completo"
                value={userInfo.name}
                onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={userInfo.email}
                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={userInfo.phone}
                onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              />
            </div>

            <Alert>
              <AlertDescription>
                <strong>Resumen:</strong>
                <br />
                Rifa: {selectedRifa?.title}
                <br />
                Números: {selectedNumbers.join(", ")}
                <br />
                Total: ${totalPrice.toFixed(2)}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowPurchaseDialog(false)}
                disabled={isProcessingPayment}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handlePurchase}
                disabled={isProcessingPayment || !userInfo.name || !userInfo.email}
              >
                {isProcessingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pagar ${totalPrice.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
