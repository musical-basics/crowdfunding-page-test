"use client"

import { useState } from "react"
import { useCampaign } from "@/context/campaign-context"
import { Button } from "@/components/ui/button"

export function RewardsPage() {
  const { campaign, selectReward, selectedRewardId } = useCampaign()
  const [activeTab, setActiveTab] = useState<'bundle' | 'keyboard_only'>('bundle')

  // Helper to determine if a reward is active
  const isAvailable = (reward: any) => !reward.isSoldOut

  if (!campaign) {
    return <div>Loading...</div>
  }

  // Pre-select the featured reward if available

  // Filter rewards by active tab
  const filteredRewards = campaign.rewards.filter(
    r => r.isVisible && (r.rewardType || 'bundle') === activeTab
  )

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Select a Reward</h2>

      {/* Reward Type Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('bundle')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === 'bundle'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Premium Bundle
        </button>
        <button
          onClick={() => setActiveTab('keyboard_only')}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeTab === 'keyboard_only'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          Keyboard Only
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredRewards.map((reward) => {
          const isFeatured = reward.badgeType === 'featured' || reward.isFeatured
          const isMinPackage = reward.badgeType === 'minimum_package'
          return (
            <div
              key={reward.id}
              className={`
                relative overflow-hidden rounded-2xl p-8 transition-all duration-300 group
                ${isAvailable(reward)
                  ? isFeatured
                    ? "bg-gradient-to-b from-white to-emerald-50/30 border-2 border-emerald-500 shadow-xl scale-[1.02] z-10"
                    : isMinPackage
                      ? "bg-gradient-to-b from-white to-cyan-50/30 border-2 border-cyan-500 shadow-xl scale-[1.02] z-10"
                      : "bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  : "bg-slate-50 border-slate-200 opacity-90 cursor-not-allowed grayscale-[0.8]"} 
              `}
            >
              {/* SOLD OUT OVERLAY BADGE */}
              {!isAvailable(reward) && (
                <div className="absolute top-4 right-4 z-20 rotate-12">
                  <div className="border-2 border-red-500 text-red-500 font-black text-xl px-4 py-1 rounded-md tracking-widest uppercase opacity-80">
                    Sold Out
                  </div>
                </div>
              )}

              {/* Badge */}
              {isFeatured && isAvailable(reward) && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                  MOST POPULAR
                </div>
              )}
              {isMinPackage && isAvailable(reward) && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                  MINIMUM PACKAGE
                </div>
              )}

              {/* Add a colored accent bar at the top */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 ${isAvailable(reward) ? (isFeatured ? "bg-emerald-500" : isMinPackage ? "bg-cyan-500" : "bg-primary") : "bg-gray-300"}`} />

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-2">
                <div>
                  <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                    {reward.title}
                    {isFeatured && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">Best Value</span>}
                    {isMinPackage && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-200">Minimum Package</span>}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-emerald-600">${reward.price}</span>
                    {reward.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${reward.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  disabled={!isAvailable(reward)}
                  onClick={() => selectReward(reward.id)}
                  className={`${isAvailable(reward) ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""} ${isFeatured ? "shadow-lg shadow-emerald-200" : ""} ${isMinPackage ? "shadow-lg shadow-cyan-200" : ""}`}
                >
                  {isAvailable(reward) ? "Select Reward" : "Sold Out"}
                </Button>
              </div>

              {reward.imageUrl && (
                <div className="mb-6 rounded-xl overflow-hidden aspect-video relative bg-slate-100 border border-slate-100">
                  <img src={reward.imageUrl} alt={reward.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Description */}
              <p className="text-muted-foreground mb-6 whitespace-pre-line">{reward.description}</p>

              {/* Includes */}
              <div className="space-y-2 mb-6">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Includes:</p>
                <ul className="text-sm space-y-1">
                  {reward.itemsIncluded.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Stats */}
              <div className="flex gap-6 text-xs text-muted-foreground border-t border-border pt-4">
                <div>
                  <span className="font-semibold text-foreground block">{reward.backersCount}</span>
                  reservations
                </div>
                <div>
                  <span className="font-semibold text-foreground block">{reward.estimatedDelivery}</span>
                  estimated delivery
                </div>
                <div>
                  <span className="font-semibold text-foreground block">
                    {reward.shipsTo.length > 1 ? "Worldwide" : reward.shipsTo[0]}
                  </span>
                  ships to
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
