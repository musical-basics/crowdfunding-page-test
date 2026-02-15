import { Client } from 'pg'
import fs from 'fs'
import path from 'path'

// Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local')
let connectionString = ''

if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
            if (key.trim() === 'POSTGRES_URL') {
                connectionString = value.trim()
            }
        }
    })
}

if (!connectionString) {
    console.error("❌ POSTGRES_URL not found in .env.local")
    process.exit(1)
}

async function main() {
    const sqlPath = path.resolve(__dirname, '../supabase/update_reward_stats_trigger.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    console.log("Connecting to Database...")
    const client = new Client({
        connectionString: connectionString,
    })

    try {
        await client.connect()
        console.log("Applying SQL Trigger Update...")
        await client.query(sql)
        console.log("✅ Successfully updated database trigger!")
    } catch (err) {
        console.error("❌ Error applying SQL:", err)
    } finally {
        await client.end()
    }
}

main()
