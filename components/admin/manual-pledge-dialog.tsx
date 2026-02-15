"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createManualPledge } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"
import { useCampaign } from "@/context/campaign-context"

export function ManualPledgeDialog() {
    const [open, setOpen] = useState(false)
    const { campaign, refreshCampaign } = useCampaign()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true)
        try {
            const result = await createManualPledge(formData)
            if (result.success) {
                toast({ title: "Success", description: "Backer added successfully." })
                setOpen(false)
                refreshCampaign() // Update numbers immediately
            } else {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to add backer", variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Manual Backer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Offline/Previous Backer</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Select Reward</Label>
                        <Select name="rewardId" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reward tier..." />
                            </SelectTrigger>
                            <SelectContent>
                                {campaign?.rewards.map(r => (
                                    <SelectItem key={r.id} value={r.id}>
                                        {r.title} - ${r.price}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Amount Paid ($)</Label>
                            <Input name="amount" type="number" required placeholder="599" />
                        </div>
                        <div className="grid gap-2">
                            <Label>Date</Label>
                            <Input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Backer Name</Label>
                        <Input name="name" placeholder="John Doe" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" placeholder="john@example.com" required />
                    </div>

                    <div className="grid gap-2">
                        <Label>Shipping Location</Label>
                        <Input name="location" placeholder="United States" />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Backer"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
