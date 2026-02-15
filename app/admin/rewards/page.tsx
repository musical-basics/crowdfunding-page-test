"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Trash, Eye, EyeOff, Copy, GripVertical, Ban, CheckCircle2 } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useCampaign } from "@/context/campaign-context"
import { CreateRewardDialog } from "@/components/admin/create-reward-dialog"
import { EditRewardDialog } from "@/components/admin/edit-reward-dialog"
import { deleteReward, toggleRewardVisibility, duplicateReward, updateRewardOrder, toggleRewardSoldOut } from "../actions"
import { useToast } from "@/hooks/use-toast"

import { ImportRewardsButton } from "@/components/admin/import-rewards-button"
import { BulkAddRewardsDialog } from "@/components/admin/bulk-add-rewards-dialog"

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sortable Row Component ---
function SortableRow({ reward, children }: { reward: any, children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: reward.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        position: isDragging ? 'relative' as const : undefined,
        backgroundColor: isDragging ? 'var(--background)' : undefined,
        boxShadow: isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : undefined,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={!reward.isVisible ? "opacity-60 bg-muted/30" : ""}
        >
            <TableCell className="w-[50px]">
                <div {...attributes} {...listeners} className="cursor-grab hover:text-foreground text-muted-foreground p-2 -ml-2 rounded-md hover:bg-muted">
                    <GripVertical className="h-4 w-4" />
                </div>
            </TableCell>
            {children}
        </TableRow>
    );
}

export default function AdminRewardsPage() {
    const { campaign, refreshCampaign } = useCampaign()
    const { toast } = useToast()
    const [orderedRewards, setOrderedRewards] = useState<any[]>([])

    // Sync local state with campaign data
    useEffect(() => {
        if (campaign?.rewards) {
            setOrderedRewards(campaign.rewards)
        }
    }, [campaign?.rewards])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Require movement of 2px before drag starts to prevent accidental clicks
            activationConstraint: { distance: 2 }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            setOrderedRewards((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over?.id);

                const newOrder = arrayMove(items, oldIndex, newIndex);

                // Fire and forget server update (optimistic UI)
                const ids = newOrder.map(r => r.id)
                updateRewardOrder(ids).then(res => {
                    if (!res.success) {
                        toast({ title: "Error", description: "Failed to save order", variant: "destructive" })
                        refreshCampaign() // Revert on failure
                    }
                })

                return newOrder;
            });
        }
    };

    const handleToggleVisibility = async (reward: any) => {
        try {
            await toggleRewardVisibility(reward.id, reward.isVisible)
            await refreshCampaign()
            toast({
                title: reward.isVisible ? "Reward Hidden" : "Reward Visible",
                description: `"${reward.title}" is now ${reward.isVisible ? "hidden" : "live"}.`
            })
        } catch (e) {
            toast({ title: "Error", description: "Failed to update visibility", variant: "destructive" })
        }
    }

    const handleDuplicate = async (rewardId: string) => {
        try {
            const result = await duplicateReward(rewardId)
            if (result.success) {
                await refreshCampaign()
                toast({
                    title: "Reward Duplicated",
                    description: "A copy of the reward has been created."
                })
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to duplicate reward",
                    variant: "destructive"
                })
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to duplicate reward", variant: "destructive" })
        }
    }

    const handleToggleSoldOut = async (reward: any) => {
        try {
            await toggleRewardSoldOut(reward.id, reward.isSoldOut)
            await refreshCampaign()
            toast({
                title: !reward.isSoldOut ? "Marked as Sold Out" : "Marked as Available",
                description: `"${reward.title}" is now ${!reward.isSoldOut ? "sold out" : "available"}.`
            })
        } catch (e) {
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Manage Rewards</h1>

                <div className="flex gap-2">
                    <BulkAddRewardsDialog />
                    <ImportRewardsButton />
                    <CreateRewardDialog />
                </div>

            </div>

            <div className="border rounded-lg">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]"></TableHead> {/* Spacer for drag handle */}
                                <TableHead>Title</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Backers</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <SortableContext
                                items={orderedRewards.map(r => r.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {orderedRewards.map((reward) => (
                                    <SortableRow key={reward.id} reward={reward}>
                                        <TableCell className="font-medium">
                                            {reward.title}
                                            {!reward.isVisible && (
                                                <Badge variant="outline" className="ml-2 text-xs border-dashed">Hidden</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>${reward.price}</TableCell>
                                        <TableCell>{reward.backersCount}</TableCell>
                                        <TableCell>
                                            {!reward.isVisible ? (
                                                <Badge variant="outline">Hidden</Badge>
                                            ) : reward.isSoldOut ? (
                                                <Badge variant="destructive">Sold Out</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                                                    Active
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleVisibility(reward)}
                                                    title={reward.isVisible ? "Hide from public" : "Show to public"}
                                                >
                                                    {reward.isVisible ? (
                                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggleSoldOut(reward)}
                                                    title={reward.isSoldOut ? "Mark as Available" : "Mark as Sold Out"}
                                                    className={reward.isSoldOut ? "text-emerald-600" : "text-orange-500"}
                                                >
                                                    {reward.isSoldOut ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <Ban className="h-4 w-4" />
                                                    )}
                                                </Button>

                                                <EditRewardDialog reward={reward} />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDuplicate(reward.id)}
                                                    title="Duplicate Reward"
                                                >
                                                    <Copy className="h-4 w-4 text-muted-foreground" />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        >
                                                            <Trash className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the reward "{reward.title}" AND REMOVE ALL associated backers/pledges.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-red-600 hover:bg-red-700"
                                                                onClick={async () => {
                                                                    try {
                                                                        await deleteReward(reward.id)
                                                                        await refreshCampaign()
                                                                        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                                    } catch (error: any) {
                                                                        alert("Failed to delete reward. " + error.message)
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>

                                            </div>
                                        </TableCell>
                                    </SortableRow>
                                ))}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </DndContext>
            </div>
        </div>
    )
}
