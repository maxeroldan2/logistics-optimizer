import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Package, Target } from 'lucide-react';
import { Shipment, GlobalConfig } from '../../types';
import { calculateShipmentScore, formatCurrency, formatPercentage } from '../../utils/calculations';

interface MetricsDashboardProps {
  currentShipment: Shipment;
  config: GlobalConfig;
  dumpingPenalizerEnabled: boolean;
}

const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  currentShipment,
  config,
  dumpingPenalizerEnabled
}) => {
  const shipmentScore = calculateShipmentScore(currentShipment.products, currentShipment.containers);
  
  // Calculate metrics
  const totalProfit = currentShipment.products.reduce((sum, product) => 
    sum + ((product.resalePrice - product.purchasePrice) * product.quantity), 0
  );
  
  const averageTurnover = currentShipment.products.length > 0 
    ? currentShipment.products.reduce((sum, product) => sum + product.daysToSell, 0) / currentShipment.products.length
    : 0;

  // Apply dumping penalizer if enabled
  const adjustedScore = dumpingPenalizerEnabled 
    ? shipmentScore.rawScore * 0.85 // 15% penalty for market saturation
    : shipmentScore.rawScore;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="grid grid-cols-4 gap-6">
        <div>
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-600">Score</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900">{adjustedScore.toFixed(1)}</span>
            <span className="ml-2 text-sm text-green-600">↑ 12% higher than average</span>
            {dumpingPenalizerEnabled && (
              <div className="text-xs text-orange-600 mt-1">
                Market saturation penalty applied
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-gray-600">Profit Margin</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900">{formatPercentage(shipmentScore.profitMargin)}</span>
            <span className="ml-2 text-sm text-green-600">↑ {formatCurrency(totalProfit, config.currency)} estimated profit</span>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm text-gray-600">Efficiency Score</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900">{shipmentScore.efficiencyScore.toFixed(1)}</span>
            <span className="ml-2 text-sm text-blue-600">Based on {averageTurnover.toFixed(0)} days turnover</span>
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <Package className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-sm text-gray-600">Space Utilized</span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-gray-900">{formatPercentage(shipmentScore.volumeUtilization)}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ width: `${shipmentScore.volumeUtilization * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;