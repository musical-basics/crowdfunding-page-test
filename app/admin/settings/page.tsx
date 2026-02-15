"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Calculator } from "lucide-react"
import { recalculateCampaignStats } from "../actions"
import { useToast } from "@/hooks/use-toast"
import { useCampaign } from "@/context/campaign-context"

export default function SettingsPage() {
    const [isRecalculating, setIsRecalculating] = useState(false)
    const { toast } = useToast()
    const { refreshCampaign } = useCampaign()

    const handleRecalculate = async () => {
        setIsRecalculating(true)
        try {
            const result = await recalculateCampaignStats()
            await refreshCampaign() // Update the UI context immediately

            toast({
                title: "Engine Synced",
                description: `Recalculated: $${result.stats.totalPledged} from ${result.stats.totalBackers} backers.`,
            })
        } catch (error) {
            toast({
                title: "Sync Failed",
                description: "Could not recalculate stats.",
                variant: "destructive"
            })
        } finally {
            setIsRecalculating(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings & Engine</h1>

            <Card className="border-emerald-100 dark:border-emerald-900/30">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Calculator className="h-5 w-5 text-emerald-600" />
                        <CardTitle>Pledge Calculation Engine</CardTitle>
                    </div>
                    <CardDescription>
                        The database automatically tracks pledges via Triggers.
                        Use this if you suspect the numbers are out of sync.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={handleRecalculate}
                        disabled={isRecalculating}
                        variant="outline"
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
                        {isRecalculating ? "Recalculating..." : "Force Recalculate Totals"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
