import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/admin/app-sidebar"
import { Toaster } from "@/components/ui/toaster"

import { CampaignProvider } from "@/context/campaign-context"
import { getCampaignData } from "@/lib/campaign"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    // 1. Fetch the data server-side for the admin panel
    // Since this is the admin view, we default to your main campaign slug
    const campaignData = await getCampaignData('dreamplay-one')

    return (
        // 2. Wrap the admin section in the Provider with the fetched data
        <CampaignProvider initialData={campaignData}>
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-muted/20">
                    <AppSidebar />
                    <main className="flex-1 overflow-y-auto">
                        {/* Mobile Trigger & Header */}
                        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 lg:h-[60px]">
                            <SidebarTrigger />
                            <div className="flex-1">
                                {/* Add Breadcrumbs here later if needed */}
                            </div>
                            <div id="admin-header-actions" className="flex items-center gap-4" />
                        </header>

                        {/* Main Content Area */}
                        <div className="p-6 md:p-10 max-w-5xl mx-auto">
                            {children}
                        </div>
                    </main>
                    <Toaster />
                </div>
            </SidebarProvider>
        </CampaignProvider>
    )
}
