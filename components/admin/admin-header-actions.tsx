"use client"

import { useEffect, useState, ReactNode } from "react"
import { createPortal } from "react-dom"

export function AdminHeaderActions({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const target = document.getElementById("admin-header-actions")
    if (!target) return null

    return createPortal(children, target)
}
