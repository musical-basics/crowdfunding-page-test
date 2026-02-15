'use server'

import { createAdminClient } from "@/lib/supabase/server" // <--- Import from new server file
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function submitPledge(formData: FormData) {
    const supabase = createAdminClient() // <--- Initialize it here
    const campaignId = "dreamplay-one"

    const rewardId = formData.get("rewardId") as string
    const amount = Number(formData.get("amount"))
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const shippingAddress = formData.get("address") as string
    const shippingLocation = formData.get("shippingLocation") as string

    // 1. Find or Create Customer
    // We try to find a customer by email first
    let customerId: string

    const { data: existingCustomer } = await supabase
        .from("Customer")
        .select("id")
        .eq("email", email)
        .single()

    if (existingCustomer) {
        customerId = existingCustomer.id
    } else {
        // Create new customer
        const newId = crypto.randomUUID()
        const { error: createError } = await supabase
            .from("Customer")
            .insert({
                id: newId,
                email,
                name,
                // Add any other required fields for your Customer table here
            })

        if (createError) throw new Error(`Customer creation failed: ${createError.message}`)
        customerId = newId
    }

    // 2. Create the Pledge Record
    const { error: pledgeError } = await supabase
        .from("cf_pledge")
        .insert({
            campaign_id: campaignId,
            reward_id: rewardId,
            customer_id: customerId,
            amount: amount,
            shipping_address: shippingAddress,
            shipping_location: shippingLocation,
            status: 'succeeded' // In a real Stripe app, this would be 'pending' until webhook fires
        })

    if (pledgeError) throw new Error(`Pledge failed: ${pledgeError.message}`)

    // 3. Update Campaign Stats (Atomic Increment)
    // We use an RPC call or direct update. For simplicity/speed in this prototype, we fetch and update.
    // Ideally, you'd use a Database Trigger for this to ensure consistency.

    // A. Update Campaign Totals
    const { data: campaign } = await supabase
        .from("cf_campaign")
        .select("total_pledged, total_backers")
        .eq("id", campaignId)
        .single()

    if (campaign) {
        await supabase.from("cf_campaign").update({
            total_pledged: Number(campaign.total_pledged) + amount,
            total_backers: Number(campaign.total_backers) + 1
        }).eq("id", campaignId)
    }

    // B. Update Reward Stats
    const { data: reward } = await supabase
        .from("cf_reward")
        .select("backers_count")
        .eq("id", rewardId)
        .single()

    if (reward) {
        await supabase.from("cf_reward").update({
            backers_count: reward.backers_count + 1
        }).eq("id", rewardId)
    }

    // 4. Revalidate to show new numbers on UI
    revalidatePath("/")

    return { success: true }
}

// 4. Join Email List
export async function joinEmailList(formData: FormData) {
    const email = formData.get("email") as string
    const name = formData.get("name") as string

    if (!email) return { success: false, error: "Email is required" }

    try {
        const headerStore = await headers()
        const city = headerStore.get("x-vercel-ip-city") || "Unknown"
        const country = headerStore.get("x-vercel-ip-country") || "Unknown"
        const ip = headerStore.get("x-forwarded-for") || "Unknown"

        const apiPayload = {
            email,
            first_name: name,
            tags: ["crowdfunding-waitlist"],
            city,
            country,
            ip_address: ip
        }

        const response = await fetch("https://email.dreamplaypianos.com/api/webhooks/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayload)
        })

        if (!response.ok) {
            let errorMessage = "Failed to subscribe"
            try {
                const errorData = await response.json()
                if (errorData.error) errorMessage = errorData.error
            } catch (e) {
                // Ignore json parse error
            }
            console.error('Subscription API error:', response.status, response.statusText)
            return { success: false, error: errorMessage }
        }

        return { success: true }

    } catch (error: any) {
        console.error('Server Action subscription error:', error)
        return { success: false, error: error.message || "Internal server error" }
    }
}

// 5. Increment Project Loves
export async function incrementProjectLoves() {
    const campaignId = "dreamplay-one"
    const supabase = createAdminClient()

    // 1. Get current count
    const { data: campaign, error: fetchError } = await supabase
        .from("cf_campaign")
        .select("loves_count")
        .eq("id", campaignId)
        .single()

    if (fetchError) return { success: false, error: fetchError.message }

    const newCount = (campaign.loves_count || 0) + 1

    // 2. Increment count
    const { error: updateError } = await supabase
        .from("cf_campaign")
        .update({ loves_count: newCount })
        .eq("id", campaignId)

    if (updateError) return { success: false, error: updateError.message }

    revalidatePath("/")
    return { success: true, count: newCount }
}

// --- COMMUNITY ACTIONS ---

// 1. ADMIN: Post an Update
export async function postCampaignUpdate(formData: FormData) {
    console.log("🚀 Starting Post Update Action...")

    // 1. Check if the Key exists
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing!")
        return { success: false, error: "Server misconfiguration: Missing Key" }
    }

    const supabase = createAdminClient()
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const image = formData.get("image") as string

    console.log("📝 Payload:", { title, content, image })

    // 2. Perform Insert
    const { data, error } = await supabase.from("cf_update").insert({
        campaign_id: "dreamplay-one",
        title,
        content,
        image: image || null // Ensure we don't send undefined
    })
        .select()

    // 3. Log Result
    if (error) {
        console.error("❌ Database Error:", error.message, error.details)
        return { success: false, error: error.message }
    }

    console.log("✅ Success! Row created:", data)
    revalidatePath("/")
    return { success: true }
}

// 2. ADMIN: Delete an Update
export async function deleteCampaignUpdate(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from("cf_update").delete().eq("id", id)

    if (error) {
        console.error("Delete Error:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
}

// 3. ADMIN: Edit an Update
export async function editCampaignUpdate(formData: FormData) {
    const supabase = createAdminClient()
    const id = formData.get("id") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const image = formData.get("image") as string

    const { error } = await supabase.from("cf_update").update({
        title,
        content,
        image: image || null
    }).eq("id", id)

    if (error) {
        console.error("Edit Error:", error)
        return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true }
}

// 2. PUBLIC: Post a Comment
export async function postComment(formData: FormData) {
    const supabase = createAdminClient()
    const updateId = formData.get("updateId") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const content = formData.get("content") as string

    const { error } = await supabase.from("cf_comment").insert({
        update_id: updateId,
        name,
        email,
        content
    })

    if (error) return { success: false, error: error.message }
    revalidatePath("/")
    return { success: true }
}

// 3. GET: Fetch Feed with "Verified" Logic
export async function getCommunityFeed() {
    const supabase = createAdminClient()

    // Fetch Updates
    const { data: updates } = await supabase
        .from("cf_update")
        .select("*")
        .order("created_at", { ascending: false })

    if (!updates) return []

    // Fetch Comments
    const { data: comments } = await supabase
        .from("cf_comment")
        .select("*")
        .order("created_at", { ascending: true })

    // Fetch All Backer Emails (to check status)
    // In a huge app, we'd do this differently, but for <10k backers this is instant.
    const { data: pledges } = await supabase
        .from("cf_pledge")
        .select("customer_id, Customer(email)")
        .eq("status", "succeeded")

    // Create a Set of verified emails for O(1) lookup
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const verifiedEmails = new Set(pledges?.map((p: any) => p.Customer?.email).filter(Boolean))

    // Merge Data
    return updates.map(update => ({
        ...update,
        comments: comments
            ?.filter(c => c.update_id === update.id)
            .map(c => ({
                ...c,
                isVerified: verifiedEmails.has(c.email) // <--- MAGIC HAPPENS HERE
            })) || []
    }))
}
