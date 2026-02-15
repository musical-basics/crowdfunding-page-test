"use client"

interface NavigationTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function NavigationTabs({ activeTab, onTabChange }: NavigationTabsProps) {

  // We removed "Campaign" from here because the Logo will serve as the "Home/Campaign" link
  const navLinks = [
    { id: "rewards", label: "Rewards" },
    { id: "faq", label: "FAQ" },
    { id: "community", label: "Community" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-t border-white/10 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">

        {/* Desktop Links - Centered */}
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-2">
          <button
            onClick={() => onTabChange("campaign")}
            className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${activeTab === "campaign" ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
          >
            Overview
          </button>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap ${activeTab === link.id ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
                }`}
            >
              {link.label}
            </button>
          ))}
        </div>

      </div>
    </nav>
  )
}
