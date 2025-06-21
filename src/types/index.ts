// Core types for the application

export type Measurement = 'metric' | 'imperial';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BRL' | 'ARS';
export type Language = 'en' | 'es' | 'pt';

export interface GlobalConfig {
  measurement: Measurement;
  currency: Currency;
  language: Language;
  showTooltips: boolean;
}

export interface Product {
  id: string;
  name: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  purchasePrice: number;
  resalePrice: number;
  daysToSell: number;
  quantity: number;
  tag?: string;
  isBoxed: boolean;
  containerId?: string; // New field to track which container the product is in
  icon?: string; // New field for product icon
  // Dumping parameters
  saturationThreshold?: number; // Market saturation point for dumping calculation
  competitorCount?: number; // Number of competitors selling same product
  marketDemand?: number; // Market demand multiplier (0-1)
}

export interface SavedProduct {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  purchase_price: number;
  resale_price: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  quantity: number;
  days_to_sell: number;
  icon: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedContainer {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  height: number;
  width: number;
  length: number;
  weight_limit: number; // Database uses weight_limit, not max_weight
  max_weight?: number; // Keep for backward compatibility
  shipping_cost?: number; // Optional since it might not exist in older schema
  shipping_duration?: number; // Optional since it might not exist in older schema
  icon: string;
  tags?: string[];
  created_at: string;
  updated_at?: string; // Optional since it might not exist in older schema
}

export interface Container {
  id: string;
  name: string;
  height: number;
  width: number;
  length: number;
  maxWeight: number;
  tag?: string;
  shippingDuration?: number;
  shippingCost: number;
  products: string[]; // Array of product IDs assigned to this container
  icon?: string; // New field for container icon
}

export interface Shipment {
  id: string;
  name: string;
  description?: string; // Optional description field
  products: Product[];
  containers: Container[]; // Changed from single container to array
  createdAt: Date;
  isPremium: boolean;
  folderId?: string; // New field for folder organization
  shippingDate?: string; // Optional shipping date
  // Dumping penalizer settings
  dumpingSettings?: DumpingSettings;
  // Scheduling information for cross-shipment dumping
  departureDate?: Date;
  frequency?: ShipmentFrequency;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ProductScore {
  volume: number;
  totalProfit: number;
  rawScore: number;  // profit / volume
  efficiencyScore: number; // rawScore / daysToSell
  // Dumping-adjusted values
  adjustedProfit?: number; // Profit after dumping penalty
  adjustedScore?: number; // Score after dumping penalty
  dumpingPenalty?: number; // Total dumping penalty (0-1)
}

export interface ContainerScore extends ShipmentScore {
  containerId: string;
}

export interface ShipmentScore {
  totalCost: number;
  totalResale: number;
  profitMargin: number;
  rawScore: number;
  efficiencyScore: number;
  volumeUtilization: number;
  weightUtilization: number;
}

export interface ContainerTemplate {
  id: string;
  name: string;
  category: 'maritime' | 'international' | 'personal' | 'air' | 'logistics';
  height: number;
  width: number;
  length: number;
  maxWeight: number;
  defaultShippingCost?: number;
  defaultShippingDuration?: number;
  icon?: string;
}

// Subscription and Premium Features
export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due';

export interface UserSubscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripePriceId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FeatureLimits {
  maxShipments: number;
  maxProductsPerShipment: number;
  maxContainersPerShipment: number;
  canSaveShipments: boolean;
  canCompareShipments: boolean;
  canExportData: boolean;
  hasAdvancedAnalytics: boolean;
  hasMarketAnalysis: boolean;
  hasDumpingPenalizer: boolean;
  hasAiDimensions: boolean;
  hasApiIntegrations: boolean;
}

export const FREE_LIMITS: FeatureLimits = {
  maxShipments: 1,
  maxProductsPerShipment: 10,
  maxContainersPerShipment: 3,
  canSaveShipments: false,
  canCompareShipments: false,
  canExportData: false,
  hasAdvancedAnalytics: false,
  hasMarketAnalysis: false,
  hasDumpingPenalizer: false,
  hasAiDimensions: false,
  hasApiIntegrations: false,
};

export const PREMIUM_LIMITS: FeatureLimits = {
  maxShipments: -1, // unlimited
  maxProductsPerShipment: -1, // unlimited
  maxContainersPerShipment: -1, // unlimited
  canSaveShipments: true,
  canCompareShipments: true,
  canExportData: true,
  hasAdvancedAnalytics: true,
  hasMarketAnalysis: true,
  hasDumpingPenalizer: true,
  hasAiDimensions: true,
  hasApiIntegrations: true,
};

// Dumping Penalizer Types
export type DumpingModel = 'linear' | 'logarithmic' | 'exponential' | 'custom';
export type ShipmentFrequency = 'unique' | 'weekly' | 'biweekly' | 'monthly';

export interface DumpingSettings {
  enabled: boolean;
  model: DumpingModel;
  saturationMultiplier: number; // Base saturation penalty multiplier
  competitionWeight: number; // How much competition affects dumping (0-1)
  timeDecayFactor: number; // How quickly dumping effects decay over time (0-1)
  crossShipmentPenalty: boolean; // Apply penalties from concurrent shipments
  customFormula?: string; // For custom dumping models
}

export interface DumpingCalculation {
  productId: string;
  baseSaturation: number; // Product-specific saturation level
  competitionPenalty: number; // Penalty from competitor count
  crossShipmentPenalty: number; // Penalty from concurrent shipments
  timeDecay: number; // Time-based decay factor
  totalPenalty: number; // Final dumping penalty (0-1)
  adjustedPrice: number; // Price after dumping penalty
  adjustedProfit: number; // Profit after dumping penalty
}

export const DEFAULT_DUMPING_SETTINGS: DumpingSettings = {
  enabled: false,
  model: 'logarithmic',
  saturationMultiplier: 0.8,
  competitionWeight: 0.6,
  timeDecayFactor: 0.1,
  crossShipmentPenalty: true,
};