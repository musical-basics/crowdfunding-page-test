"use client"

import * as React from "react"
import Image from "next/image"
import { Play, X, Loader2 } from "lucide-react" // Added Loader2
import { useCampaign } from "@/context/campaign-context"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

export function HeroSection() {
  const { campaign } = useCampaign()

  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)
  const [lightboxOpen, setLightboxOpen] = React.useState(false)
  const [videoOpen, setVideoOpen] = React.useState(false)

  // State to track when video is ready to show
  const [isVideoLoaded, setIsVideoLoaded] = React.useState(false)

  // Reset video loaded state when dialog closes
  React.useEffect(() => {
    if (!videoOpen) {
      setIsVideoLoaded(false)
    }
  }, [videoOpen])

  const allItems = React.useMemo(() => {
    if (!campaign) return []
    // Prefer the new structured media gallery
    if (campaign.mediaGallery && campaign.mediaGallery.length > 0) {
      return campaign.mediaGallery
    }
    // Fallback to legacy structure
    const items = []
    if (campaign.images.hero) {
      items.push({ id: 'hero', type: 'image', src: campaign.images.hero } as const)
    }
    campaign.images.gallery.forEach(src => {
      items.push({ id: src, type: 'image', src } as const)
    })
    return items
  }, [campaign])

  React.useEffect(() => {
    if (!api) return
    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  if (!campaign) return null

  const handleThumbnailClick = (index: number) => {
    if (api) api.scrollTo(index)
  }

  return (
    <div className="space-y-4">
      {/* Main Slider */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
        <Carousel setApi={setApi} className="w-full h-full">
          <CarouselContent>
            {allItems.map((item, index) => (
              <CarouselItem key={index}>
                <div
                  className="relative aspect-video w-full h-full flex items-center justify-center bg-black/5 cursor-zoom-in"
                  onClick={() => {
                    if (item.type === 'video') {
                      setVideoOpen(true)
                    } else {
                      setLightboxOpen(true)
                    }
                  }}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.type === 'video' ? (item.thumbnail || item.src) : item.src}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/50 transition-transform hover:scale-110 cursor-pointer">
                        <Play className="h-6 w-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="absolute inset-0 pointer-events-none flex items-center justify-between p-4">
            <CarouselPrevious className="pointer-events-auto relative left-0 translate-x-0 h-10 w-10 bg-white/80 hover:bg-white text-black border-none shadow-sm" />
            <CarouselNext className="pointer-events-auto relative right-0 translate-x-0 h-10 w-10 bg-white/80 hover:bg-white text-black border-none shadow-sm" />
          </div>
        </Carousel>

        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2 shadow-sm"
            onClick={(e) => {
              e.stopPropagation()
              if (allItems[current]?.type === 'video') {
                setVideoOpen(true)
              } else {
                setLightboxOpen(true)
              }
            }}
          >
            {allItems[current]?.type === 'video' ? <Play className="h-4 w-4" /> : null}
            {allItems[current]?.type === 'video' ? "Play Video" : "View Fullscreen"}
          </Button>
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={current}
        slides={allItems.map(item =>
          item.type === 'video'
            ? { src: item.thumbnail || item.src }
            : { src: item.src }
        )}
      />

      {/* Video Dialog */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          className="sm:max-w-5xl p-0 border-none bg-black overflow-hidden shadow-2xl"
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">Campaign Video</DialogTitle>

          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">

            {/* Video Player - Handles both YouTube and Direct MP4 if needed (simplified for now to assume iframe/video tag based on src) */}
            {allItems[current]?.src.includes('youtube') || allItems[current]?.src.includes('youtu.be') ? (
              <iframe
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full"
                src={allItems[current]?.src.replace('watch?v=', 'embed/')}
                title="Video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsVideoLoaded(true)}
              />
            ) : (
              <video
                className="w-full h-full"
                controls
                autoPlay
                src={allItems[current]?.src}
                onLoadedData={() => setIsVideoLoaded(true)}
              />
            )}

            {/* Black overlay that covers the iframe until it's ready - prevents any flash */}
            <div
              className={`absolute inset-0 bg-black flex items-center justify-center z-20 transition-opacity duration-500 pointer-events-none ${isVideoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
            >
              <Loader2 className="h-10 w-10 text-white/50 animate-spin" />
            </div>

            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-50"
              aria-label="Close video"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {allItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`
              relative flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all
              ${current === index
                ? "border-emerald-600 ring-2 ring-emerald-600/20"
                : "border-transparent opacity-60 hover:opacity-100"}
            `}
          >
            {/* Thumbnail Content */}
            <div className="w-full h-full relative">
              <img
                src={item.type === 'video' ? (item.thumbnail || item.src) : item.src}
                alt="thumbnail"
                className="w-full h-full object-cover"
              />
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
