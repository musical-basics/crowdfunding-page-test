"use client"

import { useCampaign } from "@/context/campaign-context"
import { useImageLightbox, ImageLightbox } from "@/components/crowdfunding/image-lightbox"

// Same interface as Admin
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

export function CreatorPage() {
  const { campaign } = useCampaign()
  const { lightboxSrc, openLightbox, closeLightbox, handleContainerClick } = useImageLightbox()

  if (!campaign) return <div className="p-12 text-center text-muted-foreground">Loading creator story...</div>

  // 1. Try to parse as JSON
  let content: CreatorPageStructure | null = null
  let legacyHtml = ""

  if (campaign.creator.pageContent) {
    try {
      content = JSON.parse(campaign.creator.pageContent)
    } catch (e) {
      // If parse fails, it's legacy HTML
      legacyHtml = campaign.creator.pageContent
    }
  } else {
    // If empty, use hardcoded structure logic below? or wait? 
    // Actually we should default to 'legacyHtml' being empty if null.
    // But if we want to show the specific structure by default we need default content. 
    // The Admin page sets default content on save. 
    // If it's truly empty, we probably want to show nothing or a "Coming Soon". 
    // But for this refactor, let's assume 'legacyHtml' handles "not JSON yet".
  }

  // 2. If Legacy HTML (or empty string that failed JSON parse which is unlikely for empty string but possible), render raw
  if (!content) {
    // If purely empty, maybe fallback to the original default HTML?
    // For now, trust the DB.
    return (
      <div
        className="prose dark:prose-invert max-w-none text-muted-foreground [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:cursor-pointer"
        dangerouslySetInnerHTML={{ __html: legacyHtml || "" }}
        onClick={handleContainerClick}
      />
    )
  }

  // 3. Render Structured Content
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h2 className="text-3xl font-bold mb-2">{content.intro.heading}</h2>
        <p className="text-muted-foreground text-lg">
          {content.intro.subheading}
        </p>
      </div>

      {/* My Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold">My Story</h3>
          <div
            className="prose prose-lg max-w-none text-muted-foreground space-y-4"
            dangerouslySetInnerHTML={{ __html: content.story.html }}
          />
        </div>
        <div className="space-y-4">
          {/* Carnegie Image */}
          <div className="aspect-video bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center relative">
            {content.story.images.carnegie ? (
              <img src={content.story.images.carnegie} alt="Performance" className="object-cover w-full h-full cursor-pointer" onClick={() => openLightbox(content!.story.images.carnegie)} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p className="font-medium">Carnegie Hall Performance Photo</p>
              </div>
            )}
          </div>
          {/* Personal Image */}
          <div className="aspect-video bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center relative">
            {content.story.images.personal ? (
              <img src={content.story.images.personal} alt="Personal" className="object-cover w-full h-full cursor-pointer" onClick={() => openLightbox(content!.story.images.personal)} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p className="font-medium">Personal Photo</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Problem Section */}
      <div className="bg-muted/30 rounded-xl p-8 border border-border">
        <h3 className="text-2xl font-bold mb-6">The Problem I Wanted to Solve</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div
            className="space-y-4 text-lg text-muted-foreground leading-relaxed [&_span]:text-foreground"
            dangerouslySetInnerHTML={{ __html: content.problem.html }}
          />
          <div className="aspect-square bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center relative">
            {content.problem.image ? (
              <img src={content.problem.image} alt="Infographic" className="object-cover w-full h-full cursor-pointer" onClick={() => openLightbox(content!.problem.image)} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p className="font-medium">Infographic</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* The Solution Section */}
      <div className="space-y-8">
        <div
          // This html usually contains the centered header "The Solution: DreamPlay"
          dangerouslySetInnerHTML={{ __html: content.solution.html }}
        />

        {/* Product Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-video bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center">
            {content.solution.images.product1 ? (
              <img src={content.solution.images.product1} alt="Product Shot" className="object-cover w-full h-full cursor-pointer" onClick={() => openLightbox(content!.solution.images.product1)} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p className="font-medium">Keyboard Product Shot 1</p>
              </div>
            )}
          </div>
          <div className="aspect-video bg-muted/50 rounded-lg border border-border overflow-hidden flex items-center justify-center">
            {content.solution.images.comparison ? (
              <img src={content.solution.images.comparison} alt="Comparison" className="object-cover w-full h-full cursor-pointer" onClick={() => openLightbox(content!.solution.images.comparison)} />
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                <p className="font-medium">Comparison Shot</p>
              </div>
            )}
          </div>
        </div>

        {/* Features Grid (HTML) */}
        <div
          className="[&_.grid]:gap-6 [&_.rounded-lg]:border"
          dangerouslySetInnerHTML={{ __html: content.featuresHtml }}
        />
      </div>

      {/* Audience Section (HTML) */}
      <div dangerouslySetInnerHTML={{ __html: content.audienceHtml }} />

      {/* Lightbox Overlay */}
      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
    </div>
  )
}
