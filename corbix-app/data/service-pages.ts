export type ServicePageConfig = {
  slug: string;
  headline: string;
  subheadline: string;
  serviceOptions: string[];
  submitLabel: string;
  layout: "split" | "stacked";
  slides: Array<{
    title: string;
    description: string;
  }>;
};

export const servicePages: Record<string, ServicePageConfig> = {
  "digital-marketing": {
    slug: "digital-marketing",
    headline: "Performance Marketing Built for Measurable Growth.",
    subheadline:
      "We combine storytelling, demand generation, and analytics to turn market attention into qualified business outcomes.",
    serviceOptions: [
      "Brand Positioning",
      "Performance Campaigns",
      "Social Media Strategy",
      "Full-Funnel Growth",
    ],
    submitLabel: "Launch Your Campaign",
    layout: "stacked",
    slides: [
      {
        title: "Narrative Architecture",
        description:
          "Develop a clear brand message system that aligns sales, media, and executive communication.",
      },
      {
        title: "Paid Media Precision",
        description:
          "Deploy paid acquisition with channel-level accountability and weekly optimization cycles.",
      },
      {
        title: "Conversion Operations",
        description:
          "Design landing and follow-up flows that improve lead quality and reduce friction.",
      },
      {
        title: "Executive Reporting",
        description:
          "Turn campaign performance into decision-ready dashboards for leadership.",
      },
    ],
  },
  "commercial-brokerage": {
    slug: "commercial-brokerage",
    headline: "Strategic Commercial Spaces for Scaling Businesses.",
    subheadline:
      "From premium corporate headquarters to high-capacity industrial warehousing, Corbrix secures locations aligned to your operating model.",
    serviceOptions: [
      "Premium Office Leasing",
      "Industrial & Warehousing",
      "Retail Space Acquisition",
      "Commercial Investment Sales",
    ],
    submitLabel: "Secure Your Space",
    layout: "split",
    slides: [
      {
        title: "Office Headquarters",
        description:
          "Identify and negotiate strategic office assets that support growth and brand presence.",
      },
      {
        title: "Industrial Footprint",
        description:
          "Acquire warehousing and logistics facilities optimized for throughput and compliance.",
      },
      {
        title: "Retail Placement",
        description:
          "Position retail units in high-conversion zones with sustainable lease economics.",
      },
      {
        title: "Investment Brokerage",
        description:
          "Source and structure commercial transactions for institutional-grade returns.",
      },
    ],
  },
  "general-trading": {
    slug: "general-trading",
    headline: "Global Trading Networks, Executed with Precision.",
    subheadline:
      "Corbrix orchestrates sourcing, procurement, and cross-border execution with risk-managed operating controls.",
    serviceOptions: [
      "Supplier Discovery",
      "Procurement Structuring",
      "Import/Export Coordination",
      "Trade Compliance Support",
    ],
    submitLabel: "Build Your Supply Chain",
    layout: "split",
    slides: [
      {
        title: "Supplier Intelligence",
        description:
          "Evaluate and onboard reliable suppliers across strategic categories and geographies.",
      },
      {
        title: "Commercial Structuring",
        description:
          "Optimize trade terms, payment structures, and risk allocation for scale.",
      },
      {
        title: "Logistics Planning",
        description:
          "Coordinate shipping partners, warehousing, and customs timelines for continuity.",
      },
      {
        title: "Compliance Assurance",
        description:
          "Reduce regulatory exposure through proactive policy and documentation oversight.",
      },
    ],
  },
  "strategic-advisory": {
    slug: "strategic-advisory",
    headline: "Market Intelligence for High-Confidence Decisions.",
    subheadline:
      "We provide executive-grade insight on market entry, positioning, and growth strategy so leaders can act with clarity.",
    serviceOptions: [
      "Market Entry Strategy",
      "Competitive Intelligence",
      "Operational Optimization",
      "Executive Advisory",
    ],
    submitLabel: "Request Strategic Guidance",
    layout: "split",
    slides: [
      {
        title: "Market Mapping",
        description:
          "Assess demand signals, regulatory posture, and buyer behavior before committing capital.",
      },
      {
        title: "Positioning Strategy",
        description:
          "Translate market opportunities into differentiated service and offer design.",
      },
      {
        title: "Growth Diagnostics",
        description:
          "Identify bottlenecks across go-to-market, operations, and customer lifecycle.",
      },
      {
        title: "Decision Support",
        description:
          "Deliver executive briefs that convert complexity into clear strategic actions.",
      },
    ],
  },
  "copywriting-brand-protection": {
    slug: "copywriting-brand-protection",
    headline: "Global Copywriting and Brand Protection in One Stream.",
    subheadline:
      "Corbrix aligns message localization, reputation integrity, and trademark protection across growth markets.",
    serviceOptions: [
      "Localized Brand Copy",
      "Trademark Registration",
      "Brand Monitoring",
      "IP Risk Advisory",
    ],
    submitLabel: "Protect Your Brand",
    layout: "split",
    slides: [
      {
        title: "Message Localization",
        description:
          "Adapt campaign and product messaging for regional relevance without losing brand identity.",
      },
      {
        title: "Trademark Filings",
        description:
          "Coordinate multi-jurisdiction trademark registrations with procedural rigor.",
      },
      {
        title: "Brand Monitoring",
        description:
          "Track copy misuse and infringing activity to protect market credibility.",
      },
      {
        title: "Response Strategy",
        description:
          "Design escalation pathways for infringement, disputes, and reputational threats.",
      },
    ],
  },
  "global-mobility": {
    slug: "global-mobility",
    headline: "Your Global Plan B, Structured with Confidence.",
    subheadline:
      "From residency to citizenship pathways, Corbrix guides founders, families, and investors through strategic mobility decisions.",
    serviceOptions: [
      "Citizenship by Investment",
      "Residence by Investment",
      "Family Relocation Planning",
      "Program Comparison Advisory",
    ],
    submitLabel: "Explore Global Mobility",
    layout: "split",
    slides: [
      {
        title: "Program Selection",
        description:
          "Match your priorities to the right jurisdiction, timeline, and capital profile.",
      },
      {
        title: "File Preparation",
        description:
          "Coordinate documentation and due diligence to avoid preventable delays.",
      },
      {
        title: "Submission Management",
        description:
          "Handle process orchestration and advisor communication end-to-end.",
      },
      {
        title: "Post-Approval Support",
        description:
          "Support relocation, compliance, and long-term program obligations.",
      },
    ],
  },
};
