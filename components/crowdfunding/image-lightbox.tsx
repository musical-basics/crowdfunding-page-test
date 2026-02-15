"use client"

import { useState, useCallback } from "react"
import { X } from "lucide-react"

// Context-free lightbox: manages its own state internally
// Usage: wrap any area containing images with <ImageLightboxProvider>
//        or use the hook directly

export function useImageLightbox() {
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

    const openLightbox = useCallback((src: string) => {
        setLightboxSrc(src)
    }, [])

    const closeLightbox = useCallback(() => {
        setLightboxSrc(null)
    }, [])

    // Click handler for containers with <img> elements (including dangerouslySetInnerHTML)
    const handleContainerClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
        const target = e.target as HTMLElement
        if (target.tagName === "IMG") {
            const src = (target as HTMLImageElement).src
            if (src) {
                e.preventDefault()
                e.stopPropagation()
                openLightbox(src)
            }
        }
    }, [openLightbox])

    return { lightboxSrc, openLightbox, closeLightbox, handleContainerClick }
}

// Standalone lightbox overlay
export function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer z-10"
            >
                <X className="h-6 w-6" />
            </button>
            <img
                src={src}
                alt="Enlarged view"
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    )
}
