import { createAdminClient } from "@/lib/supabase/server"
import { Campaign } from "@/types/campaign"

export async function getCampaignData(slug: string): Promise<Campaign | null> {
    const supabase = createAdminClient()

    // 1. Fetch Campaign & Creator
    const { data: campaignData, error } = await supabase
        .from('cf_campaign')
        .select(`*, creator:cf_creator(*)`)
        .eq('id', slug)
        .single()

    if (error || !campaignData) return null

    const campaignId = campaignData.id

    // 2. Fetch Rewards
    const { data: rewardsData } = await supabase
        .from('cf_reward')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('sort_order', { ascending: true })
        .order('price', { ascending: true })

    // 3. Fetch FAQs
    const { data: faqData } = await supabase
        .from('cf_faq')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('order', { ascending: true })

    // 4. Transform to Frontend Type
    return {
        id: campaignData.id,
        title: campaignData.title,
        subtitle: campaignData.subtitle,
        story: campaignData.story,
        risks: campaignData.risks,
        shipping: campaignData.shipping || '',
        technicalDetails: campaignData.technical_details || '',
        manufacturerDetails: campaignData.manufacturer_details || '',
        images: {
            hero: campaignData.hero_image,
            gallery: campaignData.gallery_images || []
        },
        mediaGallery: campaignData.media_gallery || [],
        stats: {
            totalPledged: Number(campaignData.total_pledged),
            goalAmount: Number(campaignData.goal_amount),
            totalBackers: campaignData.total_backers,
            daysLeft: Math.max(0, Math.ceil((new Date(campaignData.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
            lovesCount: campaignData.loves_count || 0,
            totalSupply: campaignData.total_supply || 100
        },
        creator: {
            id: campaignData.creator.id,
            name: campaignData.creator.name,
            avatarUrl: campaignData.creator.avatar_url,
            bio: campaignData.creator.bio,
            location: campaignData.creator.location,
            projectsCreated: campaignData.creator.projects_created,
            projectsBacked: campaignData.creator.projects_backed,
            pageContent: campaignData.creator.page_content || ''
        },
        rewards: rewardsData?.map((r: any) => ({
            id: r.id,
            title: r.title,
            price: Number(r.price),
            originalPrice: r.original_price ? Number(r.original_price) : undefined,
            description: r.description,
            itemsIncluded: r.items_included || [],
            estimatedDelivery: r.estimated_delivery,
            shipsTo: r.ships_to || [],
            backersCount: r.backers_count,
            limitedQuantity: r.limit_quantity,
            isSoldOut: r.is_sold_out,
            imageUrl: r.image_url,
            isFeatured: r.is_featured,
            badgeType: r.badge_type || (r.is_featured ? 'featured' : 'none'),
            checkoutUrl: r.checkout_url,
            shopifyVariantId: r.shopify_variant_id,
            rewardType: r.reward_type || 'bundle',
            isVisible: r.is_visible !== false,
            sortOrder: r.sort_order
        })) || [],
        faqs: faqData?.map((f: any) => ({
            id: f.id,
            category: f.category,
            question: f.question,
            answer: f.answer
        })) || [],
        faqPageContent: campaignData.faq_page_content ? JSON.parse(campaignData.faq_page_content) : undefined,
        keyFeatures: campaignData.key_features || [],
        techSpecs: campaignData.tech_specs || [],
        showAnnouncement: campaignData.show_announcement ?? false,
        showReservedAmount: campaignData.show_reserved_amount ?? true,
        showSoldOutPercent: campaignData.show_sold_out_percent ?? true,
        hiddenSections: campaignData.hidden_sections || []
    }
}
