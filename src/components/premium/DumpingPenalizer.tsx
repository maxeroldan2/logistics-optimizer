import React, { useState } from 'react';
import { AlertTriangle, Settings, BarChart3, TrendingDown } from 'lucide-react';
import { 
  DumpingSettings, 
  DumpingCalculation, 
  DumpingModel 
} from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useSubscription } from '../../hooks/useSubscription';
import { getDumpingExplanation } from '../../utils/dumpingCalculations';
import { formatCurrency, formatPercentage } from '../../utils/calculations';

interface DumpingPenalizerProps {
  settings: DumpingSettings;
  onSettingsChange: (settings: DumpingSettings) => void;
  dumpingCalculations?: DumpingCalculation[];
}

export const DumpingPenalizer: React.FC<DumpingPenalizerProps> = ({
  settings,
  onSettingsChange,
  dumpingCalculations = []
}) => {
  const { featureLimits } = useAppContext();
  const { showUpgradePrompt } = useSubscription();
  const [showSettings, setShowSettings] = useState(false);

  const handleToggle = () => {
    if (!featureLimits.hasDumpingPenalizer) {
      showUpgradePrompt('advanced-analytics');
      return;
    }
    
    onSettingsChange({
      ...settings,
      enabled: !settings.enabled
    });
  };

  const handleSettingChange = <K extends keyof DumpingSettings>(
    key: K,
    value: DumpingSettings[K]
  ) => {
    if (!featureLimits.hasDumpingPenalizer) {
      showUpgradePrompt('advanced-analytics');
      return;
    }
    
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const totalPenalty = dumpingCalculations.reduce(
    (sum, calc) => sum + calc.totalPenalty, 0
  ) / Math.max(dumpingCalculations.length, 1);

  const totalAdjustedLoss = dumpingCalculations.reduce(
    (sum, calc) => sum + ((calc.adjustedPrice - (calc.adjustedPrice / (1 - calc.totalPenalty))) * -1), 0
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TrendingDown className={`w-5 h-5 mr-2 ${settings.enabled ? 'text-orange-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-semibold text-gray-900">Dumping Penalizer</h3>
          {!featureLimits.hasDumpingPenalizer && (
            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              Premium
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="Dumping Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4">
        Simulates market saturation and competition effects on pricing. Higher quantities 
        and competition reduce effective selling prices through dumping penalties.
      </p>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dumping Model
              </label>
              <select
                value={settings.model}
                onChange={(e) => handleSettingChange('model', e.target.value as DumpingModel)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="linear">Linear</option>
                <option value="logarithmic">Logarithmic (Recommended)</option>
                <option value="exponential">Exponential</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saturation Multiplier: {settings.saturationMultiplier.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.saturationMultiplier}
                onChange={(e) => handleSettingChange('saturationMultiplier', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Competition Weight: {settings.competitionWeight.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.1"
                value={settings.competitionWeight}
                onChange={(e) => handleSettingChange('competitionWeight', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Decay Factor: {settings.timeDecayFactor.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={settings.timeDecayFactor}
                onChange={(e) => handleSettingChange('timeDecayFactor', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="crossShipmentPenalty"
              checked={settings.crossShipmentPenalty}
              onChange={(e) => handleSettingChange('crossShipmentPenalty', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="crossShipmentPenalty" className="ml-2 text-sm text-gray-700">
              Apply cross-shipment penalties for concurrent deliveries
            </label>
          </div>
        </div>
      )}

      {/* Results Display */}
      {settings.enabled && dumpingCalculations.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Avg. Penalty</p>
                  <p className="text-lg font-bold text-orange-900">
                    {formatPercentage(totalPenalty)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">Revenue Loss</p>
                  <p className="text-lg font-bold text-red-900">
                    {formatCurrency(totalAdjustedLoss)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Affected Products</p>
                  <p className="text-lg font-bold text-blue-900">
                    {dumpingCalculations.filter(calc => calc.totalPenalty > 0.01).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Breakdown */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Product Impact</h4>
            {dumpingCalculations
              .filter(calc => calc.totalPenalty > 0.01)
              .slice(0, 5) // Show top 5 affected products
              .map((calc, index) => (
                <div key={calc.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Product {index + 1}</p>
                    <p className="text-xs text-gray-600">
                      {getDumpingExplanation(calc)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      -{formatPercentage(calc.totalPenalty)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(calc.adjustedPrice)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Disabled State */}
      {!settings.enabled && (
        <div className="text-center py-8 text-gray-500">
          <TrendingDown className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">Enable dumping penalizer to see market saturation effects</p>
        </div>
      )}
    </div>
  );
};