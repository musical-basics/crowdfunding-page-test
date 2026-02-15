"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createFAQ, updateFAQ } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { FAQItem } from "@/types/campaign"
import { useCampaign } from "@/context/campaign-context"

interface FAQDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    faqToEdit?: FAQItem | null // If present, we are editing. If null, we are creating.
}

export function FAQDialog({ open, onOpenChange, faqToEdit }: FAQDialogProps) {
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign()
    const [category, setCategory] = useState("About Purchase")

    // Reset form when dialog opens/closes or when switching between edit/create
    useEffect(() => {
        if (faqToEdit) {
            setCategory(faqToEdit.category)
        } else {
            setCategory("About Purchase")
        }
    }, [faqToEdit, open])

    async function handleSubmit(formData: FormData) {
        try {
            formData.append("category", category)

            if (faqToEdit) {
                formData.append("id", faqToEdit.id)
                await updateFAQ(formData)
                toast({ title: "Success", description: "Question updated." })
            } else {
                await createFAQ(formData)
                toast({ title: "Success", description: "New question added." })
            }

            if (refreshCampaign) {
                await refreshCampaign()
            }

            onOpenChange(false)
        } catch (error) {
            toast({ title: "Error", description: "Something went wrong.", variant: "destructive" })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{faqToEdit ? "Edit Question" : "Add New Question"}</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="About Purchase">About Purchase</SelectItem>
                                <SelectItem value="About The Product">About The Product</SelectItem>
                                <SelectItem value="About Support">About Support</SelectItem>
                                <SelectItem value="Shipping">Shipping</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Input
                            id="question"
                            name="question"
                            defaultValue={faqToEdit?.question}
                            placeholder="e.g. Do you ship to Canada?"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea
                            id="answer"
                            name="answer"
                            defaultValue={faqToEdit?.answer}
                            placeholder="Type the answer here..."
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                            {faqToEdit ? "Save Changes" : "Add Question"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
