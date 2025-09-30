"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, Users, DollarSign, Calendar, Mail, Phone } from "lucide-react"

interface Rifa {
  id: number
  title: string
  status: string
  ticket_price: number
  total_numbers: number
  start_date: string
  end_date: string
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

interface RifasModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rifas: Rifa[]
  type: "all" | "active"
}

export function RifasModal({ open, onOpenChange, rifas, type }: RifasModalProps) {
  const title = type === "all" ? "Todas las Rifas" : "Rifas Activas"
  const description = type === "all" ? "Lista completa de rifas en el sistema" : "Rifas actualmente en curso"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Números</TableHead>
                <TableHead>Fecha Inicio</TableHead>
                <TableHead>Fecha Fin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rifas.map((rifa) => (
                <TableRow key={rifa.id}>
                  <TableCell className="font-medium">{rifa.title}</TableCell>
                  <TableCell>
                    <Badge variant={rifa.status === "active" ? "default" : "secondary"}>
                      {rifa.status === "active" ? "Activa" : rifa.status === "completed" ? "Completada" : "Cancelada"}
                    </Badge>
                  </TableCell>
                  <TableCell>${rifa.ticket_price.toFixed(2)}</TableCell>
                  <TableCell>{rifa.total_numbers}</TableCell>
                  <TableCell>{new Date(rifa.start_date).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(rifa.end_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {rifas.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay rifas para mostrar</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface UsersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  users: User[]
}

export function UsersModal({ open, onOpenChange, users }: UsersModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Todos los Usuarios
          </DialogTitle>
          <DialogDescription>Lista completa de usuarios registrados</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Números Comprados</TableHead>
                <TableHead>Fecha Registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.phone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.total_numbers > 0 ? "default" : "secondary"}>{user.total_numbers}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay usuarios registrados</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

interface PaymentsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payments: Payment[]
  type: "all" | "pending"
}

export function PaymentsModal({ open, onOpenChange, payments, type }: PaymentsModalProps) {
  const title = type === "all" ? "Ingresos Totales" : "Pagos Pendientes"
  const description = type === "all" ? "Historial completo de pagos completados" : "Pagos pendientes de verificación"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rifa</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Números</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.user.name}</div>
                      <div className="text-xs text-muted-foreground">{payment.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{payment.rifa.title}</TableCell>
                  <TableCell className="font-semibold">${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {payment.numbersPurchased.slice(0, 3).map((num, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {num}
                        </Badge>
                      ))}
                      {payment.numbersPurchased.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{payment.numbersPurchased.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {payments.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay pagos para mostrar</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
