import { notFound } from "next/navigation"
import { getCampaignData } from "@/lib/campaign"
import { CampaignProvider } from "@/context/campaign-context"
import { CrowdfundingPage } from "@/components/crowdfunding-page"

// This page catches any URL like /dreamplay-one, /my-new-project, etc.
export default async function DynamicCampaignPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params

    // Fetch specific campaign based on URL
    const campaignData = await getCampaignData(slug)

    if (!campaignData) {
        notFound() // Shows 404 page if slug doesn't exist in DB
    }

    return (
        <CampaignProvider initialData={campaignData}>
            <CrowdfundingPage />
        </CampaignProvider>
    )
}
