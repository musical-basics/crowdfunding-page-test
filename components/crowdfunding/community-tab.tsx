"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageSquare, CheckCircle2, Send, Image as ImageIcon, Trash2, Edit2, X, Save } from "lucide-react"
import { getCommunityFeed, postComment, postCampaignUpdate, deleteCampaignUpdate, editCampaignUpdate } from "@/app/actions" // Update path if needed
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function CommunityTab({ isAdmin = false }: { isAdmin?: boolean }) {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const [updates, setUpdates] = useState<any[]>([])
    const { toast } = useToast()

    // Load Data
    useEffect(() => {
        loadFeed()
    }, [])

    async function loadFeed() {
        const data = await getCommunityFeed()
        setUpdates(data)
    }

    // --- SUB-COMPONENT: Comment Form ---
    function CommentForm({ updateId }: { updateId: string }) {
        const [loading, setLoading] = useState(false)

        async function handleSubmit(formData: FormData) {
            setLoading(true)
            formData.append("updateId", updateId)
            const res = await postComment(formData)
            if (res.success) {
                toast({ title: "Comment Posted!" })
                loadFeed() // Refresh UI
            } else {
                toast({ title: "Error", description: "Failed to post comment", variant: "destructive" })
            }
            setLoading(false)
        }

        return (
            <form action={handleSubmit} className="mt-4 flex flex-col gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex gap-2">
                    <Input name="name" placeholder="Name" required className="flex-1 bg-white" />
                    <Input name="email" type="email" placeholder="Email (for verification)" required className="flex-1 bg-white" />
                </div>
                <div className="flex gap-2">
                    <Input name="content" placeholder="Write a comment..." required className="flex-1 bg-white" />
                    <Button type="submit" size="sm" disabled={loading} className="shrink-0">
                        {loading ? <span className="animate-spin">...</span> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                    * Use the email you used at checkout to get the "Verified Backer" badge.
                </p>
            </form>
        )
    }

    // --- SUB-COMPONENT: Admin Post Form ---
    function AdminPostForm() {
        async function handlePost(formData: FormData) {
            const res = await postCampaignUpdate(formData)
            if (res.success) {
                toast({ title: "Update Posted" })
                loadFeed()
            }
        }

        if (!isAdmin) return null

        return (
            <Card className="mb-8 border-emerald-100 bg-emerald-50/20">
                <CardHeader>
                    <CardTitle className="text-emerald-800">Post an Update</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handlePost} className="space-y-4">
                        <Input name="title" placeholder="Update Title" required />
                        <Textarea name="content" placeholder="What's new?" required />
                        <Input name="image" placeholder="Image URL (Optional)" />
                        <Button type="submit" className="w-full bg-emerald-600">Post Update</Button>
                    </form>
                </CardContent>
            </Card>
        )
    }

    // State for editing
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const [editingId, setEditingId] = useState<string | null>(null)

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this update?")) return
        const res = await deleteCampaignUpdate(id)
        if (res.success) {
            toast({ title: "Update Deleted" })
            loadFeed()
        } else {
            toast({ title: "Error", description: "Failed to delete update", variant: "destructive" })
        }
    }

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    async function handleEditSubmit(formData: FormData) {
        const res = await editCampaignUpdate(formData)
        if (res.success) {
            toast({ title: "Update Edited" })
            setEditingId(null)
            loadFeed()
        } else {
            toast({ title: "Error", description: "Failed to edit update", variant: "destructive" })
        }
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <AdminPostForm />

            <div className="space-y-8">
                {updates.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        No updates yet. Stay tuned!
                    </div>
                )}

                {updates.map((update) => (
                    <Card key={update.id} className="overflow-hidden group">
                        {editingId === update.id ? (
                            // --- EDIT MODE ---
                            <form action={handleEditSubmit}>
                                <input type="hidden" name="id" value={update.id} />
                                <div className="p-4 space-y-4">
                                    <Input name="title" defaultValue={update.title} required />
                                    <Textarea name="content" defaultValue={update.content} required className="min-h-[150px]" />
                                    <Input name="image" defaultValue={update.image || ""} placeholder="Image URL" />
                                    <div className="flex gap-2 justify-end">
                                        <Button type="button" variant="outline" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4 mr-2" /> Cancel
                                        </Button>
                                        <Button type="submit" className="bg-emerald-600">
                                            <Save className="h-4 w-4 mr-2" /> Save Changes
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            // --- VIEW MODE ---
                            <>
                                {update.image && (
                                    <div className="w-full h-64 bg-gray-100 relative">
                                        <img src={update.image} alt="Update" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="text-sm text-emerald-600 font-bold uppercase tracking-wider mb-1">
                                                Update from Creator
                                            </div>
                                            <CardTitle className="text-2xl">{update.title}</CardTitle>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(update.created_at))} ago
                                            </span>

                                            {/* Admin Actions */}
                                            {isAdmin && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => setEditingId(update.id)}>
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(update.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                                        {update.content}
                                    </div>
                                </CardContent>
                            </>
                        )}


                        <Separator />

                        <CardFooter className="flex-col items-stretch pt-6">
                            <h4 className="font-semibold flex items-center gap-2 mb-4">
                                <MessageSquare className="h-4 w-4" />
                                Comments ({update.comments.length})
                            </h4>

                            {/* Comments List */}
                            <div className="space-y-4 mb-4">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {update.comments.map((comment: any) => (
                                    <div key={comment.id} className="flex gap-3 text-sm">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{comment.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{comment.name}</span>
                                                {comment.isVerified && (
                                                    <Badge variant="secondary" className="h-5 px-1.5 bg-emerald-100 text-emerald-700 gap-1 text-[10px]">
                                                        <CheckCircle2 className="h-3 w-3" /> Backer
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground ml-auto">
                                                    {formatDistanceToNow(new Date(comment.created_at))} ago
                                                </span>
                                            </div>
                                            <p className="text-gray-600">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Comment */}
                            <CommentForm updateId={update.id} />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
