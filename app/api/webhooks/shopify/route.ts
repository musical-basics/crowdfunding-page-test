import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(req: Request) {
    const text = await req.text()

    // 1. Security Check (HMAC)
    // You get this secret from Shopify Settings -> Notifications -> Webhooks
    const hmac = req.headers.get('x-shopify-hmac-sha256')
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || ""

    if (secret) {
        const hash = crypto.createHmac('sha256', secret).update(text, 'utf8').digest('base64')
        if (hash !== hmac) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const order = JSON.parse(text)
    const supabase = createAdminClient()

    // 2. Process Order
    try {
        const email = order.email
        const name = order.shipping_address?.name || order.customer?.first_name || "Backer"
        const location = order.shipping_address?.country || "Unknown"

        // 3. Find Customer (or create)
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

        // 4. Iterate Line Items
        // We match the Shopify Variant ID in the order to the one in your DB
        // Fetch ALL rewards to check against JSON maps
        const { data: allRewards } = await supabase
            .from("cf_reward")
            .select("id, shopify_variant_id")
            .eq("campaign_id", "dreamplay-one") // Optimization: only fetch for this campaign

        for (const item of order.line_items) {
            const variantId = item.variant_id.toString()
            const price = parseFloat(item.price)

            // Find matching reward in memory
            const reward = allRewards?.find(r => {
                if (!r.shopify_variant_id) return false

                // 1. Direct Match
                if (r.shopify_variant_id === variantId) return true

                // 2. JSON Map Match (for Bundles/Options)
                if (r.shopify_variant_id.trim().startsWith("{")) {
                    try {
                        const map = JSON.parse(r.shopify_variant_id)
                        return Object.values(map).includes(variantId)
                    } catch (e) {
                        return false
                    }
                }
                return false
            })

            if (reward) {
                // Insert Pledge
                await supabase.from("cf_pledge").insert({
                    campaign_id: "dreamplay-one",
                    reward_id: reward.id,
                    customer_id: customerId,
                    amount: price,
                    shipping_location: location,
                    status: "succeeded",
                    // Store Shopify Order ID to prevent duplicates if webhook fires twice
                    shipping_address: `Shopify Order #${order.order_number}`
                })

                // Update Campaign Stats (total_pledged + total_backers)
                const { data: campaignData } = await supabase
                    .from("cf_campaign")
                    .select("total_pledged, total_backers")
                    .eq("id", "dreamplay-one")
                    .single()

                if (campaignData) {
                    await supabase.from("cf_campaign").update({
                        total_pledged: Number(campaignData.total_pledged) + price,
                        total_backers: Number(campaignData.total_backers) + 1
                    }).eq("id", "dreamplay-one")
                }

                // Update Reward Backers Count
                const { data: rewardData } = await supabase
                    .from("cf_reward")
                    .select("backers_count")
                    .eq("id", reward.id)
                    .single()

                if (rewardData) {
                    await supabase.from("cf_reward").update({
                        backers_count: rewardData.backers_count + 1
                    }).eq("id", reward.id)
                }
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Webhook Error:", error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
