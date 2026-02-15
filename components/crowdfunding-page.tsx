"use client"

import { useRef, Suspense } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCampaign } from "@/context/campaign-context" // <--- Import Hook
import { ProjectHeader } from "./crowdfunding/project-header"
import { HeroSection } from "./crowdfunding/hero-section"
import { StatsPanel } from "./crowdfunding/stats-panel"
import { SiteHeader } from "./crowdfunding/site-header" // <--- Import
import { NavigationTabs } from "./crowdfunding/navigation-tabs"
import { CampaignPage } from "./crowdfunding/campaign-page"
import { RewardsPage } from "./crowdfunding/rewards-page"
import { CreatorPage } from "./crowdfunding/creator-page"
import { FAQPage } from "./crowdfunding/faq-page"
import { SectionPlaceholder } from "./crowdfunding/section-placeholder"
import { MobilePledgeBar } from "./crowdfunding/mobile-pledge-bar"
import { CheckoutDialog } from "./crowdfunding/checkout-dialog"
import { CommunityTab } from "./crowdfunding/community-tab" // <--- Import
import { Skeleton } from "@/components/ui/skeleton" // <--- Import Skeleton
import { AlertTriangle } from "lucide-react" // <--- Import Skeleton

function CrowdfundingContent() {
  const { campaign, isLoading, error } = useCampaign() // <--- Access loading state
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const navRef = useRef<HTMLDivElement>(null)

  const activeTab = searchParams.get("tab") || "campaign"

  // 1. Loading State
  if (isLoading) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <Skeleton className="h-12 w-3/4 mx-auto" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[400px] lg:col-span-1 rounded-xl" />
        </div>
      </main>
    )
  }

  // 2. Error State
  if (error || !campaign) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500">
        Failed to load campaign: {error}
      </div>
    )
  }

  // 3. Success State (The normal page)
  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    // If clicking a tab, we probably want to scroll to content
    if (tabId !== "campaign") {
      setTimeout(() => {
        // Find the tabs element? Or just scroll to top of content
        // navRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 50)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 1. Global Header (Logo + CTA) */}
      <SiteHeader onTabChange={handleTabChange} />


      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* 2. Page Title & Hero */}
          <div className="mb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProjectHeader />

            {/* Hero Grid */}
            <div id="section-1" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <HeroSection />
              </div>
              <div className="lg:col-span-1">
                <StatsPanel />
              </div>
            </div>

            {/* Sold Out Announcement Banner (Admin-controlled visibility) */}
            {campaign.showAnnouncement && (
              <div className="w-full bg-amber-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-lg md:text-xl uppercase tracking-wide">
                    <AlertTriangle className="h-6 w-6" />
                    <span>Important Update</span>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <p className="text-lg md:text-xl font-medium text-amber-900 leading-relaxed max-w-3xl">
                    We are sold out for the <span className="font-bold underline decoration-amber-400 decoration-2 underline-offset-2">Batch 1 (Summer 2026 Delivery)</span>.
                    <br />
                    We will resume accepting new reservations when our manufacturer notifies us of additional capacity. For now you can join <span className="font-bold">the Waitlist</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <NavigationTabs activeTab={activeTab} onTabChange={handleTabChange} />

        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* 3. Dynamic Content */}
          <div id="content-section" className="mb-24 md:mb-0 min-h-[500px]">
            <div id="rewards-section-anchor" className="scroll-mt-24" />

            {activeTab === "campaign" && <CampaignPage />}
            {activeTab === "rewards" && <RewardsPage />}
            {activeTab === "faq" && <FAQPage />}
            {activeTab === "updates" && <SectionPlaceholder title="Updates" />}
            {activeTab === "comments" && <SectionPlaceholder title="Comments" />}
            {activeTab === "community" && <CommunityTab isAdmin={false} />}
          </div>

        </div>
      </main>

      <MobilePledgeBar />
      <CheckoutDialog />
    </div>
  )
}

export function CrowdfundingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="h-screen" />}>
        <CrowdfundingContent />
      </Suspense>
    </div>
  )
}
