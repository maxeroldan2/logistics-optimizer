// Template data for containers and products

import { ContainerTemplate } from '../types';

// Maritime containers
export const maritimeContainers: ContainerTemplate[] = [
  {
    id: 'container-20ft',
    name: '20ft Container',
    category: 'maritime',
    height: 239, // cm
    width: 235, // cm
    length: 590, // cm
    maxWeight: 28080, // kg
    defaultShippingCost: 1500,
    defaultShippingDuration: 45
  },
  {
    id: 'container-40ft',
    name: '40ft Container',
    category: 'maritime',
    height: 239, // cm
    width: 235, // cm
    length: 1203, // cm
    maxWeight: 28800, // kg
    defaultShippingCost: 2500,
    defaultShippingDuration: 45
  },
  {
    id: 'container-40ft-hc',
    name: '40ft High Cube',
    category: 'maritime',
    height: 269, // cm
    width: 235, // cm
    length: 1203, // cm
    maxWeight: 28560, // kg
    defaultShippingCost: 3000,
    defaultShippingDuration: 45
  }
];

// International shipping boxes
export const internationalBoxes: ContainerTemplate[] = [
  {
    id: 'box-corrugated-a6',
    name: 'Corrugated Box A6',
    category: 'international',
    height: 30, // cm
    width: 40, // cm
    length: 60, // cm
    maxWeight: 25, // kg
    defaultShippingCost: 50,
    defaultShippingDuration: 10
  },
  {
    id: 'box-usps',
    name: 'USPS Large Flat Rate Box',
    category: 'international',
    height: 30.48, // cm
    width: 30.48, // cm
    length: 12.7, // cm
    maxWeight: 9.07, // kg (20 lbs)
    defaultShippingCost: 21.50,
    defaultShippingDuration: 7
  },
  {
    id: 'box-amazon-fba',
    name: 'Amazon FBA Standard',
    category: 'international',
    height: 45, // cm
    width: 34, // cm
    length: 26, // cm
    maxWeight: 22.68, // kg (50 lbs)
    defaultShippingCost: 15,
    defaultShippingDuration: 5
  },
  {
    id: 'box-dhl',
    name: 'DHL Express Box',
    category: 'international',
    height: 33.7, // cm
    width: 32.2, // cm
    length: 5.2, // cm
    maxWeight: 2, // kg
    defaultShippingCost: 45,
    defaultShippingDuration: 3
  }
];

// Personal luggage
export const personalLuggage: ContainerTemplate[] = [
  {
    id: 'luggage-backpack',
    name: 'Backpack',
    category: 'personal',
    height: 45, // cm
    width: 30, // cm
    length: 20, // cm
    maxWeight: 10, // kg
    defaultShippingCost: 0,
    defaultShippingDuration: 1
  },
  {
    id: 'luggage-carry-on',
    name: 'Carry-on Luggage',
    category: 'personal',
    height: 55, // cm
    width: 40, // cm
    length: 23, // cm
    maxWeight: 10, // kg
    defaultShippingCost: 0,
    defaultShippingDuration: 1
  },
  {
    id: 'luggage-checked',
    name: 'Checked Luggage',
    category: 'personal',
    height: 75, // cm
    width: 50, // cm
    length: 30, // cm
    maxWeight: 23, // kg
    defaultShippingCost: 35,
    defaultShippingDuration: 1
  }
];

// Air shipping
export const airShipping: ContainerTemplate[] = [
  {
    id: 'air-dhl-express',
    name: 'DHL Express',
    category: 'air',
    height: 40, // cm
    width: 30, // cm
    length: 20, // cm
    maxWeight: 30, // kg
    defaultShippingCost: 120,
    defaultShippingDuration: 2
  },
  {
    id: 'air-fedex',
    name: 'FedEx International',
    category: 'air',
    height: 45, // cm
    width: 35, // cm
    length: 25, // cm
    maxWeight: 68, // kg
    defaultShippingCost: 150,
    defaultShippingDuration: 3
  },
  {
    id: 'air-iata',
    name: 'IATA Standard',
    category: 'air',
    height: 50, // cm
    width: 40, // cm
    length: 30, // cm
    maxWeight: 45, // kg
    defaultShippingCost: 200,
    defaultShippingDuration: 4
  }
];

// Export all templates
export const allContainerTemplates: ContainerTemplate[] = [
  ...maritimeContainers,
  ...internationalBoxes,
  ...personalLuggage,
  ...airShipping
];

// Helper to find a template by ID
export const getTemplateById = (id: string): ContainerTemplate | undefined => {
  return allContainerTemplates.find(template => template.id === id);
};