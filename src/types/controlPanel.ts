export interface MediaItem {
  id: string;
  type: "image" | "video";
  title: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  placement: "hero_banner" | "promo_video" | "gallery_food" | "gallery_saung" | "testimonial";
  isActive: boolean;
  createdAt: string;
}

export interface WebsiteConfig {
  appName: string;
  appTagline: string;
  heroHeadline: string;
  heroHighlightText: string;
  heroDescription: string;
  heroBadgeText: string;
  topAnnouncementText: string;
  isAnnouncementActive: boolean;
  promoVideoUrl: string;
  promoVideoTitle: string;
  isPromoVideoEnabled: boolean;
  heroBannerImageUrl: string;
  contactWhatsapp: string;
  contactEmail: string;
  restaurantAddress: string;
  footerCopyright: string;
  pricingStarterMonthly: number;
  pricingProMonthly: number;
  pricingEnterpriseMonthly: number;
  featuredMedia: MediaItem[];
  customMetaTitle: string;
  customMetaDescription: string;
  updatedAt: string;
}

export interface DeveloperClientAccount {
  id: string;
  clientName: string;
  businessName: string;
  email: string;
  phone: string;
  passwordPin: string;
  tier: "BASIC" | "PRO" | "ENTERPRISE";
  licenseKey: string;
  isActive: boolean;
  maxOutlets: number;
  maxSaung: number;
  expiryDate: string;
  createdAt: string;
  lastLoginAt?: string;
  notes?: string;
  customFeatures: string[];
}

export interface DeveloperApiConfig {
  masterGeminiApiKey: string;
  fallbackGeminiApiKey: string;
  defaultAiModel: "gemini-3.7-flash" | "gemini-3.6-flash" | "gemini-3.1-flash-lite" | "gemini-3.1-pro-preview";
  aiTemperature: number;
  enableUserCustomApiKey: boolean;
  systemPromptModifier: string;
  updatedAt: string;
}

export interface BroadcastNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "promo" | "maintenance";
  targetTiers: ("BASIC" | "PRO" | "ENTERPRISE" | "ALL")[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface ControlPanelStore {
  websiteConfig: WebsiteConfig;
  clients: DeveloperClientAccount[];
  apiConfig: DeveloperApiConfig;
  broadcasts: BroadcastNotification[];
  developerMasterPin: string;
  serverVersion: string;
}
