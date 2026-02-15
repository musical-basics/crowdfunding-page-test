"use client"

import { CommunityTab } from "@/components/crowdfunding/community-tab"

export default function AdminCommunityPage() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Post Updates & Moderate</h2>
                <p className="text-sm text-muted-foreground mb-8">
                    Post updates to your backers and reply to their comments.
                    Verified backers will have a badge next to their name.
                </p>

                <CommunityTab isAdmin={true} />
            </div>
        </div>
    )
}
