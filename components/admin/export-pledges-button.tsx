"use client"

import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"

interface Backer {
    id: string
    created_at: string
    amount: number
    status: string
    shipping_address: string | null
    shipping_location: string | null
    Customer: { name: string; email: string } | null
    cf_reward: { title: string } | null
}

interface ExportPledgesButtonProps {
    data: Backer[]
}

export function ExportPledgesButton({ data }: ExportPledgesButtonProps) {
    const handleExport = () => {
        // Define headers matching the import format where possible
        const headers = [
            "Date",
            "Name",
            "Email",
            "Reward",
            "Amount",
            "Shipping Address",
            "Location",
            "Status"
        ]

        // Map data to CSV rows
        const rows = data.map(backer => {
            const date = new Date(backer.created_at).toLocaleDateString()
            const name = backer.Customer?.name || "Unknown"
            const email = backer.Customer?.email || ""
            const reward = backer.cf_reward?.title || "No Reward"
            const amount = `${backer.amount}` // Raw number is better for CSV, but import strips $ anyway
            const address = backer.shipping_address ? backer.shipping_address.replace(/"/g, '""') : "" // Escape quotes
            const location = backer.shipping_location || ""
            const status = backer.status

            return [
                date,
                `"${name}"`,
                email,
                `"${reward}"`,
                amount,
                `"${address}"`,
                `"${location}"`,
                status
            ].join(",")
        })

        const csvContent = [
            headers.join(","),
            ...rows
        ].join("\n")

        // Create download link
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `backers_export_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button
            variant="outline"
            onClick={handleExport}
            disabled={data.length === 0}
            className="bg-white hover:bg-gray-100/80 gap-2"
        >
            <Download className="h-4 w-4 text-blue-600" />
            Export CSV
        </Button>
    )
}
