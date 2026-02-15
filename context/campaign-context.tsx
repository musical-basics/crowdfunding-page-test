"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Campaign } from '@/types/campaign'

interface CampaignContextType {
    campaign: Campaign | null
    isLoading: boolean
    error: string | null
    totalPledged: number
    backersCount: number
    selectedRewardId: string | null
    selectReward: (rewardId: string) => void
    pledge: (amount: number) => void
    refreshCampaign: () => Promise<void>
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined)

// ADD: initialData prop
export function CampaignProvider({ children, initialData }: { children: ReactNode, initialData?: Campaign | null }) {
    // CHANGE: Initialize with initialData if present
    const [campaign, setCampaign] = useState<Campaign | null>(initialData || null)
    const [isLoading, setIsLoading] = useState(!initialData)
    const [error, setError] = useState<string | null>(null)

    // Initialize stats from server data immediately
    const [totalPledged, setTotalPledged] = useState(initialData?.stats.totalPledged || 0)
    const [backersCount, setBackersCount] = useState(initialData?.stats.totalBackers || 0)

    const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null)

    const fetchCampaign = async () => {
        try {
            // Optional: Don't set loading true if we are just refreshing
            const res = await fetch('/api/campaign')
            if (!res.ok) throw new Error('Failed to fetch campaign')
            const data = await res.json()
            setCampaign(data)

            // Only update these on fresh fetches to avoid jitter
            setTotalPledged(data.stats.totalPledged)
            setBackersCount(data.stats.totalBackers)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    // CHANGE: Only fetch on mount if we DON'T have initialData
    // ALSO: If initialData changes (e.g. from live preview parent), update our state
    useEffect(() => {
        if (!initialData) {
            fetchCampaign()
        } else {
            setCampaign(initialData)
            // Also update stats if we want them to reflect live changes instantly
            setTotalPledged(initialData.stats.totalPledged)
            setBackersCount(initialData.stats.totalBackers)
        }
    }, [initialData])

    const refreshCampaign = () => {
        return fetchCampaign()
    }

    const selectReward = (rewardId: string) => {
        setSelectedRewardId(rewardId)
    }

    const pledge = (amount: number) => {
        setTotalPledged((prev) => prev + amount)
        setBackersCount((prev) => prev + 1)
    }

    return (
        <CampaignContext.Provider
            value={{
                campaign,
                isLoading,
                error,
                totalPledged,
                backersCount,
                selectedRewardId,
                selectReward,
                pledge,
                refreshCampaign
            }}
        >
            {children}
        </CampaignContext.Provider>
    )
}

export function useCampaign() {
    const context = useContext(CampaignContext)
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider')
    }
    return context
}
