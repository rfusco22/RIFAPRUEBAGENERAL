"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, DollarSign, Settings, LogOut, Plus, Eye, Edit, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { getCookie } from "@/lib/cookies"
import { RifasModal, UsersModal, PaymentsModal } from "@/components/admin/stats-modals"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DashboardStats {
  totalRifas: number
  activeRifas: number
  totalUsers: number
  totalRevenue: number
  pendingPayments: number
}

interface Rifa {
  id: number
  title: string
  description: string
  prize_description: string
  ticket_price: number
  total_numbers: number
  start_date: string
  end_date: string
  status: string
}

interface User {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
  total_numbers: number
}

interface Payment {
  id: number
  amount: number
  paymentStatus: string
  paymentMethod: string
  numbersPurchased: string[]
  createdAt: string
  user: {
    name: string
    email: string
  }
  rifa: {
    title: string
  }
}

export default function AdminDashboard() {
  const { admin, isLoading, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalRifas: 0,
    activeRifas: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  })

  const [showRifasModal, setShowRifasModal] = useState(false)
  const [showActiveRifasModal, setShowActiveRifasModal] = useState(false)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showRevenueModal, setShowRevenueModal] = useState(false)
  const [showPendingPaymentsModal, setShowPendingPaymentsModal] = useState(false)

  const [rifas, setRifas] = useState<Rifa[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoadingData, setIsLoadingData] = useState(false)

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showVerifyDialog, setShowVerifyDialog] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (admin) {
      fetchDashboardStats()
      fetchRifas()
      fetchUsers()
      fetchPayments()
    }
  }, [admin])

  const fetchDashboardStats = async () => {
    try {
      const token = getCookie("admin_token")
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    }
  }

  const fetchRifas = async () => {
    try {
      const response = await fetch("/api/rifas")
      const data = await response.json()
      if (data.rifas) {
        setRifas(data.rifas)
      }
    } catch (error) {
      console.error("Error fetching rifas:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = getCookie("admin_token")
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchPayments = async () => {
    try {
      const token = getCookie("admin_token")
      const response = await fetch("/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setPayments(data.payments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  const handleVerifyPayment = async (status: "completed" | "failed") => {
    if (!selectedPayment) return

    setIsVerifying(true)
    setError("")
    setSuccess("")

    try {
      const token = getCookie("admin_token")
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(status === "completed" ? "Pago verificado y aprobado exitosamente" : "Pago marcado como fallido")
        setShowVerifyDialog(false)
        setSelectedPayment(null)
        // Refresh data
        await Promise.all([fetchDashboardStats(), fetchPayments()])
      } else {
        setError(data.error || "Error al verificar el pago")
      }
    } catch (error) {
      setError("Error de conexión")
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  const activeRifas = rifas.filter((r) => r.status === "active")
  const completedPayments = payments.filter((p) => p.paymentStatus === "completed")
  const pendingPayments = payments.filter((p) => p.paymentStatus === "pending")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">RifaMax Admin</h1>
              </div>
              <Badge variant="secondary">Panel de Administración</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Bienvenido, {admin.username}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">{success}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowRifasModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rifas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRifas}</div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowActiveRifasModal(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Activas</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeRifas}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowUsersModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowRevenueModal(true)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${typeof stats.totalRevenue === "number" ? stats.totalRevenue.toFixed(2) : "0.00"}
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowPendingPaymentsModal(true)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.pendingPayments}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rifas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rifas">Gestión de Rifas</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="numeros">Números</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
          </TabsList>

          <TabsContent value="rifas" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestión de Rifas</h2>
              <Link href="/admin/rifas/nueva">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Rifa
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rifas Recientes</CardTitle>
                <CardDescription>Administra todas las rifas del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rifas.slice(0, 5).map((rifa) => (
                    <div
                      key={rifa.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{rifa.title}</h3>
                        <p className="text-sm text-muted-foreground">{rifa.prize_description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant={rifa.status === "active" ? "default" : "secondary"}>
                            {rifa.status === "active"
                              ? "Activa"
                              : rifa.status === "completed"
                                ? "Completada"
                                : "Cancelada"}
                          </Badge>
                          <span className="text-sm">{rifa.total_numbers} números totales</span>
                          <span className="text-sm">${rifa.ticket_price.toFixed(2)} por número</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                  {rifas.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay rifas creadas. Crea tu primera rifa.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
              <Link href="/admin/usuarios">
                <Button>
                  <Users className="h-4 w-4 mr-2" />
                  Ver Todos
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios Registrados</CardTitle>
                <CardDescription>Lista de todos los usuarios del sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div>
                        <h3 className="font-semibold">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        {user.phone && <p className="text-sm text-muted-foreground">{user.phone}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.total_numbers} números comprados</p>
                        <p className="text-sm text-muted-foreground">
                          Registrado: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestión de Números */}
          <TabsContent value="numeros" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestión de Números</h2>
              <Link href="/admin/usuarios">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Asignar Número
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Números</CardTitle>
                <CardDescription>Visualiza y gestiona el estado de todos los números</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-green-500">847</div>
                    <p className="text-sm text-muted-foreground">Disponibles</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">25</div>
                    <p className="text-sm text-muted-foreground">Reservados</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">128</div>
                    <p className="text-sm text-muted-foreground">Pagados</p>
                  </div>
                  <div className="text-center p-4 border border-border rounded-lg">
                    <div className="text-2xl font-bold">1000</div>
                    <p className="text-sm text-muted-foreground">Total</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Números Vendidos Recientemente</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">007 - Juan Pérez</Badge>
                    <Badge variant="secondary">123 - María García</Badge>
                    <Badge variant="secondary">456 - Carlos López</Badge>
                    <Badge variant="secondary">789 - Ana Martínez</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagos" className="space-y-6">
            <h2 className="text-2xl font-bold">Gestión de Pagos</h2>

            <Card>
              <CardHeader>
                <CardTitle>Pagos Recientes</CardTitle>
                <CardDescription>Historial de transacciones y pagos pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.slice(0, 10).map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{payment.user.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {payment.numbersPurchased.length} números - ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Números: {payment.numbersPurchased.slice(0, 3).join(", ")}
                          {payment.numbersPurchased.length > 3 && ` +${payment.numbersPurchased.length - 3} más`}
                        </p>
                        <p className="text-sm text-muted-foreground">Rifa: {payment.rifa.title}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge
                            variant={
                              payment.paymentStatus === "completed"
                                ? "default"
                                : payment.paymentStatus === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {payment.paymentStatus === "completed"
                              ? "Completado"
                              : payment.paymentStatus === "pending"
                                ? "Pendiente"
                                : payment.paymentStatus === "failed"
                                  ? "Fallido"
                                  : "Reembolsado"}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {payment.paymentStatus === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setShowVerifyDialog(true)
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Verificar Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {payments.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No hay pagos registrados</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <RifasModal open={showRifasModal} onOpenChange={setShowRifasModal} rifas={rifas} type="all" />
      <RifasModal
        open={showActiveRifasModal}
        onOpenChange={setShowActiveRifasModal}
        rifas={activeRifas}
        type="active"
      />
      <UsersModal open={showUsersModal} onOpenChange={setShowUsersModal} users={users} />
      <PaymentsModal
        open={showRevenueModal}
        onOpenChange={setShowRevenueModal}
        payments={completedPayments}
        type="all"
      />
      <PaymentsModal
        open={showPendingPaymentsModal}
        onOpenChange={setShowPendingPaymentsModal}
        payments={pendingPayments}
        type="pending"
      />

      {/* AlertDialog for payment verification */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verificar Pago</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedPayment && (
                <div className="space-y-2 mt-4">
                  <p>
                    <strong>Usuario:</strong> {selectedPayment.user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedPayment.user.email}
                  </p>
                  <p>
                    <strong>Rifa:</strong> {selectedPayment.rifa.title}
                  </p>
                  <p>
                    <strong>Monto:</strong> ${selectedPayment.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Números:</strong> {selectedPayment.numbersPurchased.join(", ")}
                  </p>
                  <p className="mt-4 text-foreground">
                    ¿Deseas aprobar este pago? Los números serán asignados al usuario automáticamente.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isVerifying}>Cancelar</AlertDialogCancel>
            <Button variant="destructive" onClick={() => handleVerifyPayment("failed")} disabled={isVerifying}>
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
            <AlertDialogAction onClick={() => handleVerifyPayment("completed")} disabled={isVerifying}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {isVerifying ? "Verificando..." : "Aprobar Pago"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
