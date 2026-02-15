"use client"

import { CheckCircle } from "lucide-react"

export function SuccessBanner() {
  return (
    <div className="bg-emerald-600 text-white px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center gap-2">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm">
          This project successfully funded on January 16, but you can still Late Pledge for available rewards.
        </p>
      </div>
    </div>
  )
}
