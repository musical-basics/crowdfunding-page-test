"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import getCroppedImg from "@/lib/canvas-utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

interface ImageCropperProps {
    imageSrc: string
    isOpen: boolean
    onClose: () => void
    onCropComplete: (croppedBlob: Blob) => void
    aspect?: number // Added aspect prop
}

export function ImageCropper({ imageSrc, isOpen, onClose, onCropComplete, aspect = 1 }: ImageCropperProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    // Check if window is defined (client-side only)
    if (typeof window === "undefined") return null

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        setIsProcessing(true)
        try {
            const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (croppedBlob) {
                onCropComplete(croppedBlob)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>

                <div className="relative flex-1 bg-black w-full overflow-hidden">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect} // Use the aspect prop
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={onZoomChange}
                        showGrid={false}
                    />
                </div>

                <div className="p-4 bg-background border-t space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Zoom</span>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(vals) => onZoomChange(vals[0])}
                            className="flex-1"
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isProcessing} className="bg-emerald-600 hover:bg-emerald-700">
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save & Apply
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
