"use client"

import { useEffect, useState } from "react"
import { getBackers, getRewards, updatePledgeReward, recalculateAllRewardCounts } from "@/app/admin/actions"
import { RefreshCw } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ManualPledgeDialog } from "@/components/admin/manual-pledge-dialog"
import { ImportPledgesButton } from "@/components/admin/import-pledges-button"
import { ExportPledgesButton } from "@/components/admin/export-pledges-button"
import { useToast } from "@/hooks/use-toast"

// Define interface for the data shape
interface Backer {
    id: string
    created_at: string
    amount: number
    status: string
    shipping_address: string | null
    shipping_location: string | null
    reward_id: string | null
    Customer: { name: string; email: string } | null
    cf_reward: { title: string } | null
}

interface Reward {
    id: string
    title: string
    price: number
}

export default function BackersPage() {
    const [pledges, setPledges] = useState<Backer[]>([])
    const [rewards, setRewards] = useState<Reward[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { toast } = useToast()

    async function loadData() {
        const [backersData, rewardsData] = await Promise.all([
            getBackers(),
            getRewards()
        ])
        // @ts-ignore - Supabase types can be tricky with joins
        setPledges(backersData as Backer[])
        setRewards(rewardsData as Reward[])
        setIsLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleRewardChange(pledgeId: string, newRewardId: string) {
        const rewardId = newRewardId === "none" ? null : newRewardId
        const reward = rewards.find(r => r.id === rewardId)

        // Optimistic update
        setPledges(prev => prev.map(p =>
            p.id === pledgeId
                ? { ...p, reward_id: rewardId, cf_reward: reward ? { title: reward.title } : null }
                : p
        ))

        try {
            await updatePledgeReward(pledgeId, rewardId)
            toast({ title: "Updated", description: `Reward changed to ${reward?.title || 'None'}` })
        } catch {
            // Revert on error
            const data = await getBackers()
            // @ts-ignore
            setPledges(data as Backer[])
            toast({ title: "Error", description: "Failed to update reward.", variant: "destructive" })
        }
    }

    if (isLoading) return <div className="p-8">Loading backers...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Backers & Pledges</h1>
                <div className="flex gap-2 items-center">
                    <div className="text-muted-foreground mr-2">Total: {pledges.length}</div>
                    <Button variant="outline" size="sm" onClick={async () => {
                        await recalculateAllRewardCounts()
                        await loadData()
                        toast({ title: "Refreshed", description: "Backer data and reward counts recalculated." })
                    }}>
                        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                    </Button>
                    <ExportPledgesButton data={pledges} />
                    <ImportPledgesButton />
                    <ManualPledgeDialog />
                </div>
            </div>

            <div className="border rounded-lg bg-background">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Backer</TableHead>
                            <TableHead>Reward</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Shipping Address</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pledges.map((pledge) => (
                            <TableRow key={pledge.id}>
                                <TableCell>
                                    {new Date(pledge.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">
                                        {pledge.Customer?.name || 'Unknown'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {pledge.Customer?.email || 'No email'}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Select
                                        value={pledge.reward_id || "none"}
                                        onValueChange={(val) => handleRewardChange(pledge.id, val)}
                                    >
                                        <SelectTrigger className="w-[280px] h-8 text-xs">
                                            <SelectValue placeholder="Select a reward" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Reward</SelectItem>
                                            {rewards.map((reward) => (
                                                <SelectItem key={reward.id} value={reward.id}>
                                                    {reward.title} (${reward.price})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell className="font-bold">
                                    ${pledge.amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="max-w-[250px] truncate" title={pledge.shipping_address || ""}>
                                    {pledge.shipping_address ? (
                                        <div className="text-sm">
                                            <div>{pledge.shipping_address.substring(0, 30)}...</div>
                                            <div className="text-xs text-muted-foreground">
                                                {pledge.shipping_location}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-muted-foreground text-xs">Digital / No Address</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={pledge.status === 'succeeded' ? 'default' : 'secondary'}
                                        className={pledge.status === 'succeeded' ? 'bg-emerald-600' : ''}
                                    >
                                        {pledge.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {pledges.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        No backers found. Try importing a CSV or adding one manually.
                    </div>
                )}
            </div>
        </div>
    )
}

