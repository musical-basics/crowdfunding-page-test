"use client"

import { useState } from "react"
import { Loader2, Upload, Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadCreatorAsset } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { compressImageFile } from "@/lib/image-utils"

interface ImageFrameProps {
    label: string
    description?: string
    imageUrl?: string
    onImageChange: (url: string) => void
    aspectRatio?: "video" | "square" | "auto"
    className?: string
}

export function ImageFrame({
    label,
    description,
    imageUrl,
    onImageChange,
    aspectRatio = "video",
    className
}: ImageFrameProps) {
    const { toast } = useToast()
    const [isUploading, setIsUploading] = useState(false)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            // Compress image
            const compressedFile = await compressImageFile(file)

            const formData = new FormData()
            formData.append("file", compressedFile)

            const result = await uploadCreatorAsset(formData)

            if (result.success && result.url) {
                onImageChange(result.url)
                toast({ title: "Image uploaded successfully" })
            } else {
                toast({
                    title: "Upload failed",
                    description: result.error || "Unknown error",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error(error)
            toast({
                title: "Upload error",
                description: "Something went wrong",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        onImageChange("")
    }

    return (
        <div className={cn("space-y-3", className)}>
            <div className="flex justify-between items-baseline">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
                {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
            </div>

            <div className={cn(
                "relative group rounded-lg border border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center transition-colors hover:bg-muted/50",
                aspectRatio === "video" && "aspect-video",
                aspectRatio === "square" && "aspect-square",
                aspectRatio === "auto" && "min-h-[200px]"
            )}>
                {imageUrl ? (
                    <>
                        {/* Image Preview */}
                        <img
                            src={imageUrl}
                            alt={label}
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer">
                                <div className="h-9 w-9 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white backdrop-blur-sm transition-colors">
                                    <Upload className="h-4 w-4" />
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                            </label>

                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-9 w-9"
                                onClick={handleRemove}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-6 space-y-2">
                        <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            {isUploading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">
                                {isUploading ? "Uploading..." : "Click to upload image"}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                JPG, PNG, GIF up to 5MB
                            </p>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={isUploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
