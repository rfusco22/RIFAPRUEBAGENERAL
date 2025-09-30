"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, DollarSign, Settings, LogOut, Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { getCookie } from "@/lib/cookies"

interface DashboardStats {
  totalRifas: number
  activeRifas: number
  totalUsers: number
  totalRevenue: number
  pendingPayments: number
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

  useEffect(() => {
    if (admin) {
      fetchDashboardStats()
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
    return null // El middleware redirigirá al login
  }

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Rifas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRifas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rifas Activas</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeRifas}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
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

          <Card>
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
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Gran Rifa 2025</h3>
                      <p className="text-sm text-muted-foreground">iPhone 15 Pro Max + $500 en efectivo</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="default">Activa</Badge>
                        <span className="text-sm">847/1000 números disponibles</span>
                        <span className="text-sm">$25.00 por número</span>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuarios" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
              <Link href="/admin/usuarios/nuevo">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
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
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Juan Pérez</h3>
                      <p className="text-sm text-muted-foreground">juan@email.com</p>
                      <p className="text-sm text-muted-foreground">+1234567890</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">3 números comprados</p>
                      <p className="text-sm text-muted-foreground">Números: 123, 456, 789</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">María García</h3>
                      <p className="text-sm text-muted-foreground">maria@email.com</p>
                      <p className="text-sm text-muted-foreground">+1234567891</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">1 número comprado</p>
                      <p className="text-sm text-muted-foreground">Número: 007</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="numeros" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gestión de Números</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Asignar Número
              </Button>
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
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Juan Pérez</h3>
                      <p className="text-sm text-muted-foreground">3 números - $75.00</p>
                      <p className="text-sm text-muted-foreground">Números: 123, 456, 789</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="default">Completado</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Hace 2 horas</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div>
                      <h3 className="font-semibold">María García</h3>
                      <p className="text-sm text-muted-foreground">1 número - $25.00</p>
                      <p className="text-sm text-muted-foreground">Número: 007</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">Pendiente</Badge>
                      <p className="text-sm text-muted-foreground mt-1">Hace 1 hora</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
