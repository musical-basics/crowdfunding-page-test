import { Campaign } from "@/types/campaign";

export const CAMPAIGN_DATA: Campaign = {
  id: "dreamplay-one",
  title: "DreamPlay One - Crowdfunding Campaign",
  subtitle: "Back the DreamPlay One keyboard with narrower keys designed for your handspan. Stop over-stretching.",
  story: `
    <h2 class="text-4xl font-bold">Story</h2>
    <p class="text-base leading-relaxed text-foreground">
      I’ve been a concert pianist for years, performing at Carnegie Hall, Lincoln Center,
      and venues around the world. But there’s something most people never saw: I was
      constantly fighting against the piano.
    </p>
    <p class="text-base leading-relaxed text-foreground">
      My hands span just under 8.5 inches. That meant many traditional pieces were
      difficult, sometimes impossible, for me to play comfortably. No matter how much I
      practiced, I felt like the instrument wasn’t built for me.
    </p>
    <p class="text-base leading-relaxed text-foreground">
      So I asked myself:
      “What if the piano could be designed to fit the pianist, instead of the other way
      around?”
    </p>
    <p class="text-base leading-relaxed text-foreground">
      That’s where DreamPlay was born.
    </p>
  `,
  risks: `
    <h3 class="text-2xl font-bold">Risks & Challenges</h3>
    <p class="text-base leading-relaxed text-foreground">
      Hardware is hard, but we have prepared for it. We are entering this campaign with a working prototype and a manufacturing partner selected. However, looking toward our August 2026 delivery, here are the primary variables:
    </p>

    <div class="space-y-4 mt-4">
      <div>
        <h4 class="text-lg font-semibold">1. The "Tooling" Phase (Months 1-3)</h4>
        <p class="text-base text-muted-foreground">
          The most time-consuming part of this process is creating the steel molds for the chassis and keys. This takes roughly 90 days. We cannot speed this up without risking quality.
        </p>
      </div>

      <div>
        <h4 class="text-lg font-semibold">2. Freight & Logistics</h4>
        <p class="text-base text-muted-foreground">
          Global shipping is volatile. While we aim to ship in August, ocean freight delays (port congestion, customs) can sometimes add 2-4 weeks to delivery times.
        </p>
      </div>

      <div>
        <h4 class="text-lg font-semibold">3. Our Promise</h4>
        <p class="text-base text-muted-foreground">
          We adhere to the <strong>"Update Rule"</strong>: You will receive a production update from me every single month, whether the news is good or bad. You will see photos of the molds, the first units off the line, and the boxes on the pallets.
        </p>
      </div>
    </div>
  `,
  images: {
    hero: "/images/hero-piano.png",
    gallery: [
      "/placeholder.jpg",
      "/placeholder.jpg"
    ]
  },
  stats: {
    totalPledged: 88808,
    goalAmount: 5000,
    totalBackers: 224,
    daysLeft: 28
  },
  creator: {
    id: "popumusic",
    name: "PopuMusic",
    avatarUrl: "/placeholder-user.jpg",
    bio: "Founded on April 1, 2015, PopuMusic is a dynamic team revolutionizing music interaction. Our mission is to make music accessible and engaging.",
    location: "Delaware City, DE",
    projectsCreated: 1,
    projectsBacked: 0
  },
  rewards: [
    {
      id: "vip-founder",
      title: "VIP Founder Access",
      price: 1,
      description: "Early updates + lowest price guarantee",
      itemsIncluded: ["VIP Access"],
      estimatedDelivery: "Immediate",
      shipsTo: ["Digital Reward"],
      backersCount: 127,
      isSoldOut: false
    },
    {
      id: "super-early-bird",
      title: "Super Early Bird",
      price: 199,
      originalPrice: 399,
      description: "DS5.5 or DS6.0 at the deepest discount",
      itemsIncluded: ["DreamPlay Keyboard"],
      estimatedDelivery: "Feb 2026",
      shipsTo: ["Anywhere in the world"],
      backersCount: 50,
      limitedQuantity: 50,
      isSoldOut: true
    },
    {
      id: "early-bird",
      title: "Early Bird",
      price: 249,
      originalPrice: 349,
      description: "DS5.5 or DS6.0 at a special price",
      itemsIncluded: ["DreamPlay Keyboard"],
      estimatedDelivery: "Feb 2026",
      shipsTo: ["Anywhere in the world"],
      backersCount: 34,
      limitedQuantity: 100,
      isSoldOut: false
    }
  ],
  faqs: [
    {
      id: "model-choice",
      category: "About Purchase",
      question: "Which DreamPlay model is right for me?",
      answer: "DreamPlay comes in two sizes: DS5.5..."
    },
    {
      id: "delivery-timeline",
      category: "About Purchase",
      question: "When will I receive my keyboard?",
      answer: "Here's the current timeline: Campaign ends..."
    }
  ],
  shipping: "<p>We ship worldwide! Estimated delivery: August 2026.</p><p><strong>Shipping is calculated at checkout based on weight and distance. International backers are responsible for local customs/VAT duties.</strong></p>",
  keyFeatures: [
    { icon: "🎹", title: "Narrower Keys", desc: "15/16th size for ergonomic reach." },
    { icon: "🔊", title: "Pro Sound Engine", desc: "Sampled from a 9ft Concert Grand." },
    { icon: "🔋", title: "Portable Power", desc: "Built-in battery for 8 hours of play." },
    { icon: "📱", title: "Bluetooth MIDI", desc: "Connect instantly to your tablet." }
  ],
  techSpecs: [
    { label: "Dimensions", value: "120cm x 30cm x 10cm" },
    { label: "Weight", value: "12kg (26 lbs)" },
    { label: "Connectivity", value: "USB-C, Bluetooth 5.0, MIDI" },
    { label: "Power", value: "Internal Battery (8hrs) or AC Adapter" }
  ],
  technicalDetails: "<p>Detailed technical specifications...</p>"
};
