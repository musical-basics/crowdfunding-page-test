import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
    const { data: rewards, error } = await supabase
        .from('cf_reward')
        .select('id, title, price, shopify_variant_id')
        .eq('campaign_id', 'dreamplay-one')

    if (error) {
        console.error('Error fetching rewards:', error)
        return
    }

    console.log('Rewards:', JSON.stringify(rewards, null, 2))
}

main()
