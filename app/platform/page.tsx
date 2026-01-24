"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/auth/RouteGuard"

export default function PlatformPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/platform/escolas")
  }, [router])

  return (
    <RouteGuard allowedRoles={['PLATFORM_ADMIN']}>
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </RouteGuard>
  )
}
