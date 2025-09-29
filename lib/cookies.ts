"use client"

// Utilidad para manejar cookies en el cliente
export function setCookie(name: string, value: string, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  const isSecure = window.location.protocol === "https:"
  const cookieString = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${isSecure ? ";Secure" : ""}`

  document.cookie = cookieString
  console.log("[v0] Cookie configurada:", `${name}=${value.substring(0, 20)}...`)
  console.log("[v0] Cookie string completo:", cookieString)

  setTimeout(() => {
    const saved = getCookie(name)
    console.log("[v0] Verificación cookie guardada:", saved ? "exitosa" : "falló")
  }, 50)
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null

  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}
