"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { updateCampaignDetails, uploadCreatorAsset } from "../actions"
import { useCampaign, CampaignProvider } from "@/context/campaign-context"
import { Plus, Trash2, Monitor, Video, Image as ImageIcon, PlayCircle, GripVertical, Save, Eye, EyeOff } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { AdminHeaderActions } from "@/components/admin/admin-header-actions"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core"
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { compressImageFile } from "@/lib/image-utils"
import { CrowdfundingPage } from "@/components/crowdfunding-page"
import { CommunityTab } from "@/components/crowdfunding/community-tab"

// --- TYPES ---
interface MediaItem {
    id: string
    type: 'image' | 'video'
    src: string
    thumbnail?: string
}

// --- COMPONENT: Sortable Media Item ---
function SortableMediaItem({ item, onRemove }: { item: MediaItem, onRemove: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : "auto",
    }

    return (
        <div ref={setNodeRef} style={style} className="relative group aspect-video bg-muted rounded-md overflow-hidden border touch-none shadow-sm hover:shadow-md transition-shadow">
            {/* Main Content */}
            <img
                src={item.type === 'video' ? (item.thumbnail || item.src) : item.src}
                alt="Media"
                className="w-full h-full object-cover"
            />

            {/* Video Indicator */}
            {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <PlayCircle className="w-8 h-8 text-white opacity-80" />
                </div>
            )}

            {/* Drag Handle Overlay (Covers everything except buttons) */}
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 cursor-grab active:cursor-grabbing hover:bg-black/10 transition-colors"
            />

            {/* Grip Icon (Visual Cue) */}
            <div className="absolute top-2 left-2 p-1 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <GripVertical className="h-4 w-4" />
            </div>

            {/* Type Badge */}
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded uppercase font-bold pointer-events-none backdrop-blur-sm">
                {item.type}
            </div>

            {/* Delete Button (Must stop propagation) */}
            <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()} // Important: Prevents drag start on click
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove()
                }}
                className="absolute top-2 right-2 bg-destructive/90 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive shadow-sm z-20 cursor-pointer"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    )
}

export default function CampaignDetailsEditor() {
    const { toast } = useToast()
    const { campaign, refreshCampaign } = useCampaign()

    // --- STATES ---
    const [title, setTitle] = useState("")
    const [subtitle, setSubtitle] = useState("")
    const [story, setStory] = useState("")
    const [risks, setRisks] = useState("")
    const [shipping, setShipping] = useState("")
    const [technicalDetails, setTechnicalDetails] = useState("")
    const [manufacturerDetails, setManufacturerDetails] = useState("")
    const [goalAmount, setGoalAmount] = useState(0)
    const [totalSupply, setTotalSupply] = useState(100)
    const [endDate, setEndDate] = useState("")
    const [showAnnouncement, setShowAnnouncement] = useState(false)
    const [showReservedAmount, setShowReservedAmount] = useState(true)
    const [showSoldOutPercent, setShowSoldOutPercent] = useState(true)

    // Media & Video States
    const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([])
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false)
    const [newVideoUrl, setNewVideoUrl] = useState("")
    const [newVideoThumb, setNewVideoThumb] = useState<File | null>(null)
    const [isUploadingVideo, setIsUploadingVideo] = useState(false)

    // Other features
    const [keyFeatures, setKeyFeatures] = useState<any[]>([])
    const [techSpecs, setTechSpecs] = useState<any[]>([])

    // Load Data
    useEffect(() => {
        if (campaign) {
            setTitle(campaign.title)
            setSubtitle(campaign.subtitle)
            setGoalAmount(campaign.stats.goalAmount)
            setTotalSupply(campaign.stats.totalSupply || 100)
            setEndDate(new Date(Date.now() + campaign.stats.daysLeft * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
            setStory(campaign.story)
            setRisks(campaign.risks)
            setShipping(campaign.shipping)
            setTechnicalDetails(campaign.technicalDetails)
            setManufacturerDetails(campaign.manufacturerDetails || "")
            setKeyFeatures(campaign.keyFeatures)
            setTechSpecs(campaign.techSpecs)
            setShowAnnouncement(campaign.showAnnouncement ?? false)
            setShowReservedAmount(campaign.showReservedAmount ?? true)
            setShowSoldOutPercent(campaign.showSoldOutPercent ?? true)

            // Gallery Logic
            if (campaign.mediaGallery && campaign.mediaGallery.length > 0) {
                setMediaGallery(campaign.mediaGallery)
            } else if (campaign.images.gallery.length > 0) {
                setMediaGallery(campaign.images.gallery.map(url => ({
                    id: url,
                    type: 'image',
                    src: url
                })))
            }
        }
    }, [campaign])

    // --- DRAG SENSORS (FIXED) ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // Requires 5px movement before drag starts (Fixes click issues)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        if (active.id !== over?.id) {
            setMediaGallery((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id)
                const newIndex = items.findIndex(i => i.id === over?.id)
                return arrayMove(items, oldIndex, newIndex)
            })
        }
    }

    // --- HANDLERS ---

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return
        toast({ title: "Uploading images...", description: "Please wait." })

        const files = Array.from(e.target.files)
        const newItems: MediaItem[] = []

        for (const file of files) {
            const formData = new FormData()
            formData.append("file", await compressImageFile(file))
            const result = await uploadCreatorAsset(formData)

            if (result.success && result.url) {
                newItems.push({
                    id: result.url,
                    type: 'image',
                    src: result.url
                })
            }
        }
        setMediaGallery(prev => [...prev, ...newItems])
        toast({ title: "Images added", description: "Don't forget to save changes." })
    }

    const handleAddVideo = async () => {
        if (!newVideoUrl) return
        setIsUploadingVideo(true)
        let thumbUrl = ""

        if (newVideoThumb) {
            const formData = new FormData()
            formData.append("file", await compressImageFile(newVideoThumb))
            const result = await uploadCreatorAsset(formData)
            if (result.success && result.url) thumbUrl = result.url
        }

        const newItem: MediaItem = {
            id: `video-${Date.now()}`,
            type: 'video',
            src: newVideoUrl,
            thumbnail: thumbUrl || "/images/video-placeholder.jpg"
        }

        setMediaGallery(prev => [...prev, newItem])
        setIsVideoDialogOpen(false)
        setNewVideoUrl("")
        setNewVideoThumb(null)
        setIsUploadingVideo(false)
    }

    async function handleSubmit(formData: FormData) {
        formData.set("show_announcement", showAnnouncement.toString())
        formData.set("show_reserved_amount", showReservedAmount.toString())
        formData.set("show_sold_out_percent", showSoldOutPercent.toString())
        console.log("[SUBMIT] React state:", { showAnnouncement, showReservedAmount, showSoldOutPercent })
        console.log("[SUBMIT] FormData values:", {
            show_announcement: formData.get("show_announcement"),
            show_reserved_amount: formData.get("show_reserved_amount"),
            show_sold_out_percent: formData.get("show_sold_out_percent"),
        })
        formData.set("media_gallery_json", JSON.stringify(mediaGallery))
        // Re-inject legacy gallery array for compatibility if needed
        const legacyImages = mediaGallery.filter(m => m.type === 'image').map(m => m.src)
        formData.set("existing_gallery_images", JSON.stringify(legacyImages))

        toast({ title: "Saving...", description: "Updating campaign details." })

        try {
            await updateCampaignDetails(formData)
            // Force re-fetch on client
            window.location.reload()
        } catch (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" })
        }
    }

    if (!campaign) return <div>Loading...</div>

    // Preview Object
    const previewCampaign: any = {
        ...campaign,
        title,
        subtitle,
        story,
        images: {
            ...campaign.images,
            gallery: mediaGallery.map(m => m.src) // Simple preview
        },
        mediaGallery: mediaGallery, // Rich preview
        stats: {
            ...campaign.stats,
            goalAmount: goalAmount,
            totalSupply: totalSupply,
            // Recalculate daysLeft for preview based on endDate
            daysLeft: endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : campaign.stats.daysLeft
        }
    }

    // --- SIDEBAR NAVIGATION ---
    const sectionIds = [
        { id: 'basic-info', label: 'Basic Information', publicId: null },
        { id: 'media-gallery', label: 'Media Gallery', publicId: null },
        { id: 'campaign-story', label: 'Campaign Story', publicId: 'story' },
        { id: 'key-features', label: 'Key Features', publicId: 'features' },
        { id: 'tech-specs', label: 'Tech Specs', publicId: 'specs' },
        { id: 'technical-details', label: 'Technical Details', publicId: 'technical-details' },
        { id: 'manufacturer', label: 'Manufacturer', publicId: 'manufacturer' },
        { id: 'shipping-risks', label: 'Shipping & Risks', publicId: 'shipping' },
        { id: 'community-updates', label: 'Community Updates', publicId: 'community' },
    ]
    const [hiddenSections, setHiddenSections] = useState<string[]>(campaign?.hiddenSections || [])

    const toggleSectionVisibility = (publicId: string) => {
        setHiddenSections(prev =>
            prev.includes(publicId)
                ? prev.filter(s => s !== publicId)
                : [...prev, publicId]
        )
    }
    const [activeSection, setActiveSection] = useState('basic-info')
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const container = scrollContainerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                }
            },
            { root: container, rootMargin: '-20% 0px -60% 0px', threshold: 0 }
        )

        sectionIds.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [campaign])

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="flex flex-col 2xl:flex-row gap-6 h-[calc(100vh-4rem)]">
            <AdminHeaderActions>
                <Button
                    type="submit"
                    form="campaign-details-form"
                    className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
                >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </Button>
            </AdminHeaderActions>

            {/* Section Sidebar */}
            <nav className="hidden lg:block w-40 shrink-0 sticky top-4 self-start">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Sections</p>
                <ul className="space-y-0.5">
                    {sectionIds.map(({ id, label, publicId }) => {
                        const isHidden = publicId ? hiddenSections.includes(publicId) : false
                        return (
                            <li key={id} className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => scrollToSection(id)}
                                    className={`flex-1 text-left px-3 py-1.5 rounded-md text-sm transition-colors ${isHidden ? 'opacity-50 line-through' : ''} ${activeSection === id
                                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    {label}
                                </button>
                                {publicId && (
                                    <button
                                        type="button"
                                        onClick={() => toggleSectionVisibility(publicId)}
                                        className={`p-1 rounded transition-colors cursor-pointer ${isHidden
                                                ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                                : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted'
                                            }`}
                                        title={isHidden ? `Show ${label} on public page` : `Hide ${label} from public page`}
                                    >
                                        {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="flex-1 min-w-0 overflow-y-auto pr-2 pb-20" ref={scrollContainerRef}>
                <form id="campaign-details-form" action={handleSubmit} className="space-y-8">
                    <input type="hidden" name="hidden_sections_json" value={JSON.stringify(hiddenSections)} />

                    {/* Basic Info */}
                    <Card id="basic-info">
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Campaign Title</Label>
                                <Input id="title" name="title" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="subtitle">Subtitle</Label>
                                <Textarea id="subtitle" name="subtitle" value={subtitle} onChange={e => setSubtitle(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="goal">Goal Amount ($)</Label>
                                    <Input id="goal" name="goal" type="number" value={goalAmount} onChange={e => setGoalAmount(Number(e.target.value))} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="endDate">End Date</Label>
                                    <Input id="endDate" name="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="totalSupply">Total Supply Limit</Label>
                                <Input
                                    id="totalSupply"
                                    name="totalSupply"
                                    type="number"
                                    value={totalSupply}
                                    onChange={e => setTotalSupply(Number(e.target.value))}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="showAnnouncement" className="font-medium">Show Announcement Banner</Label>
                                    <p className="text-sm text-muted-foreground">Display the "Important Update" banner on the public page</p>
                                </div>
                                <Switch
                                    id="showAnnouncement"
                                    checked={showAnnouncement}
                                    onCheckedChange={setShowAnnouncement}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="showReservedAmount" className="font-medium">Show Reserved Amount</Label>
                                    <p className="text-sm text-muted-foreground">Display the "$ Reserved" stat on the public page</p>
                                </div>
                                <Switch
                                    id="showReservedAmount"
                                    checked={showReservedAmount}
                                    onCheckedChange={setShowReservedAmount}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="showSoldOutPercent" className="font-medium">Show Sold Out Percentage</Label>
                                    <p className="text-sm text-muted-foreground">Display the "% sold out" stat on the public page</p>
                                </div>
                                <Switch
                                    id="showSoldOutPercent"
                                    checked={showSoldOutPercent}
                                    onCheckedChange={setShowSoldOutPercent}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* MEDIA GALLERY */}
                    <Card id="media-gallery">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Media Gallery</CardTitle>
                                <CardDescription>Images & Videos. First item is the Hero.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Video className="h-4 w-4" /> Add Video
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Video</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-2">
                                                <Label>Video URL (Cloudflare R2)</Label>
                                                <Input
                                                    placeholder="https://pub-xyz.r2.dev/video.mp4"
                                                    value={newVideoUrl}
                                                    onChange={e => setNewVideoUrl(e.target.value)}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Thumbnail (Required)</Label>
                                                <Input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => setNewVideoThumb(e.target.files?.[0] || null)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button onClick={handleAddVideo} disabled={isUploadingVideo}>
                                                {isUploadingVideo ? "Uploading..." : "Add to Gallery"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <div className="relative">
                                    <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
                                        <ImageIcon className="h-4 w-4" /> Add Images
                                    </Button>
                                    <Input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={mediaGallery.map(i => i.id)}
                                    strategy={rectSortingStrategy}
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {mediaGallery.map((item) => (
                                            <SortableMediaItem
                                                key={item.id}
                                                item={item}
                                                onRemove={() => setMediaGallery(prev => prev.filter(i => i.id !== item.id))}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            {mediaGallery.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg mt-4">
                                    No media added.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Story Editor */}
                    <Card id="campaign-story">
                        <CardHeader>
                            <CardTitle>Campaign Story (HTML)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                id="story"
                                name="story"
                                className="min-h-[300px] font-mono text-sm"
                                value={story}
                                onChange={e => setStory(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    {/* Key Features Editor */}
                    <Card id="key-features">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Key Features</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setKeyFeatures([...keyFeatures, { icon: "✨", title: "New Feature", desc: "Description" }])}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Feature
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {keyFeatures.map((feature, idx) => (
                                <div key={idx} className="flex gap-4 items-start border p-4 rounded-lg">
                                    <div className="w-16">
                                        <Label>Icon</Label>
                                        <Input
                                            value={feature.icon}
                                            onChange={e => {
                                                const newFeatures = [...keyFeatures]
                                                newFeatures[idx].icon = e.target.value
                                                setKeyFeatures(newFeatures)
                                            }}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div>
                                            <Label>Title</Label>
                                            <Input
                                                value={feature.title}
                                                onChange={e => {
                                                    const newFeatures = [...keyFeatures]
                                                    newFeatures[idx].title = e.target.value
                                                    setKeyFeatures(newFeatures)
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea
                                                value={feature.desc}
                                                onChange={e => {
                                                    const newFeatures = [...keyFeatures]
                                                    newFeatures[idx].desc = e.target.value
                                                    setKeyFeatures(newFeatures)
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => {
                                            const newFeatures = [...keyFeatures]
                                            newFeatures.splice(idx, 1)
                                            setKeyFeatures(newFeatures)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Tech Specs Editor */}
                    <Card id="tech-specs">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Technical Specifications</CardTitle>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setTechSpecs([...techSpecs, { label: "Spec", value: "Value" }])}
                            >
                                <Plus className="h-4 w-4 mr-2" /> Add Spec
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {techSpecs.map((spec, idx) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <Input
                                        className="flex-1"
                                        placeholder="Label (e.g. Weight)"
                                        value={spec.label}
                                        onChange={e => {
                                            const newSpecs = [...techSpecs]
                                            newSpecs[idx].label = e.target.value
                                            setTechSpecs(newSpecs)
                                        }}
                                    />
                                    <Input
                                        className="flex-1"
                                        placeholder="Value (e.g. 1.2kg)"
                                        value={spec.value}
                                        onChange={e => {
                                            const newSpecs = [...techSpecs]
                                            newSpecs[idx].value = e.target.value
                                            setTechSpecs(newSpecs)
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive"
                                        onClick={() => {
                                            const newSpecs = [...techSpecs]
                                            newSpecs.splice(idx, 1)
                                            setTechSpecs(newSpecs)
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* HTML Content Editors */}
                    <Card id="technical-details">
                        <CardHeader>
                            <CardTitle>Technical Details (HTML)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="min-h-[200px] font-mono text-sm"
                                value={technicalDetails}
                                onChange={e => setTechnicalDetails(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card id="manufacturer">
                        <CardHeader>
                            <CardTitle>About Our Manufacturer (HTML)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                className="min-h-[200px] font-mono text-sm"
                                value={manufacturerDetails}
                                onChange={e => setManufacturerDetails(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Card id="shipping-risks">
                        <CardHeader>
                            <CardTitle>Shipping & Risks (HTML)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Shipping Details</Label>
                                <Textarea
                                    className="min-h-[150px] font-mono text-sm"
                                    value={shipping}
                                    onChange={e => setShipping(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Risks & Challenges</Label>
                                <Textarea
                                    className="min-h-[150px] font-mono text-sm"
                                    value={risks}
                                    onChange={e => setRisks(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Hidden inputs to pass JSON data to action */}
                    <input type="hidden" name="risks" value={risks} />
                    <input type="hidden" name="shipping" value={shipping} />
                    <input type="hidden" name="technicalDetails" value={technicalDetails} />
                    <input type="hidden" name="manufacturerDetails" value={manufacturerDetails} />
                    <input type="hidden" name="key_features_json" value={JSON.stringify(keyFeatures)} />
                    <input type="hidden" name="tech_specs_json" value={JSON.stringify(techSpecs)} />
                    <input type="hidden" name="endsAt" value={endDate} />
                    <input type="hidden" name="goal" value={goalAmount} />



                </form>

                {/* Community Updates Section */}
                <div id="community-updates" className="mt-12 pt-12 border-t">
                    <h2 className="text-2xl font-bold mb-6">Community Updates</h2>
                    <CommunityTab isAdmin={true} />
                </div>
            </div>

            {/* Preview Column */}
            <div className="hidden 2xl:block w-[420px] shrink-0 border-l bg-background pl-4">
                <div className="flex items-center justify-between mb-4 mt-2">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Monitor className="h-4 w-4" /> Live Preview
                    </h2>
                </div>
                <div className="border rounded-xl overflow-hidden shadow-2xl h-[calc(100vh-8rem)] bg-white relative">
                    <div className="h-full w-full overflow-y-auto bg-white" style={{ isolation: 'isolate' }}>
                        <CampaignProvider initialData={previewCampaign}>
                            <div className="pointer-events-none select-none transform origin-top-left scale-[0.6]" style={{ width: '166.67%' }}>
                                <CrowdfundingPage />
                            </div>
                        </CampaignProvider>
                    </div>
                </div>
            </div>
        </div>
    )
}
