"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, HelpCircle } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { createReward } from "@/app/admin/actions" // Import the server action
import { useToast } from "@/hooks/use-toast"

import { useCampaign } from "@/context/campaign-context"
import { ImageCropper } from "./image-cropper"

export function CreateRewardDialog() {
    const [open, setOpen] = useState(false)
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign()
    const [preview, setPreview] = useState("")

    // Cropper States
    const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)
    const [isCropperOpen, setIsCropperOpen] = useState(false)
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                setOriginalImageSrc(reader.result as string)
                setIsCropperOpen(true)
                // Clear the input so selecting the same file again works
                e.target.value = ""
            })
            reader.readAsDataURL(file)
        }
    }

    const handleCropComplete = (blob: Blob) => {
        setCroppedBlob(blob)
        setPreview(URL.createObjectURL(blob))
        setIsCropperOpen(false)
    }

    async function handleSubmit(formData: FormData) {
        // If we have a cropped blob, we must append it manually
        if (croppedBlob) {
            formData.set("imageFile", croppedBlob, "reward-cropped.jpg")
        }

        const result = await createReward(null, formData)

        if (result?.error) {
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            })
        } else {
            // Success case
            setOpen(false) // Close the modal first
            setPreview("")
            setCroppedBlob(null)

            if (refreshCampaign) {
                await refreshCampaign()
            }

            toast({
                title: "Success",
                description: "Reward created successfully",
                variant: "default",
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Reward
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Reward</DialogTitle>
                    <DialogDescription>
                        Add a new pledge tier for your backers.
                    </DialogDescription>
                </DialogHeader>

                {/* The Action Attribute connects to the Server Action */}
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Reward Title</Label>
                        <Input id="title" name="title" placeholder="e.g. Early Bird Special" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Reward Image</Label>
                        <div className="flex items-center gap-4">
                            {preview && (
                                <div className="relative w-24 h-16 rounded overflow-hidden border border-border">
                                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                            <Input
                                id="imageFile"
                                name="imageFile"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price ($)</Label>
                            <Input id="price" name="price" type="number" min="1" placeholder="50" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="delivery">Est. Delivery</Label>
                            <Input id="delivery" name="delivery" placeholder="Feb 2026" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity Limit (Optional)</Label>
                        <Input
                            id="quantity"
                            name="quantity"
                            type="number"
                            min="1"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="badgeType">Badge Type</Label>
                        <select
                            id="badgeType"
                            name="badgeType"
                            defaultValue="none"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="none">None</option>
                            <option value="featured">Most Popular</option>
                            <option value="minimum_package">Minimum Package</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rewardType">Reward Type</Label>
                        <select
                            id="rewardType"
                            name="rewardType"
                            defaultValue="bundle"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="bundle">Bundle</option>
                            <option value="keyboard_only">Keyboard Only</option>
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="checkoutUrl">Checkout URL (Optional)</Label>
                        <Input
                            id="checkoutUrl"
                            name="checkoutUrl"
                            placeholder="https://your-shop.com/cart/..."
                        />
                        <p className="text-xs text-muted-foreground">Overrides the default checkout logic if set.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="What do they get?" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="items">Items Included (comma separated)</Label>
                        <Input id="items" name="items" placeholder="Keyboard, Stand, Cable..." required />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                            <Label htmlFor="shopifyVariantId">Shopify Variant Config</Label>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-[300px]">
                                        <p>For single items: Paste the Variant ID (e.g. 444333222).</p>
                                        <p className="mt-2">For items with options (Size/Color), paste a JSON map:</p>
                                        <pre className="mt-1 bg-black/10 p-1 rounded text-[10px]">
                                            {`{
  "DS5.5_Midnight Black": "111...",
  "DS5.5_Pearl White": "222...",
  "DS6.0_Midnight Black": "333..."
}`}
                                        </pre>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        <Textarea
                            id="shopifyVariantId"
                            name="shopifyVariantId"
                            placeholder='444333222 OR {"DS5.5_Midnight Black": "..."}'
                            className="font-mono text-xs"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Reward</Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Cropper Modal */}
            {originalImageSrc && (
                <ImageCropper
                    isOpen={isCropperOpen}
                    imageSrc={originalImageSrc}
                    onClose={() => setIsCropperOpen(false)}
                    onCropComplete={handleCropComplete}
                    aspect={16 / 9} // Landscape for rewards
                />
            )}
        </Dialog >
    )
}
