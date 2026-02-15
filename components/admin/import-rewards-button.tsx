"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { importRewards } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { useCampaign } from "@/context/campaign-context"

export function ImportRewardsButton() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign() // Added for instant refresh
    const [isUploading, setIsUploading] = useState(false)

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
            toast({ title: "Invalid File", description: "Please upload a .csv file", variant: "destructive" })
            return
        }

        setIsUploading(true)
        const formData = new FormData()
        formData.append("file", file)

        try {
            const result = await importRewards(formData)

            if (result.success) {
                // Refresh context immediately
                if (refreshCampaign) {
                    await refreshCampaign()
                }

                toast({
                    title: "Import Successful",
                    description: `Imported ${result.count} rewards successfully.`,
                    variant: "default"
                })
            } else {
                toast({
                    title: "Import Failed",
                    description: result.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "System Error",
                description: "Failed to process the CSV file.",
                variant: "destructive"
            })
        } finally {
            setIsUploading(false)
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Button
                variant="outline"
                onClick={handleClick}
                disabled={isUploading}
                className="bg-white hover:bg-gray-100/80"
            >
                {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Upload className="mr-2 h-4 w-4" />
                )}
                {isUploading ? "Importing..." : "Import CSV"}
            </Button>
        </>
    )
}
