'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useCampaign } from '@/context/campaign-context'
import { FAQItem } from '@/types/campaign'

// Category order for display
const CATEGORY_ORDER = ["About Purchase", "About Support", "About The Product"]

export function FAQPage() {
  const { campaign } = useCampaign()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!campaign) return <div>Loading...</div>

  const faqItems = campaign.faqs || []
  const sidebarContent = campaign.faqPageContent

  // Group FAQs by category in display order
  const groupedFaqs = CATEGORY_ORDER.reduce((acc, category) => {
    const items = faqItems.filter(item => item.category === category)
    if (items.length > 0) {
      acc.push({ category, items })
    }
    return acc
  }, [] as { category: string; items: FAQItem[] }[])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main FAQ Content */}
      <div className="lg:col-span-2 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Find answers to common questions about DreamPlay and your order.</p>
        </div>

        {/* FAQ Accordion by Category */}
        {groupedFaqs.map(({ category, items }) => (
          <div key={category} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-3">{category}</h2>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="border border-border rounded-lg overflow-hidden hover:border-foreground/40 transition-colors">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left group"
                  >
                    <span className="text-base font-medium pr-4 flex-1 group-hover:text-foreground transition-colors">{item.question}</span>
                    <ChevronRight
                      className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expandedId === item.id ? 'rotate-90' : ''
                        }`}
                    />
                  </button>

                  {expandedId === item.id && (
                    <div className="border-t border-border bg-muted/20 p-4 animate-in fade-in duration-200">
                      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {groupedFaqs.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No FAQs available yet.</p>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 space-y-6">
        {/* Question Form Block - Removed */}

        {/* Need Help Block */}
        <div className="p-6 bg-muted/30 rounded-lg border border-border">
          {sidebarContent?.needHelpHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sidebarContent.needHelpHtml }} />
          ) : (
            <>
              <h4 className="text-lg font-semibold mb-4">Need Help?</h4>
              <p className="text-muted-foreground text-sm">Editable sidebar content. Add support contact info or additional resources here.</p>
            </>
          )}
        </div>

        {/* Quick Links Block */}
        <div className="p-6 bg-muted/30 rounded-lg border border-border">
          {sidebarContent?.quickLinksHtml ? (
            <div dangerouslySetInnerHTML={{ __html: sidebarContent.quickLinksHtml }} />
          ) : (
            <>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <p className="text-muted-foreground text-sm">Editable sidebar content. Link to shipping info, warranty details, or product specs.</p>
            </>
          )}
        </div>

        {/* Sidebar Image */}
        {sidebarContent?.sidebarImageUrl ? (
          <div className="aspect-video rounded-lg overflow-hidden border border-border">
            <img
              src={sidebarContent.sidebarImageUrl}
              alt="FAQ sidebar"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-video bg-muted/50 rounded-lg border border-dashed border-border flex items-center justify-center">
            <p className="text-muted-foreground text-sm">Image Placeholder</p>
          </div>
        )}
      </div>
    </div>
  )
}
