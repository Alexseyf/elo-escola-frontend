"use client"

import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import { useRouter } from "next/navigation"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 text-gray-900">
      <div className="flex flex-col items-center space-y-4 text-center px-4">
        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Página não encontrada</h1>
        <p className="text-lg text-gray-500 max-w-md">
          Desculpe, a página que você está acessando ainda não foi implementada ou não existe.
        </p>
        <div className="pt-4">
            <Button onClick={() => router.back()}>
                Voltar
            </Button>
        </div>
      </div>
    </div>
  )
}
