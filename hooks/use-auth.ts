"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Admin {
  id: number
  username: string
  email: string
}

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (token) {
      // Verificar token con el servidor
      fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.admin) {
            setAdmin(data.admin)
          } else {
            localStorage.removeItem("admin_token")
          }
        })
        .catch(() => {
          localStorage.removeItem("admin_token")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem("admin_token")
    setAdmin(null)
    router.push("/login")
  }

  return {
    admin,
    isLoading,
    logout,
    isAuthenticated: !!admin,
  }
}
