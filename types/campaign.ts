export interface Creator {
    id: string;
    name: string;
    avatarUrl: string;
    bio: string;
    location: string;
    projectsCreated: number;
    projectsBacked: number;
    pageContent?: string; // HTML content for Creator page
}

export interface MediaItem {
    id: string;
    type: 'image' | 'video';
    src: string;
    thumbnail?: string;
}

export interface Reward {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    description: string;
    itemsIncluded: string[]; // e.g. ["Keyboard", "Cable"]
    estimatedDelivery: string;
    shipsTo: string[];
    backersCount: number;
    limitedQuantity?: number; // If null, unlimited
    timeLeft?: string; // For scarcity logic
    isSoldOut: boolean;
    imageUrl?: string;
    isFeatured?: boolean;
    badgeType?: 'none' | 'featured' | 'minimum_package';
    checkoutUrl?: string; // External checkout URL
    shopifyVariantId?: string; // Shopify Variant ID or JSON map
    rewardType?: 'bundle' | 'keyboard_only';
    isVisible: boolean;
    sortOrder?: number;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}

export interface FAQPageContent {
    needHelpHtml: string;
    quickLinksHtml: string;
    sidebarImageUrl: string;
}

export interface CampaignStats {
    totalPledged: number;
    goalAmount: number;
    totalBackers: number;
    daysLeft: number;
    lovesCount: number;
    totalSupply: number;
}

export interface KeyFeature {
    icon: string;
    title: string;
    desc: string;
}

export interface TechSpec {
    label: string;
    value: string;
}

export interface Campaign {
    id: string;
    title: string;
    subtitle: string;
    story: string; // HTML or Markdown content
    risks: string; // HTML or Markdown content
    shipping: string; // HTML content for shipping info
    technicalDetails: string; // HTML content for technical details
    manufacturerDetails: string; // HTML content for manufacturer info
    images: {
        hero: string;
        gallery: string[];
    };
    mediaGallery?: MediaItem[];
    stats: CampaignStats;
    creator: Creator;
    rewards: Reward[];
    faqs: FAQItem[];
    faqPageContent?: FAQPageContent;
    keyFeatures: KeyFeature[];
    techSpecs: TechSpec[];
    showAnnouncement?: boolean;
    showReservedAmount?: boolean;
    showSoldOutPercent?: boolean;
    hiddenSections?: string[];
}
