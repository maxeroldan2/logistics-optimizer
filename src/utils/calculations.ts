// Utility functions for calculations

import { Container, Product, ProductScore, ShipmentScore, ContainerScore } from '../types';

export const calculateProductVolume = (product: Product): number => {
  const { height, width, length, isBoxed } = product;
  const rawVolume = height * width * length;
  return isBoxed ? rawVolume : rawVolume * 1.2;
};

export const calculateProductProfit = (product: Product): number => {
  const { purchasePrice, resalePrice, quantity } = product;
  return (resalePrice - purchasePrice) * quantity;
};

export const calculateProductScore = (product: Product): ProductScore => {
  const volume = calculateProductVolume(product) * product.quantity;
  const totalProfit = calculateProductProfit(product);
  const rawScore = totalProfit / volume;
  const efficiencyScore = rawScore / product.daysToSell;
  
  return {
    volume,
    totalProfit,
    rawScore,
    efficiencyScore
  };
};

export const calculateTotalProductsVolume = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + calculateProductVolume(product) * product.quantity;
  }, 0);
};

export const calculateTotalProductsWeight = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + product.weight * product.quantity;
  }, 0);
};

export const calculateContainerVolume = (container: Container): number => {
  return container.height * container.width * container.length;
};

export const calculateContainerScore = (
  products: Product[],
  container: Container
): ContainerScore => {
  const score = calculateShipmentScore([products], [container]);
  return {
    ...score,
    containerId: container.id
  };
};

export const calculateShipmentScore = (
  products: Product[], 
  containers: Container[]
): ShipmentScore => {
  const totalProductsVolume = calculateTotalProductsVolume(products);
  const totalProductsWeight = calculateTotalProductsWeight(products);
  const totalContainerVolume = containers.reduce((total, container) => 
    total + calculateContainerVolume(container), 0
  );
  const totalMaxWeight = containers.reduce((total, container) => 
    total + container.maxWeight, 0
  );
  
  const totalPurchaseCost = products.reduce((total, product) => {
    return total + (product.purchasePrice * product.quantity);
  }, 0);
  
  const totalResale = products.reduce((total, product) => {
    return total + (product.resalePrice * product.quantity);
  }, 0);
  
  const totalShippingCost = containers.reduce((total, container) => 
    total + container.shippingCost, 0
  );
  
  const totalCost = totalPurchaseCost + totalShippingCost;
  const totalProfit = totalResale - totalCost;
  
  const volumeUtilization = Math.min(totalProductsVolume / totalContainerVolume, 1);
  const weightUtilization = Math.min(totalProductsWeight / totalMaxWeight, 1);
  
  const rawScore = totalProfit / totalProductsVolume;
  
  const weightedDaysToSell = products.reduce((total, product) => {
    const productVolume = calculateProductVolume(product) * product.quantity;
    return total + (product.daysToSell * (productVolume / totalProductsVolume));
  }, 0);
  
  const efficiencyScore = rawScore / (weightedDaysToSell || 1);
  const profitMargin = totalProfit / totalCost;
  
  return {
    totalCost,
    totalResale,
    profitMargin,
    rawScore,
    efficiencyScore,
    volumeUtilization,
    weightUtilization
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value);
};