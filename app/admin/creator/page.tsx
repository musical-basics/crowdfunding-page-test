"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { updateCreatorProfile } from "../actions"
import { useCampaign } from "@/context/campaign-context"
import { ImageCropper } from "@/components/admin/image-cropper"
import { Loader2, Save } from "lucide-react"
import { AdminHeaderActions } from "@/components/admin/admin-header-actions"
import { ImageFrame } from "@/components/admin/image-frame"

// --- INTERFACES ---

interface CreatorPageStructure {
  intro: {
    heading: string
    subheading: string
  }
  story: {
    html: string
    images: {
      carnegie: string
      personal: string
    }
  }
  problem: {
    html: string
    image: string
  }
  solution: {
    html: string
    images: {
      product1: string
      comparison: string
    }
  }
  featuresHtml: string
  audienceHtml: string
}

// --- DEFAULTS ---

const DEFAULT_STRUCTURE: CreatorPageStructure = {
  intro: {
    heading: "Meet the Creator",
    subheading: "Concert pianist and founder of DreamPlay"
  },
  story: {
    html: `<p>I've been a concert pianist for years, performing at Carnegie Hall, Lincoln Center, and venues around the world. But there's something most people never saw: I was constantly fighting against the piano.</p>
<p>My hands span just under 8.5 inches. That meant many traditional pieces were difficult, sometimes impossible, for me to play comfortably. No matter how much I practiced, I felt like the instrument wasn't built for me.</p>
<p class="font-semibold text-foreground">So I asked myself: "What if the piano could be designed to fit the pianist, instead of the other way around?"</p>
<p class="text-lg font-semibold text-foreground">That's where DreamPlay was born.</p>`,
    images: {
      carnegie: "",
      personal: ""
    }
  },
  problem: {
    html: `<div class="space-y-4">
  <p class="text-lg text-muted-foreground leading-relaxed">Most pianos are designed for large hand spans, at least 8.5 inches. But <span class="font-bold text-foreground">87% of women</span> and <span class="font-bold text-foreground">24% of men</span> fall short of that.</p>
  <p class="text-lg text-muted-foreground leading-relaxed">That means strain, tension, and frustration. I know because I lived it.</p>
</div>`,
    image: ""
  },
  solution: {
    html: `<div class="text-center max-w-3xl mx-auto">
  <h3 class="text-3xl font-bold mb-4">The Solution: DreamPlay</h3>
  <p class="text-xl text-muted-foreground">DreamPlay is the instrument I always wished I had: a professional keyboard designed to fit your hands.</p>
</div>`,
    images: {
      product1: "",
      comparison: ""
    }
  },
  featuresHtml: `<!-- Features Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
  <div class="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
    <h4 class="text-xl font-bold mb-4 text-teal-900 dark:text-teal-100">Two Sizes Available</h4>
    <div class="space-y-3">
      <div class="bg-white/50 dark:bg-slate-800/50 rounded-md p-4 border border-teal-200 dark:border-teal-700">
        <p class="font-semibold text-foreground">DS5.5</p>
        <p class="text-sm text-muted-foreground">For smaller hand spans (&lt; 7.6")</p>
      </div>
      <div class="bg-white/50 dark:bg-slate-800/50 rounded-md p-4 border border-teal-200 dark:border-teal-700">
        <p class="font-semibold text-foreground">DS6.0</p>
        <p class="text-sm text-muted-foreground">For hand spans between 7.6–8.5"</p>
      </div>
    </div>
  </div>
  <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
    <h4 class="text-xl font-bold mb-3 text-blue-900 dark:text-blue-100">Authentic Grand Piano Feel</h4>
    <p class="text-muted-foreground">Weighted keys with expressive touch for a truly professional playing experience.</p>
  </div>
  <div class="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
    <h4 class="text-xl font-bold mb-3 text-amber-900 dark:text-amber-100">LED Learning System</h4>
    <p class="text-muted-foreground">My proprietary system for faster learning and improved practice sessions.</p>
  </div>
  <div class="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
    <h4 class="text-xl font-bold mb-3 text-purple-900 dark:text-purple-100">Portable, Modern Design</h4>
    <p class="text-muted-foreground">Perfect for home, studio, or stage. Take your music anywhere.</p>
  </div>
</div>
<div class="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-xl p-8 text-white text-center mt-6">
  <h4 class="text-2xl font-bold mb-3">Professional Sound Quality</h4>
  <p class="text-slate-200 text-lg max-w-2xl mx-auto">Inspiring tone for every pianist. Experience studio-quality sound that brings your music to life.</p>
</div>`,
  audienceHtml: `<!-- Who DreamPlay Is For Section -->
<div class="bg-muted/30 rounded-xl p-8 border border-border">
  <h3 class="text-2xl font-bold mb-6 text-center">Who DreamPlay Is For</h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
    <div class="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
      <div class="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0 mt-1">
        <span class="text-teal-700 dark:text-teal-300 font-bold">1</span>
      </div>
      <p class="text-muted-foreground"><span class="font-semibold text-foreground">Pianists with smaller hand spans</span>, like me, who want comfort and freedom.</p>
    </div>
    <div class="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
      <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0 mt-1">
        <span class="text-blue-700 dark:text-blue-300 font-bold">2</span>
      </div>
      <p class="text-muted-foreground"><span class="font-semibold text-foreground">Students</span> starting their piano journey with the right foundation.</p>
    </div>
    <div class="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
      <div class="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0 mt-1">
        <span class="text-purple-700 dark:text-purple-300 font-bold">3</span>
      </div>
      <p class="text-muted-foreground"><span class="font-semibold text-foreground">Professionals</span> who want speed, comfort, and expressive control.</p>
    </div>
    <div class="flex items-start gap-4 p-4 bg-background rounded-lg border border-border">
      <div class="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0 mt-1">
        <span class="text-amber-700 dark:text-amber-300 font-bold">4</span>
      </div>
      <p class="text-muted-foreground"><span class="font-semibold text-foreground">Anyone</span> who wants to unlock their full musical potential.</p>
    </div>
  </div>
</div>`
}

export default function CreatorProfilePage() {
  const { toast } = useToast()
  const { campaign, refreshCampaign } = useCampaign()

  // UI States
  const [isSaving, setIsSaving] = useState(false)
  const [data, setData] = useState<CreatorPageStructure>(DEFAULT_STRUCTURE)

  // Cropper States
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Update state when campaign loads
  useEffect(() => {
    if (campaign && campaign.creator.pageContent) {
      try {
        // Try parsing JSON
        const parsed = JSON.parse(campaign.creator.pageContent)
        // Merge with default to ensure all keys exist (if we add new ones later)
        setData({ ...DEFAULT_STRUCTURE, ...parsed })
      } catch (e) {
        // Fallback: If it's not JSON (legacy HTML), we don't really have a good way to split it automatically.
        // We'll just leave default values and the user will overwrite the legacy HTML.
        // Or we could try to put the whole HTML into 'story.html' but that might break layout.
        // Let's stick to defaults, effectively resetting the structure but keeping content clean.
        console.warn("Could not parse existing content as JSON, using defaults.")
      }
    }
  }, [campaign])

  // --- Handlers ---

  const handleDeepChange = (path: string, value: any) => {
    setData(prev => {
      const keys = path.split('.')
      const lastKey = keys.pop()!
      const deepClone = JSON.parse(JSON.stringify(prev))
      let target = deepClone
      for (const key of keys) {
        target = target[key]
      }
      target[lastKey] = value
      return deepClone
    })
  }

  // --- Profile Picture Cropper Logic ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setOriginalImageSrc(reader.result as string)
        setIsCropperOpen(true)
        e.target.value = ""
      })
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob)
    setPreviewUrl(URL.createObjectURL(blob))
    setIsCropperOpen(false)
  }

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)
    try {
      if (croppedBlob) {
        formData.set("avatarFile", croppedBlob, "avatar-cropped.jpg")
      }

      // Stringify the structured content
      formData.set("pageContent", JSON.stringify(data))

      await updateCreatorProfile(formData)

      if (refreshCampaign) {
        await refreshCampaign()
      }

      toast({
        title: "Success",
        description: "Creator profile updated successfully",
        variant: "default"
      })
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!campaign) return <div className="p-8">Loading creator data...</div>
  const { creator } = campaign
  const currentAvatar = previewUrl || creator.avatarUrl

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Creator Profile</h1>
      </div>

      <AdminHeaderActions>
        <Button
          type="submit"
          form="creator-profile-form"
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
        >
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </AdminHeaderActions>

      <form id="creator-profile-form" action={handleSubmit} className="space-y-8">

        {/* 1. Public Profile (Sidebar) */}
        <Card>
          <CardHeader>
            <CardTitle>Public Profile (Sidebar)</CardTitle>
            <CardDescription>
              This information appears on the campaign page sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <Avatar className="h-24 w-24 border-2 border-border">
                <AvatarImage src={currentAvatar} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">
                  {creator.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 gap-2 grid w-full">
                <Label>Profile Picture</Label>
                <div className="flex gap-2">
                  <Label htmlFor="avatarTrigger" className="cursor-pointer inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                    Choose Image to Crop & Upload...
                  </Label>
                  <Input id="avatarTrigger" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                <input type="hidden" name="avatarUrl" value={creator.avatarUrl} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" name="name" defaultValue={creator.name} className="max-w-md" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={creator.location} className="max-w-md" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Biography</Label>
              <Textarea id="bio" name="bio" className="min-h-[150px] font-sans" defaultValue={creator.bio} />
            </div>
          </CardContent>
        </Card>

        {/* 2. Intro Section */}
        <Card>
          <CardHeader>
            <CardTitle>Page Header</CardTitle>
            <CardDescription>Top section of the Creator tab.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Heading</Label>
              <Input
                value={data.intro.heading}
                onChange={e => handleDeepChange('intro.heading', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Subheading</Label>
              <Input
                value={data.intro.subheading}
                onChange={e => handleDeepChange('intro.subheading', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. My Story */}
        <Card>
          <CardHeader>
            <CardTitle>My Story</CardTitle>
          </CardHeader>
          <CardContent className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Story Text (HTML)</Label>
              <Textarea
                value={data.story.html}
                onChange={e => handleDeepChange('story.html', e.target.value)}
                className="min-h-[300px] font-mono text-xs"
              />
            </div>
            <div className="space-y-4">
              <ImageFrame
                label="Carnegie / Performance Photo"
                description="Top image"
                imageUrl={data.story.images.carnegie}
                onImageChange={url => handleDeepChange('story.images.carnegie', url)}
              />
              <ImageFrame
                label="Personal Photo"
                description="Bottom image (Working on instrument)"
                imageUrl={data.story.images.personal}
                onImageChange={url => handleDeepChange('story.images.personal', url)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 4. The Problem */}
        <Card>
          <CardHeader>
            <CardTitle>The Problem Section</CardTitle>
          </CardHeader>
          <CardContent className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <Label>Problem Description (HTML)</Label>
              <Textarea
                value={data.problem.html}
                onChange={e => handleDeepChange('problem.html', e.target.value)}
                className="min-h-[200px] font-mono text-xs"
              />
            </div>
            <div>
              <ImageFrame
                aspectRatio="square"
                label="Problem Infographic"
                imageUrl={data.problem.image}
                onImageChange={url => handleDeepChange('problem.image', url)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 5. The Solution */}
        <Card>
          <CardHeader>
            <CardTitle>The Solution Section</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Solution Header (HTML)</Label>
              <Textarea
                value={data.solution.html}
                onChange={e => handleDeepChange('solution.html', e.target.value)}
                className="min-h-[100px] font-mono text-xs"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <ImageFrame
                label="Product Shot 1"
                imageUrl={data.solution.images.product1}
                onImageChange={url => handleDeepChange('solution.images.product1', url)}
              />
              <ImageFrame
                label="Comparison Shot"
                imageUrl={data.solution.images.comparison}
                onImageChange={url => handleDeepChange('solution.images.comparison', url)}
              />
            </div>
          </CardContent>
        </Card>

        {/* 6. Features Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Features & Sound</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">Features Grid HTML</Label>
            <Textarea
              value={data.featuresHtml}
              onChange={e => handleDeepChange('featuresHtml', e.target.value)}
              className="min-h-[400px] font-mono text-xs"
            />
          </CardContent>
        </Card>

        {/* 7. Target Audience */}
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">Audience Section HTML</Label>
            <Textarea
              value={data.audienceHtml}
              onChange={e => handleDeepChange('audienceHtml', e.target.value)}
              className="min-h-[300px] font-mono text-xs"
            />
          </CardContent>
        </Card>



      </form>

      {/* Cropper Modal */}
      {originalImageSrc && (
        <ImageCropper
          isOpen={isCropperOpen}
          imageSrc={originalImageSrc}
          onClose={() => setIsCropperOpen(false)}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
