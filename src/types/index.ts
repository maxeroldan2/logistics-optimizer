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
  products: Product[];
  containers: Container[]; // Changed from single container to array
  createdAt: Date;
  isPremium: boolean;
  folderId?: string; // New field for folder organization
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