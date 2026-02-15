"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCampaign } from "@/context/campaign-context"
import { FAQDialog } from "@/components/admin/faq-dialog"
import { deleteFAQ, updateFAQPageContent } from "../actions"
import { FAQItem, FAQPageContent } from "@/types/campaign"
import { ImageFrame } from "@/components/admin/image-frame"
import { useToast } from "@/hooks/use-toast"
import { AdminHeaderActions } from "@/components/admin/admin-header-actions"
import { Save } from "lucide-react"

// Category order for display
const CATEGORY_ORDER = ["About Purchase", "About Support", "About The Product"]

// Default sidebar content
const DEFAULT_FAQ_PAGE_CONTENT: FAQPageContent = {
    needHelpHtml: `<h4 class="text-lg font-semibold mb-4">Need Help?</h4>
<p class="text-muted-foreground text-sm">Contact our support team for assistance with your order or any questions about DreamPlay.</p>`,
    quickLinksHtml: `<h4 class="text-lg font-semibold mb-4">Quick Links</h4>
<ul class="space-y-2 text-sm">
  <li><a href="#" class="text-blue-600 hover:underline">Shipping Information</a></li>
  <li><a href="#" class="text-blue-600 hover:underline">Warranty Details</a></li>
  <li><a href="#" class="text-blue-600 hover:underline">Product Specifications</a></li>
</ul>`,
    sidebarImageUrl: ""
}

export default function AdminFAQPage() {
    const { toast } = useToast()
    const { campaign, refreshCampaign } = useCampaign()

    // State to manage the FAQ modal
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedFaq, setSelectedFaq] = useState<FAQItem | null>(null)

    // State for sidebar content
    const [sidebarContent, setSidebarContent] = useState<FAQPageContent>(DEFAULT_FAQ_PAGE_CONTENT)
    const [isSaving, setIsSaving] = useState(false)

    // Load sidebar content from campaign
    useEffect(() => {
        if (campaign?.faqPageContent) {
            setSidebarContent({ ...DEFAULT_FAQ_PAGE_CONTENT, ...campaign.faqPageContent })
        }
    }, [campaign])

    const handleEdit = (faq: FAQItem) => {
        setSelectedFaq(faq)
        setIsDialogOpen(true)
    }

    const handleCreate = () => {
        setSelectedFaq(null)
        setIsDialogOpen(true)
    }

    const handleSaveSidebar = async () => {
        setIsSaving(true)
        try {
            const formData = new FormData()
            formData.set("faqPageContent", JSON.stringify(sidebarContent))
            await updateFAQPageContent(formData)
            if (refreshCampaign) await refreshCampaign()
            toast({ title: "FAQ sidebar saved successfully" })
        } catch (error) {
            console.error(error)
            toast({ title: "Error saving sidebar", variant: "destructive" })
        } finally {
            setIsSaving(false)
        }
    }

    // Group FAQs by category
    const groupedFaqs = CATEGORY_ORDER.reduce((acc, category) => {
        acc[category] = campaign?.faqs.filter(faq => faq.category === category) || []
        return acc
    }, {} as Record<string, FAQItem[]>)

    return (
        <div className="space-y-8 max-w-4xl pb-20">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage FAQs</h1>
                <div className="flex gap-2">
                    <AdminHeaderActions>
                        <Button
                            onClick={handleSaveSidebar}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                        >
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Sidebar
                        </Button>
                    </AdminHeaderActions>
                    <Button onClick={handleCreate} variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                        <Plus className="mr-2 h-4 w-4" /> Add Question
                    </Button>
                </div>
            </div>

            {/* FAQs Grouped by Category */}
            {CATEGORY_ORDER.map((category) => (
                <Card key={category}>
                    <CardHeader>
                        <CardTitle>{category}</CardTitle>
                        <CardDescription>
                            {groupedFaqs[category].length} question{groupedFaqs[category].length !== 1 ? 's' : ''}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {groupedFaqs[category].length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No questions in this category yet.
                            </p>
                        ) : (
                            groupedFaqs[category].map((faq) => (
                                <div
                                    key={faq.id}
                                    className="flex items-start justify-between p-4 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                                >
                                    <div className="flex-1 pr-4">
                                        <p className="font-medium text-sm">{faq.question}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                            {faq.answer}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(faq)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this question.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        className="bg-red-600 hover:bg-red-700"
                                                        onClick={async () => {
                                                            await deleteFAQ(faq.id)
                                                            if (refreshCampaign) await refreshCampaign()
                                                        }}
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Sidebar Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>FAQ Sidebar Settings</CardTitle>
                    <CardDescription>
                        Configure the sidebar content displayed on the public FAQ page.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-2">
                        <Label>Need Help Block (HTML)</Label>
                        <Textarea
                            value={sidebarContent.needHelpHtml}
                            onChange={(e) => setSidebarContent(prev => ({ ...prev, needHelpHtml: e.target.value }))}
                            className="min-h-[120px] font-mono text-xs"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Quick Links Block (HTML)</Label>
                        <Textarea
                            value={sidebarContent.quickLinksHtml}
                            onChange={(e) => setSidebarContent(prev => ({ ...prev, quickLinksHtml: e.target.value }))}
                            className="min-h-[120px] font-mono text-xs"
                        />
                    </div>

                    <ImageFrame
                        label="Sidebar Image"
                        description="Optional image at the bottom of the sidebar"
                        imageUrl={sidebarContent.sidebarImageUrl}
                        onImageChange={(url) => setSidebarContent(prev => ({ ...prev, sidebarImageUrl: url }))}
                        aspectRatio="video"
                    />


                </CardContent>
            </Card>

            {/* The Dialog Component */}
            <FAQDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                faqToEdit={selectedFaq}
            />
        </div>
    )
}
