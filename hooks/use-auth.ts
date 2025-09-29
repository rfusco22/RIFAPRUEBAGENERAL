"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCookie, deleteCookie } from "@/lib/cookies"

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
    const token = getCookie("admin_token")
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
            deleteCookie("admin_token")
          }
        })
        .catch(() => {
          deleteCookie("admin_token")
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
    }
  }, [])

  const logout = () => {
    deleteCookie("admin_token")
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
