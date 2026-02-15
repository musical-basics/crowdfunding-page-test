"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Trash2, GripVertical } from "lucide-react"

interface SortableGalleryImageProps {
    id: string
    src: string
    index: number
    onRemove: () => void
}

export function SortableGalleryImage({ id, src, index, onRemove }: SortableGalleryImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : "auto",
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative aspect-video bg-muted rounded-md overflow-hidden border touch-none"
        >
            {/* Image */}
            <img src={src} alt={`Gallery ${index}`} className="w-full h-full object-cover" />

            {/* Drag Handle */}
            <div
                {...attributes}
                {...listeners}
                className="absolute top-1 left-1 bg-black/50 text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                aria-label="Drag to reorder"
            >
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Remove Button */}
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation() // Prevent drag start
                    onRemove()
                }}
                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                aria-label="Remove image"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}
