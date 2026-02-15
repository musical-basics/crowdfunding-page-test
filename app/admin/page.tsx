"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Clock } from "lucide-react"
import { useCampaign } from "@/context/campaign-context"
import Link from "next/link"

export default function AdminDashboard() {
    const { totalPledged, backersCount, campaign } = useCampaign()

    if (!campaign) return <div className="p-8">Loading stats...</div>

    const formattedPledged = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(totalPledged)

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard Overview</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Link href="/admin/backers" className="block transition-transform hover:scale-[1.02]">
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Pledged</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formattedPledged}</div>
                            <p className="text-xs text-muted-foreground">
                                {((totalPledged / campaign.stats.goalAmount) * 100).toFixed(1)}% of goal reached
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/backers" className="block transition-transform hover:scale-[1.02]">
                    <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Backers</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{backersCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Total supporters
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Days Left</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{campaign.stats.daysLeft}</div>
                        <p className="text-xs text-muted-foreground">
                            Ends on {new Date(new Date().setDate(new Date().getDate() + campaign.stats.daysLeft)).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
