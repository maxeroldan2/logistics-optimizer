import { 
  Product, 
  Shipment, 
  DumpingSettings, 
  DumpingCalculation, 
  DumpingModel,
  DEFAULT_DUMPING_SETTINGS 
} from '../types';

/**
 * Calculate dumping penalty for a product based on market saturation
 */
export function calculateDumpingPenalty(
  product: Product,
  settings: DumpingSettings,
  concurrentShipments: Shipment[] = []
): DumpingCalculation {
  const {
    saturationMultiplier,
    competitionWeight,
    timeDecayFactor,
    crossShipmentPenalty,
    model
  } = settings;

  // Base saturation calculation
  const baseSaturation = calculateBaseSaturation(product, model);
  
  // Competition penalty based on competitor count
  const competitionPenalty = calculateCompetitionPenalty(
    product.competitorCount || 0,
    competitionWeight
  );
  
  // Cross-shipment penalty from concurrent shipments
  const crossShipmentPenaltyValue = crossShipmentPenalty 
    ? calculateCrossShipmentPenalty(product, concurrentShipments)
    : 0;
  
  // Time decay factor (reduces penalty over time)
  const timeDecay = calculateTimeDecay(product.daysToSell, timeDecayFactor);
  
  // Combined total penalty
  const totalPenalty = Math.min(
    1,
    (baseSaturation * saturationMultiplier) + 
    competitionPenalty + 
    crossShipmentPenaltyValue - 
    timeDecay
  );
  
  // Apply penalty to pricing
  const adjustedPrice = product.resalePrice * (1 - totalPenalty);
  const adjustedProfit = adjustedPrice - product.purchasePrice;
  
  return {
    productId: product.id,
    baseSaturation,
    competitionPenalty,
    crossShipmentPenalty: crossShipmentPenaltyValue,
    timeDecay,
    totalPenalty: Math.max(0, totalPenalty),
    adjustedPrice,
    adjustedProfit
  };
}

/**
 * Calculate base market saturation using different mathematical models
 */
function calculateBaseSaturation(product: Product, model: DumpingModel): number {
  const threshold = product.saturationThreshold || 10; // Default threshold
  const quantity = product.quantity;
  
  switch (model) {
    case 'linear':
      return Math.min(1, quantity / threshold);
    
    case 'logarithmic':
      // Logarithmic model: more gradual saturation curve
      return Math.min(1, Math.log(1 + quantity) / Math.log(1 + threshold));
    
    case 'exponential':
      // Exponential model: rapid saturation after threshold
      return Math.min(1, Math.pow(quantity / threshold, 2));
    
    case 'custom':
      // Placeholder for custom formulas
      return Math.min(1, quantity / threshold);
    
    default:
      return Math.min(1, Math.log(1 + quantity) / Math.log(1 + threshold));
  }
}

/**
 * Calculate penalty based on number of competitors
 */
function calculateCompetitionPenalty(competitorCount: number, weight: number): number {
  if (competitorCount === 0) return 0;
  
  // Logarithmic competition penalty
  return weight * Math.log(1 + competitorCount) / Math.log(10); // Max ~1 at 9 competitors
}

/**
 * Calculate penalty from concurrent shipments with same products
 */
function calculateCrossShipmentPenalty(
  product: Product, 
  concurrentShipments: Shipment[]
): number {
  const similarProducts = concurrentShipments
    .flatMap(shipment => shipment.products)
    .filter(p => 
      p.id !== product.id && 
      (p.name.toLowerCase().includes(product.name.toLowerCase()) || 
       p.tag === product.tag)
    );
  
  const totalConcurrentQuantity = similarProducts
    .reduce((sum, p) => sum + p.quantity, 0);
  
  // Scale penalty based on concurrent quantity
  return Math.min(0.5, totalConcurrentQuantity * 0.01); // Max 50% penalty
}

/**
 * Calculate time decay factor - reduces dumping penalty over longer selling periods
 */
function calculateTimeDecay(daysToSell: number, decayFactor: number): number {
  // Longer selling periods reduce dumping impact
  return Math.min(0.3, daysToSell * decayFactor * 0.01); // Max 30% reduction
}

/**
 * Apply dumping calculations to all products in a shipment
 */
export function calculateShipmentDumping(
  shipment: Shipment,
  allShipments: Shipment[] = []
): DumpingCalculation[] {
  const settings = shipment.dumpingSettings || DEFAULT_DUMPING_SETTINGS;
  
  if (!settings.enabled) {
    // Return zero penalties if dumping is disabled
    return shipment.products.map(product => ({
      productId: product.id,
      baseSaturation: 0,
      competitionPenalty: 0,
      crossShipmentPenalty: 0,
      timeDecay: 0,
      totalPenalty: 0,
      adjustedPrice: product.resalePrice,
      adjustedProfit: product.resalePrice - product.purchasePrice
    }));
  }
  
  // Find concurrent shipments (within 30 days)
  const concurrentShipments = findConcurrentShipments(shipment, allShipments);
  
  return shipment.products.map(product => 
    calculateDumpingPenalty(product, settings, concurrentShipments)
  );
}

/**
 * Find shipments that are concurrent (overlapping in time)
 */
function findConcurrentShipments(
  currentShipment: Shipment,
  allShipments: Shipment[]
): Shipment[] {
  if (!currentShipment.departureDate) return [];
  
  const currentDate = currentShipment.departureDate;
  const concurrencyWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  
  return allShipments.filter(shipment => {
    if (shipment.id === currentShipment.id || !shipment.departureDate) {
      return false;
    }
    
    const timeDiff = Math.abs(currentDate.getTime() - shipment.departureDate.getTime());
    return timeDiff <= concurrencyWindow;
  });
}

/**
 * Calculate market demand impact on dumping
 */
export function calculateMarketDemandModifier(product: Product): number {
  const demand = product.marketDemand || 1;
  
  // Higher demand reduces dumping penalties
  return Math.max(0.1, 1 - (1 - demand) * 0.8); // Min 10% of original penalty
}

/**
 * Get dumping penalty explanation for UI
 */
export function getDumpingExplanation(calculation: DumpingCalculation): string {
  const { baseSaturation, competitionPenalty, crossShipmentPenalty, totalPenalty } = calculation;
  
  if (totalPenalty === 0) {
    return "No dumping penalty applied";
  }
  
  const factors = [];
  
  if (baseSaturation > 0.1) {
    factors.push(`Market saturation: ${(baseSaturation * 100).toFixed(1)}%`);
  }
  
  if (competitionPenalty > 0.05) {
    factors.push(`Competition penalty: ${(competitionPenalty * 100).toFixed(1)}%`);
  }
  
  if (crossShipmentPenalty > 0.05) {
    factors.push(`Concurrent shipments: ${(crossShipmentPenalty * 100).toFixed(1)}%`);
  }
  
  return `Total dumping penalty: ${(totalPenalty * 100).toFixed(1)}% (${factors.join(', ')})`;
}