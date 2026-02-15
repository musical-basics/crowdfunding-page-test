'use server'

import { createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// --- CAMPAIGN ACTIONS ---

export async function updateCampaignDetails(formData: FormData) {
    const id = "dreamplay-one" // Hardcoded for single-campaign app

    const title = formData.get("title") as string
    const subtitle = formData.get("subtitle") as string
    const story = formData.get("story") as string
    const risks = formData.get("risks") as string
    const shipping = formData.get("shipping") as string
    const technicalDetails = formData.get("technicalDetails") as string
    const manufacturerDetails = formData.get("manufacturerDetails") as string
    const goalAmount = formData.get("goal")
    const totalSupply = formData.get("totalSupply")
    const endsAt = formData.get("endDate")

    const showAnnouncement = formData.get("show_announcement") === "true"
    const showReservedAmount = formData.get("show_reserved_amount") === "true"
    const showSoldOutPercent = formData.get("show_sold_out_percent") === "true"
    const hiddenSectionsJson = formData.get("hidden_sections_json") as string
    const hiddenSections = hiddenSectionsJson ? JSON.parse(hiddenSectionsJson) : []

    console.log("[SERVER ACTION] Raw FormData:", {
        show_announcement: formData.get("show_announcement"),
        show_reserved_amount: formData.get("show_reserved_amount"),
        show_sold_out_percent: formData.get("show_sold_out_percent"),
    })
    console.log("[SERVER ACTION] Parsed booleans:", { showAnnouncement, showReservedAmount, showSoldOutPercent })

    // Parse JSON fields
    const keyFeaturesJson = formData.get("key_features_json") as string
    const techSpecsJson = formData.get("tech_specs_json") as string

    // Default to empty array if valid JSON isn't provided (though UI sends [])
    const keyFeatures = keyFeaturesJson ? JSON.parse(keyFeaturesJson) : []
    const techSpecs = techSpecsJson ? JSON.parse(techSpecsJson) : []

    // Parse Media Gallery (New)
    const mediaGalleryJson = formData.get("media_gallery_json") as string
    const mediaGallery = mediaGalleryJson ? JSON.parse(mediaGalleryJson) : []

    // Handle Gallery Images
    // 1. Parse existing (kept) images
    const existingImagesJson = formData.get("existing_gallery_images") as string
    let galleryImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : []

    // 2. Handle new file uploads
    const newFiles = formData.getAll("new_gallery_images") as File[]

    // We need a supabase client for storage uploads
    const supabase = createAdminClient()

    if (newFiles && newFiles.length > 0) {
        for (const file of newFiles) {
            if (file.size > 0) {
                const fileExt = file.name.split('.').pop()
                const fileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
                const filePath = `campaign-gallery/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('campaign-assets')
                    .upload(filePath, file)

                if (uploadError) {
                    console.error("Upload failed:", uploadError)
                    continue // Skip failed uploads but continue with others
                }

                const { data: urlData } = supabase.storage
                    .from('campaign-assets')
                    .getPublicUrl(filePath)

                galleryImages.push(urlData.publicUrl)
            }
        }
    }

    // Handle Hero Image
    const heroImageFile = formData.get("hero_image_file") as File
    let heroImageUrl = formData.get("hero_image_url") as string

    // If it's a blob URL (preview), we must ignore it and rely on file upload
    // But if we cleared it (empty string), we respect that.
    if (heroImageUrl && heroImageUrl.startsWith("blob:")) {
        heroImageUrl = "" // Will be replaced by new upload or remains empty if upload fails
    }

    if (heroImageFile && heroImageFile.size > 0) {
        const fileExt = heroImageFile.name.split('.').pop()
        const fileName = `hero-${Date.now()}.${fileExt}`
        const filePath = `campaign-hero/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('campaign-assets')
            .upload(filePath, heroImageFile)

        if (!uploadError) {
            const { data: urlData } = supabase.storage
                .from('campaign-assets')
                .getPublicUrl(filePath)
            heroImageUrl = urlData.publicUrl
        }
    }

    const { error } = await supabase
        .from("cf_campaign")
        .update({
            title,
            subtitle,
            story,
            risks,
            shipping,
            technical_details: technicalDetails,
            manufacturer_details: manufacturerDetails,
            goal_amount: goalAmount,
            total_supply: totalSupply || 100,
            media_gallery: mediaGallery,
            ends_at: endsAt ? new Date(endsAt as string).toISOString() : undefined,
            gallery_images: galleryImages,
            hero_image: heroImageUrl,
            key_features: keyFeatures,
            tech_specs: techSpecs,
            show_announcement: showAnnouncement,
            show_reserved_amount: showReservedAmount,
            show_sold_out_percent: showSoldOutPercent,
            hidden_sections: hiddenSections
        })
        .eq("id", id)

    console.log("[SERVER ACTION] Supabase update result:", { error: error?.message || 'none', updatePayload: { show_announcement: showAnnouncement, show_reserved_amount: showReservedAmount, show_sold_out_percent: showSoldOutPercent } })

    if (error) {
        console.error("Supabase Update Error:", error.message)
        throw new Error(`Database error: ${error.message}`)
    }

    // Refresh the data on the site immediately
    revalidatePath("/")
    revalidatePath("/admin/details")
    revalidatePath("/api/campaign")
    return { success: true }
}

// --- REWARD ACTIONS ---

export async function deleteReward(rewardId: string) {
    const supabase = createAdminClient()

    // 1. Delete associated pledges first (Nuclear Option)
    const { error: pledgeError } = await supabase
        .from("cf_pledge")
        .delete()
        .eq("reward_id", rewardId)

    if (pledgeError) throw new Error(`Failed to delete associated pledges: ${pledgeError.message}`)

    // 2. Delete the reward
    const { error } = await supabase
        .from("cf_reward")
        .delete()
        .eq("id", rewardId)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/rewards")
    revalidatePath("/") // Update public page too
    return { success: true }
}

export async function createReward(prevState: any, formData: FormData) {
    const campaignId = "dreamplay-one"
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_reward")
        .insert({
            id: crypto.randomUUID(), // Generate a new ID
            campaign_id: campaignId,
            title: formData.get("title"),
            price: Number(formData.get("price")),
            description: formData.get("description"),
            items_included: (formData.get("items") as string).split(",").map(i => i.trim()),
            estimated_delivery: formData.get("delivery"),
            limit_quantity: formData.get("quantity") ? Number(formData.get("quantity")) : null,
            ships_to: ["Anywhere in the world"], // Default to worldwide
            is_sold_out: false,
            image_url: await uploadRewardImage(formData.get("imageFile") as File, supabase),
            is_featured: formData.get("badgeType") === "featured",
            badge_type: (formData.get("badgeType") as string) || "none",
            checkout_url: formData.get("checkoutUrl") as string,
            shopify_variant_id: formData.get("shopifyVariantId") as string,
            reward_type: (formData.get("rewardType") as string) || "bundle"
        })

    if (error) return { error: error.message }

    revalidatePath("/admin/rewards")
    return { success: true }
}

export async function updateReward(prevState: any, formData: FormData) {
    const id = formData.get("id") as string
    const supabase = createAdminClient()

    // Upload image first so we can catch errors
    const imageFile = formData.get("imageFile") as File
    const existingImageUrl = formData.get("imageUrl") as string
    let imageUrl = existingImageUrl || null

    console.log("[updateReward] File info:", {
        hasFile: !!imageFile,
        size: imageFile?.size,
        name: imageFile?.name,
        existingUrl: existingImageUrl
    })

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name?.split('.').pop() || 'jpg'
        const fileName = `reward-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `rewards/${fileName}`

        console.log("[updateReward] Uploading to:", filePath)

        const { error: uploadError } = await supabase.storage
            .from('campaign-assets')
            .upload(filePath, imageFile)

        if (uploadError) {
            console.error("[updateReward] Upload failed:", uploadError)
            return { error: `Image upload failed: ${uploadError.message}` }
        }

        const { data: urlData } = supabase.storage
            .from('campaign-assets')
            .getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
        console.log("[updateReward] Upload successful, new URL:", imageUrl)
    }

    console.log("[updateReward] Updating DB with image_url:", imageUrl)

    const { error } = await supabase
        .from("cf_reward")
        .update({
            title: formData.get("title"),
            price: Number(formData.get("price")),
            description: formData.get("description"),
            items_included: (formData.get("items") as string).split(",").map(i => i.trim()),
            estimated_delivery: formData.get("delivery"),
            limit_quantity: formData.get("quantity") ? Number(formData.get("quantity")) : null,
            image_url: imageUrl,
            is_featured: formData.get("badgeType") === "featured",
            badge_type: (formData.get("badgeType") as string) || "none",
            checkout_url: formData.get("checkoutUrl") as string,
            shopify_variant_id: formData.get("shopifyVariantId") as string,
            reward_type: (formData.get("rewardType") as string) || "bundle"
        })
        .eq("id", id)

    if (error) {
        console.error("[updateReward] DB update failed:", error)
        return { error: error.message }
    }

    console.log("[updateReward] Success!")
    revalidatePath("/admin/rewards")
    revalidatePath("/")
    return { success: true }
}

export async function toggleRewardVisibility(rewardId: string, currentStatus: boolean) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_reward")
        .update({ is_visible: !currentStatus })
        .eq("id", rewardId)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/rewards")
    revalidatePath("/") // Update public page
    return { success: true }
}

export async function toggleRewardSoldOut(rewardId: string, currentStatus: boolean) {
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_reward")
        .update({ is_sold_out: !currentStatus })
        .eq("id", rewardId)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/rewards")
    revalidatePath("/") // Update public page
    return { success: true }
}

export async function duplicateReward(rewardId: string) {
    const supabase = createAdminClient()

    // 1. Fetch original reward
    const { data: original, error: fetchError } = await supabase
        .from("cf_reward")
        .select("*")
        .eq("id", rewardId)
        .single()

    if (fetchError || !original) {
        return { success: false, error: "Failed to fetch original reward" }
    }

    // 2. Create copy
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { id, created_at, backers_count, ...rest } = original

    const { error: insertError } = await supabase
        .from("cf_reward")
        .insert({
            ...rest,
            id: crypto.randomUUID(),
            title: `Copy of ${original.title}`,
            backers_count: 0,
            is_sold_out: false
        })

    if (insertError) {
        return { success: false, error: insertError.message }
    }

    revalidatePath("/admin/rewards")
    return { success: true }
}

async function uploadRewardImage(file: File, supabase: any, existingUrl?: string) {
    if (!file || file.size === 0) return existingUrl || null

    const fileExt = file.name.split('.').pop()
    const fileName = `reward-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `rewards/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('campaign-assets')
        .upload(filePath, file)

    if (uploadError) {
        console.error("Upload failed:", uploadError)
        return existingUrl || null
    }

    const { data: urlData } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(filePath)

    return urlData.publicUrl
}

export async function updateRewardOrder(orderedIds: string[]) {
    const supabase = createAdminClient()

    // 1. Prepare updates
    // We can't do a single bulk update with different values for the same column easily in Supabase/Postgrest
    // So we'll loop. For a small number of rewards (e.g. < 50), this is fine.
    // Ideally, we'd use a stored procedure or a single CASE WHEN query if performance matters.

    const updates = orderedIds.map((id, index) => {
        return supabase
            .from('cf_reward')
            .update({ sort_order: index })
            .eq('id', id)
    })

    // 2. Execute all updates
    try {
        await Promise.all(updates)
        revalidatePath("/admin/rewards")
        revalidatePath("/")
        return { success: true }
    } catch (error: any) {
        console.error("Failed to update reward order:", error)
        return { success: false, error: error.message }
    }
}

// --- FAQ ACTIONS ---

export async function deleteFAQ(faqId: string) {
    const supabase = createAdminClient()
    const { error } = await supabase
        .from("cf_faq")
        .delete()
        .eq("id", faqId)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/faqs")
    revalidatePath("/")
    return { success: true }
}

// --- CREATOR ACTIONS ---

export async function updateCreatorProfile(formData: FormData) {
    const id = "popumusic" // Hardcoded for this single-creator demo

    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const location = formData.get("location") as string

    const pageContent = formData.get("pageContent") as string

    const supabase = createAdminClient() // Move to top scope

    // Handle File Upload
    const avatarFile = formData.get("avatarFile") as File
    let avatarUrl = formData.get("avatarUrl") as string

    if (avatarFile && avatarFile.size > 0) {
        // 1. Upload file to Supabase Storage
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `avatar-${Date.now()}.${fileExt}`
        const filePath = `creators/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('campaign-assets')
            .upload(filePath, avatarFile)

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
            .from('campaign-assets')
            .getPublicUrl(filePath)

        avatarUrl = urlData.publicUrl
    }

    const { error } = await supabase
        .from("cf_creator")
        .update({
            name,
            bio,
            location,
            avatar_url: avatarUrl,
            page_content: pageContent
        })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/creator")
    revalidatePath("/") // Update public page immediately
    return { success: true }
}

export async function uploadCreatorAsset(formData: FormData) {
    const file = formData.get("file") as File
    if (!file || file.size === 0) return { error: "No file provided" }

    const supabase = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `creator-asset-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `creators/content/${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('campaign-assets')
        .upload(filePath, file)

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(filePath)

    return { success: true, url: urlData.publicUrl }
}

// --- FAQ PAGE CONTENT ACTIONS ---

export async function updateFAQPageContent(formData: FormData) {
    const id = "dreamplay-one" // Hardcoded for single-campaign app

    const faqPageContent = formData.get("faqPageContent") as string

    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_campaign")
        .update({ faq_page_content: faqPageContent })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/faqs")
    revalidatePath("/")
    return { success: true }
}

// Helper to parse CSV respecting quotes
function parseCSVLine(line: string): string[] {
    const result = [];
    let startValueIndex = 0;
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') {
            inQuotes = !inQuotes;
        } else if (line[i] === ',' && !inQuotes) {
            let val = line.substring(startValueIndex, i).trim();
            // Remove surrounding quotes if present
            if (val.startsWith('"') && val.endsWith('"')) {
                val = val.slice(1, -1).replace(/""/g, '"');
            }
            result.push(val);
            startValueIndex = i + 1;
        }
    }
    // Push last value
    let lastVal = line.substring(startValueIndex).trim();
    if (lastVal.startsWith('"') && lastVal.endsWith('"')) {
        lastVal = lastVal.slice(1, -1).replace(/""/g, '"');
    }
    result.push(lastVal);
    return result;
}

// --- CSV IMPORT ACTION ---

export async function importRewards(formData: FormData) {
    const file = formData.get("file") as File
    if (!file) return { success: false, error: "No file provided" }

    const supabase = createAdminClient()

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)

    // Assuming Row 1 is header, skip it
    // Expected Format: Title, Price, Description, Items (comma sep), Delivery, Quantity
    const dataRows = lines.slice(1)
    const campaignId = "dreamplay-one"
    const newRewards = []

    for (const line of dataRows) {
        const cols = parseCSVLine(line)

        // Safety check for column count
        if (cols.length < 3) continue

        newRewards.push({
            id: crypto.randomUUID(),
            campaign_id: campaignId,
            title: cols[0] || "Untitled Reward",
            price: parseFloat(cols[1]) || 0,
            description: cols[2] || "",
            items_included: cols[3] ? cols[3].split(';').map(i => i.trim()) : [], // Use ; for items inside CSV
            estimated_delivery: cols[4] || "TBD",
            ships_to: ["Anywhere in the world"],
            limit_quantity: cols[5] ? parseInt(cols[5]) : null,
            backers_count: 0,
            is_sold_out: false
        })
    }

    if (newRewards.length === 0) {
        return { success: false, error: "No valid rows found in CSV" }
    }

    const { error } = await supabase
        .from("cf_reward")
        .insert(newRewards)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/rewards")
    revalidatePath("/")

    return { success: true, count: newRewards.length }
}

// Define the type for our bulk insert payload
type RewardRow = {
    title: string
    price: number
    description: string
    items: string
    delivery: string
    quantity: number | null
}

export async function bulkCreateRewards(rewards: RewardRow[]) {
    const campaignId = "dreamplay-one"
    const supabase = createAdminClient()

    // Transform the rows into the database format
    const dbPayload = rewards.map(r => ({
        id: crypto.randomUUID(),
        campaign_id: campaignId,
        title: r.title,
        price: r.price,
        description: r.description,
        items_included: r.items ? r.items.split(',').map(i => i.trim()) : [],
        estimated_delivery: r.delivery,
        limit_quantity: r.quantity && r.quantity > 0 ? r.quantity : null,
        ships_to: ["Anywhere in the world"],
        is_sold_out: false,
        backers_count: 0
    }))

    const { error } = await supabase
        .from("cf_reward")
        .insert(dbPayload)

    if (error) return { success: false, error: error.message }

    revalidatePath("/admin/rewards")
    revalidatePath("/")

    return { success: true }
}

// --- FAQ ACTIONS ---

export async function createFAQ(formData: FormData) {
    const campaignId = "dreamplay-one"
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_faq")
        .insert({
            id: crypto.randomUUID(),
            campaign_id: campaignId,
            question: formData.get("question"),
            answer: formData.get("answer"),
            category: formData.get("category"),
            order: 0 // Default to 0 for now
        })

    if (error) throw new Error(error.message)

    revalidatePath("/admin/faqs")
    revalidatePath("/")
    return { success: true }
}

export async function updateFAQ(formData: FormData) {
    const id = formData.get("id") as string
    const supabase = createAdminClient()

    const { error } = await supabase
        .from("cf_faq")
        .update({
            question: formData.get("question"),
            answer: formData.get("answer"),
            category: formData.get("category"),
        })
        .eq("id", id)

    if (error) throw new Error(error.message)

    revalidatePath("/admin/faqs")
    revalidatePath("/")
    return { success: true }
}

// --- SETTINGS ACTIONS ---

export async function recalculateCampaignStats() {
    const campaignId = "dreamplay-one"
    const supabase = createAdminClient()

    // 1. Calculate Totals from scratch (The Source of Truth)
    const { data, error } = await supabase
        .from('cf_pledge')
        .select('amount')
        .eq('campaign_id', campaignId)
        .eq('status', 'succeeded')

    if (error) throw new Error(error.message)

    // 2. Perform the math
    const totalPledged = data.reduce((sum, row) => sum + Number(row.amount), 0)
    const totalBackers = data.length

    // 3. Overwrite the Campaign Table
    const { error: updateError } = await supabase
        .from('cf_campaign')
        .update({
            total_pledged: totalPledged,
            total_backers: totalBackers
        })
        .eq('id', campaignId)

    if (updateError) throw new Error(updateError.message)

    revalidatePath("/")
    revalidatePath("/admin")

    return {
        success: true,
        stats: { totalPledged, totalBackers }
    }
}

// --- MANUAL PLEDGE ACTIONS ---

export async function createManualPledge(formData: FormData) {
    const supabase = createAdminClient()

    const rewardId = formData.get("rewardId") as string
    const amount = Number(formData.get("amount"))
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const location = formData.get("location") as string
    const date = formData.get("date") as string // "YYYY-MM-DD"

    // 1. Create/Find Customer
    // (Simplified: Just creates a placeholder if email doesn't exist)
    let customerId
    const { data: existing } = await supabase.from("Customer").select("id").eq("email", email).single()

    if (existing) {
        customerId = existing.id
    } else {
        const { data: newCustomer } = await supabase.from("Customer").insert({
            id: crypto.randomUUID(),
            email,
            name
        }).select("id").single()
        customerId = newCustomer?.id
    }

    // 2. Create Pledge
    // We override 'created_at' so the chart shows the correct historical date
    const { error } = await supabase.from("cf_pledge").insert({
        campaign_id: "dreamplay-one",
        reward_id: rewardId,
        customer_id: customerId,
        amount: amount,
        shipping_location: location,
        status: "succeeded",
        created_at: new Date(date).toISOString() // <--- Critical for history
    })

    if (error) return { success: false, error: error.message }

    revalidatePath("/")
    revalidatePath("/admin/backers")
    return { success: true }
}

export async function getBackers() {
    const supabase = createAdminClient()

    // Fetch pledges with related Customer and Reward data
    const { data: pledges, error } = await supabase
        .from('cf_pledge')
        .select(`
            id,
            amount,
            created_at,
            status,
            shipping_address,
            shipping_location,
            reward_id,
            Customer ( name, email ),
            cf_reward ( title )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching backers:", error)
        return []
    }

    return pledges
}

export async function getRewards() {
    const supabase = createAdminClient()
    const { data, error } = await supabase
        .from('cf_reward')
        .select('id, title, price')
        .eq('campaign_id', 'dreamplay-one')
        .order('price', { ascending: true })

    if (error) {
        console.error("Error fetching rewards:", error)
        return []
    }
    return data
}

export async function updatePledgeReward(pledgeId: string, rewardId: string | null) {
    const supabase = createAdminClient()

    // 1. Update the pledge's reward
    const { error } = await supabase
        .from('cf_pledge')
        .update({ reward_id: rewardId })
        .eq('id', pledgeId)

    if (error) {
        console.error("Error updating pledge reward:", error)
        throw new Error(`Failed to update reward: ${error.message}`)
    }

    // 2. Recalculate ALL reward backers_counts from actual pledges
    //    This runs after any DB triggers have settled and overwrites with correct values
    await recalculateAllRewardCounts()

    revalidatePath("/")
    revalidatePath("/admin/backers")
    revalidatePath("/api/campaign")
    return { success: true }
}

export async function recalculateAllRewardCounts() {
    const supabase = createAdminClient()
    const campaignId = "dreamplay-one"

    // Get all rewards
    const { data: rewards } = await supabase
        .from('cf_reward')
        .select('id')
        .eq('campaign_id', campaignId)

    if (!rewards) return

    // Count actual pledges per reward and update
    for (const reward of rewards) {
        const { count } = await supabase
            .from('cf_pledge')
            .select('id', { count: 'exact', head: true })
            .eq('reward_id', reward.id)
            .eq('status', 'succeeded')

        const actualCount = count || 0

        await supabase
            .from('cf_reward')
            .update({ backers_count: actualCount })
            .eq('id', reward.id)

        console.log(`[recalculate] Reward ${reward.id}: backers_count = ${actualCount}`)
    }
}

export async function bulkImportPledges(rows: any[]) {
    const supabase = createAdminClient()
    const campaignId = "dreamplay-one"

    let successCount = 0
    let errors: string[] = []

    // 1. Fetch rewards lookup map
    const { data: rewards } = await supabase
        .from("cf_reward")
        .select("id, title, price")
        .eq("campaign_id", campaignId)

    const rewardMap = new Map(rewards?.map(r => [r.title.toLowerCase().trim(), r.id]))

    for (const [index, row] of rows.entries()) {
        const rowNum = index + 1
        try {
            // --- DATA CLEANING ---
            // Remove '$' and ',' from amounts (e.g. "$1,200.00" -> 1200.00)
            const cleanAmount = row.amount ? parseFloat(row.amount.toString().replace(/[$,]/g, '')) : 0

            if (!row.email || !cleanAmount) {
                errors.push(`Row ${rowNum}: Skipped (Missing email or invalid amount)`)
                continue
            }

            // --- REWARD MATCHING ---
            let rewardId = null
            if (row.reward) {
                rewardId = rewardMap.get(row.reward.toLowerCase().trim())
                // Fallback: Match by price if title fails
                if (!rewardId) {
                    const priceMatch = rewards?.find(r => Math.abs(r.price - cleanAmount) < 1)
                    if (priceMatch) rewardId = priceMatch.id
                }
            }

            // --- CUSTOMER LOOKUP/CREATE ---
            let customerId
            const { data: existingUser } = await supabase.from("Customer").select("id").eq("email", row.email).single()

            if (existingUser) {
                customerId = existingUser.id
            } else {
                const { data: newUser, error: userError } = await supabase.from("Customer").insert({
                    id: crypto.randomUUID(),
                    email: row.email,
                    name: row.name || "Backer"
                }).select("id").single()

                if (userError) {
                    console.error("Customer Error:", userError)
                    errors.push(`Row ${rowNum}: Failed to create customer (${userError.message})`)
                    continue
                }
                customerId = newUser.id
            }

            // --- PLEDGE INSERTION ---
            const fullAddress = row.address || ""
            const { error: pledgeError } = await supabase.from("cf_pledge").insert({
                campaign_id: campaignId,
                reward_id: rewardId, // Can be null if no match found
                customer_id: customerId,
                amount: cleanAmount,
                shipping_location: row.location || "Unknown",
                shipping_address: fullAddress,
                status: "succeeded",
                // Handle date formats safely
                created_at: row.date ? new Date(row.date).toISOString() : new Date().toISOString()
            })

            // --- CRITICAL ERROR CHECK ---
            if (pledgeError) {
                console.error("Pledge Error:", pledgeError)
                errors.push(`Row ${rowNum}: Database rejected pledge (${pledgeError.message})`)
            } else {
                successCount++
            }

        } catch (err: any) {
            console.error("System Error:", err)
            errors.push(`Row ${rowNum}: System crash (${err.message})`)
        }
    }

    revalidatePath("/")
    revalidatePath("/admin/backers")

    return { success: true, count: successCount, errors }
}
