"use client"

import { useCampaign } from "@/context/campaign-context"

export function ProjectHeader() {
  const { campaign } = useCampaign()

  if (!campaign) return null

  return (
    <div className="text-center">
      <h1 className="text-3xl md:text-5xl font-extrabold text-foreground text-balance tracking-tight">
        {campaign.title}
      </h1>
      <p className="text-md md:text-xl text-muted-foreground mt-3 max-w-3xl mx-auto">
        {campaign.subtitle}
      </p>
    </div>
  )
}
