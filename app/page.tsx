import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Users, Clock, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">RifaMax</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="#rifas" className="text-muted-foreground hover:text-foreground transition-colors">
                Rifas Activas
              </Link>
              <Link href="#como-funciona" className="text-muted-foreground hover:text-foreground transition-colors">
                Cómo Funciona
              </Link>
              <Link href="#ganadores" className="text-muted-foreground hover:text-foreground transition-colors">
                Ganadores
              </Link>
            </nav>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🎉 Nueva Rifa Disponible
          </Badge>
          <h2 className="text-5xl font-bold text-balance mb-6">
            Participa en la <span className="text-primary">Gran Rifa 2025</span>
          </h2>
          <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
            Compra tu número de la suerte y participa por increíbles premios. Sistema seguro, transparente y fácil de
            usar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rifas">
              <Button size="lg" className="text-lg px-8">
                Ver Rifas Activas
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              Cómo Participar
            </Button>
          </div>
        </div>
      </section>

      {/* Current Raffle */}
      <section id="rifas" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Rifa Activa</h3>
            <p className="text-muted-foreground">Participa ahora y gana increíbles premios</p>
          </div>

          <Card className="max-w-4xl mx-auto bg-card border-border">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl mb-2">Gran Rifa 2025</CardTitle>
              <CardDescription className="text-lg">iPhone 15 Pro Max + $500 en efectivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Premio Principal</h4>
                  <p className="text-sm text-muted-foreground">iPhone 15 Pro Max + $500</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Números Disponibles</h4>
                  <p className="text-sm text-muted-foreground">847 de 1000</p>
                </div>
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-1">Sorteo</h4>
                  <p className="text-sm text-muted-foreground">1 de Abril, 2025</p>
                </div>
              </div>

              <div className="text-center pt-4">
                <div className="text-3xl font-bold text-primary mb-2">$25.00</div>
                <p className="text-muted-foreground mb-6">por número</p>
                <Link href="/rifas">
                  <Button size="lg" className="text-lg px-12">
                    Comprar Números
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Cómo Funciona</h3>
            <p className="text-muted-foreground">Proceso simple y seguro en 3 pasos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h4 className="text-xl font-semibold mb-3">Elige tu Número</h4>
              <p className="text-muted-foreground">
                Selecciona uno o varios números del 000 al 999. Cada número tiene las mismas probabilidades de ganar.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h4 className="text-xl font-semibold mb-3">Realiza el Pago</h4>
              <p className="text-muted-foreground">
                Completa tu información y realiza el pago de forma segura. Tu número se reserva inmediatamente.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h4 className="text-xl font-semibold mb-3">Espera el Sorteo</h4>
              <p className="text-muted-foreground">
                El sorteo se realiza en vivo en la fecha programada. Si tu número sale, ¡ganaste el premio!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">¿Por qué Confiar en Nosotros?</h3>
            <p className="text-muted-foreground">Transparencia y seguridad garantizada</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <Card className="text-center p-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">100% Seguro</h4>
              <p className="text-sm text-muted-foreground">Pagos encriptados y datos protegidos</p>
            </Card>
            <Card className="text-center p-6">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Premios Reales</h4>
              <p className="text-sm text-muted-foreground">Todos los premios son entregados</p>
            </Card>
            <Card className="text-center p-6">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Sorteos Públicos</h4>
              <p className="text-sm text-muted-foreground">Transmisión en vivo del sorteo</p>
            </Card>
            <Card className="text-center p-6">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="font-semibold mb-2">Soporte 24/7</h4>
              <p className="text-sm text-muted-foreground">Atención al cliente siempre disponible</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">RifaMax</span>
              </div>
              <p className="text-sm text-muted-foreground">
                El sistema de rifas más confiable y transparente del mercado.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Rifas</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Rifas Activas
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Próximas Rifas
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Historial
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Soporte</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cómo Participar
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Preguntas Frecuentes
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contacto
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Reglamento
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 RifaMax. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
