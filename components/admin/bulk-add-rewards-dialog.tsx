"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ListPlus } from "lucide-react"
import { bulkCreateRewards } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { useCampaign } from "@/context/campaign-context"

// Default empty row structure
const EMPTY_ROW = {
    title: "",
    price: "",
    description: "",
    items: "",
    delivery: "",
    quantity: ""
}

export function BulkAddRewardsDialog() {
    const [open, setOpen] = useState(false)
    const [rows, setRows] = useState([EMPTY_ROW])
    const [isSaving, setIsSaving] = useState(false)
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign()

    const addRow = () => {
        setRows([...rows, { ...EMPTY_ROW }])
    }

    const removeRow = (index: number) => {
        if (rows.length === 1) return
        const newRows = rows.filter((_, i) => i !== index)
        setRows(newRows)
    }

    const updateRow = (index: number, field: string, value: string) => {
        const newRows = [...rows]
        // @ts-ignore
        newRows[index][field] = value
        setRows(newRows)
    }

    const handleSave = async () => {
        const validRows = rows.filter(r => r.title && r.price)

        if (validRows.length === 0) {
            toast({ title: "Error", description: "Please fill out at least one reward.", variant: "destructive" })
            return
        }

        setIsSaving(true)

        const payload = validRows.map(r => ({
            title: r.title,
            price: parseFloat(r.price),
            description: r.description,
            items: r.items,
            delivery: r.delivery,
            quantity: r.quantity ? parseInt(r.quantity) : null
        }))

        const result = await bulkCreateRewards(payload)

        if (result.success) {
            if (refreshCampaign) {
                await refreshCampaign()
            }

            toast({ title: "Success", description: `Added ${validRows.length} rewards.` })
            setRows([EMPTY_ROW])
            setOpen(false)
        } else {
            toast({ title: "Error", description: result.error, variant: "destructive" })
        }

        setIsSaving(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white hover:bg-gray-100/80">
                    <ListPlus className="h-4 w-4" /> Bulk Add
                </Button>
            </DialogTrigger>

            {/* UPDATE: Increased width to 90vw and added max height */}
            <DialogContent className="sm:max-w-[95vw] w-full max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Add Rewards</DialogTitle>
                    <DialogDescription>
                        Add multiple rewards at once.
                    </DialogDescription>
                </DialogHeader>

                {/* Scrollable container for the table */}
                <div className="flex-1 overflow-y-auto border rounded-md min-h-[300px]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-secondary z-10">
                            <TableRow>
                                <TableHead className="min-w-[200px]">Title</TableHead>
                                <TableHead className="w-[120px]">Price ($)</TableHead>
                                <TableHead className="min-w-[300px]">Description</TableHead>
                                <TableHead className="min-w-[200px]">Items (comma sep)</TableHead>
                                <TableHead className="min-w-[150px]">Delivery</TableHead>
                                <TableHead className="w-[100px]">Qty</TableHead>
                                <TableHead className="w-[60px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Input
                                            placeholder="Reward Title"
                                            value={row.title}
                                            onChange={(e) => updateRow(index, 'title', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={row.price}
                                            onChange={(e) => updateRow(index, 'price', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Description..."
                                            value={row.description}
                                            onChange={(e) => updateRow(index, 'description', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Item 1, Item 2"
                                            value={row.items}
                                            onChange={(e) => updateRow(index, 'items', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Feb 2026"
                                            value={row.delivery}
                                            onChange={(e) => updateRow(index, 'delivery', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            placeholder="∞"
                                            value={row.quantity}
                                            onChange={(e) => updateRow(index, 'quantity', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeRow(index)}
                                            className="text-muted-foreground hover:text-red-500"
                                            disabled={rows.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex justify-between py-2 border-t pt-4">
                    <Button variant="ghost" onClick={addRow} className="gap-2 text-primary hover:text-primary hover:bg-primary/10">
                        <Plus className="h-4 w-4" /> Add New Row
                    </Button>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                            {isSaving ? "Saving..." : "Save All Rewards"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
