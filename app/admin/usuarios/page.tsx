"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trophy, Users, Plus, ArrowLeft, Mail, Phone, Calendar } from "lucide-react"
import Link from "next/link"

interface User {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
  total_numbers: number
  purchased_numbers: Array<{ number: string; rifaTitle: string }>
}

interface Rifa {
  id: number
  title: string
  status: string
}

export default function UsuariosPage() {
  const { admin, isLoading } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [rifas, setRifas] = useState<Rifa[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const [assignData, setAssignData] = useState({
    rifaId: "",
    numbers: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (admin) {
      fetchUsers()
      fetchRifas()
    }
  }, [admin])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoadingData(false)
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

  const handleCreateUser = async () => {
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(newUser),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Usuario creado exitosamente")
        setNewUser({ name: "", email: "", phone: "" })
        setShowNewUserDialog(false)
        fetchUsers()
      } else {
        setError(data.error || "Error al crear usuario")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  const handleAssignNumbers = async () => {
    if (!selectedUser || !assignData.rifaId || !assignData.numbers) {
      setError("Todos los campos son requeridos")
      return
    }

    setError("")
    setSuccess("")

    try {
      const numbers = assignData.numbers.split(",").map((n) => n.trim().padStart(3, "0"))

      const response = await fetch("/api/admin/numbers/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          rifaId: Number.parseInt(assignData.rifaId),
          userId: selectedUser.id,
          numbers,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(data.message)
        setAssignData({ rifaId: "", numbers: "" })
        setShowAssignDialog(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        setError(data.error || "Error al asignar números")
      }
    } catch (error) {
      setError("Error de conexión")
    }
  }

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    )
  }

  if (!admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
                <span>Volver al Panel</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
              </div>
            </div>
            <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Usuario
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Alerts */}
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios con Compras</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{users.filter((u) => u.total_numbers > 0).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Números Vendidos</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.reduce((total, user) => total + user.total_numbers, 0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuarios</CardTitle>
            <CardDescription>Gestiona todos los usuarios registrados en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">{user.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(user.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {user.total_numbers > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Números comprados ({user.total_numbers}):</p>
                        <div className="flex flex-wrap gap-1">
                          {user.purchased_numbers.map((purchase, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {purchase.number} - {purchase.rifaTitle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge variant={user.total_numbers > 0 ? "default" : "secondary"}>
                      {user.total_numbers} números
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setShowAssignDialog(true)
                      }}
                    >
                      Asignar Números
                    </Button>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New User Dialog */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre completo</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Nombre del usuario"
            />
          </div>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="usuario@email.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+1234567890"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowNewUserDialog(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleCreateUser} disabled={!newUser.name || !newUser.email}>
              Crear Usuario
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Assign Numbers Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Números</DialogTitle>
            <DialogDescription>Asignar números a {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rifa">Seleccionar Rifa</Label>
              <Select
                value={assignData.rifaId}
                onValueChange={(value) => setAssignData({ ...assignData, rifaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una rifa" />
                </SelectTrigger>
                <SelectContent>
                  {rifas
                    .filter((r) => r.status === "active")
                    .map((rifa) => (
                      <SelectItem key={rifa.id} value={rifa.id.toString()}>
                        {rifa.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="numbers">Números (separados por comas)</Label>
              <Input
                id="numbers"
                value={assignData.numbers}
                onChange={(e) => setAssignData({ ...assignData, numbers: e.target.value })}
                placeholder="001, 123, 456"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ejemplo: 001, 123, 456 (se completarán automáticamente con ceros)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowAssignDialog(false)}>
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleAssignNumbers}
                disabled={!assignData.rifaId || !assignData.numbers}
              >
                Asignar Números
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
