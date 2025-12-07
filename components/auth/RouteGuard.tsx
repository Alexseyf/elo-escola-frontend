"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/stores/useAuthStore"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, checkAuth } = useAuthStore()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const isAuth = checkAuth() || (isAuthenticated && !!user)

    if (!isAuth) {
      setAuthorized(false)
      router.push("/login")
      return
    }

    if (user && user.roles) {
      const hasRole = user.roles.some((role) => 
        allowedRoles.includes(role.toUpperCase())
      )

      if (hasRole) {
        setAuthorized(true)
      } else {
        setAuthorized(false)
        if (user.roles.includes("ADMIN")) {
            router.push("/admin/dashboard")
        } else if (user.roles.includes("PROFESSOR")) {
            router.push("/professor/dashboard")
        } else if (user.roles.includes("RESPONSAVEL")) {
            router.push("/responsavel/dashboard")
        } else {
            router.push("/")
        }
      }
    }
  }, [user, isAuthenticated, checkAuth, router, allowedRoles, pathname])

  if (!authorized) {
    return null
  }

  return <>{children}</>
}
