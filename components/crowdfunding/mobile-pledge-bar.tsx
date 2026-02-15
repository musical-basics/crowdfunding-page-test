"use client"

import { useCampaign } from "@/context/campaign-context"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/hooks/use-mobile"

export function MobilePledgeBar() {
    const { pledge, campaign } = useCampaign()
    const isMobile = useIsMobile()

    // Only show on mobile
    if (!isMobile) return null
    if (!campaign) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border z-50 md:hidden pb-safe">
            <div className="flex gap-4 items-center max-w-6xl mx-auto">
                <div className="flex-1">
                    <p className="text-sm font-semibold truncate">{campaign.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {campaign.stats.daysLeft} days left
                    </p>
                </div>
                <Button
                    onClick={() => {
                        // Scroll to rewards section
                        const rewardsSection = document.getElementById("rewards-section-anchor") // We will add this ID shortly
                        if (rewardsSection) {
                            rewardsSection.scrollIntoView({ behavior: "smooth" })
                        } else {
                            // Fallback if we are on a different tab
                            const params = new URLSearchParams(window.location.search)
                            params.set("tab", "rewards")
                            window.location.search = params.toString()
                        }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                >
                    Pre-order now
                </Button>
            </div>
        </div>
    )
}
