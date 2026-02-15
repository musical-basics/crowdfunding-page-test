"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Loader2, FileSpreadsheet } from "lucide-react"
import { bulkImportPledges } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { useCampaign } from "@/context/campaign-context"

export function ImportPledgesButton() {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign()
    const [isUploading, setIsUploading] = useState(false)

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)

        try {
            const text = await file.text()
            const rows = parseCSV(text)

            if (rows.length === 0) {
                toast({ title: "Empty File", description: "No valid rows found.", variant: "destructive" })
                return
            }

            const result = await bulkImportPledges(rows)

            if (result.success) {
                await refreshCampaign()
                toast({
                    title: "Import Complete",
                    description: `Successfully added ${result.count} backers.`,
                    variant: "default"
                })
                if (result.errors.length > 0) {
                    console.error("Import Errors:", result.errors)
                    alert(`Imported ${result.count} rows, but some failed:\n${result.errors.slice(0, 5).join("\n")}`)
                }
            }
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to process file.", variant: "destructive" })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ""
        }
    }

    // Simple CSV Parser (Assumes standard headers)
    function parseCSV(csvText: string) {
        const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0)
        if (lines.length < 2) return []

        const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/"/g, ""))
        const data = []

        for (let i = 1; i < lines.length; i++) {
            // Handle quotes crudely
            const cells = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''))

            const row: any = {}

            // Map common CSV headers to our internal keys
            headers.forEach((header, index) => {
                const value = cells[index]
                if (header.includes("email")) row.email = value
                else if (header.includes("name")) row.name = value
                else if (header.includes("amount") || header.includes("price") || header.includes("subtotal")) row.amount = value
                else if (header.includes("date") || header.includes("created")) row.date = value
                else if (header.includes("reward")) row.reward = value
                else if (header.includes("location") || header.includes("country") || header.includes("billing count")) row.location = value
                else if (header.includes("address")) row.address = value
                else if (header.includes("size")) row.size = value
                else if (header.includes("color")) row.color = value
            })

            if (row.email && row.amount) {
                data.push(row)
            }
        }
        return data
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
                className="bg-white hover:bg-gray-100/80 gap-2"
            >
                {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                )}
                {isUploading ? "Importing..." : "Import CSV"}
            </Button>
        </>
    )
}
