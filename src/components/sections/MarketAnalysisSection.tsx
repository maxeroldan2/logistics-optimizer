import React from 'react';
import { BarChart3 } from 'lucide-react';

interface MarketAnalysisSectionProps {
  isEnabled: boolean;
  hasProducts: boolean;
}

const MarketAnalysisSection: React.FC<MarketAnalysisSectionProps> = ({
  isEnabled,
  hasProducts
}) => {
  if (!isEnabled || !hasProducts) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
          Market Analysis
        </h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">High</div>
            <div className="text-sm text-gray-600">Demand Level</div>
            <div className="text-xs text-gray-500 mt-1">Based on 40+ market presets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">Medium</div>
            <div className="text-sm text-gray-600">Competition</div>
            <div className="text-xs text-gray-500 mt-1">Moderate market saturation</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">Optimal</div>
            <div className="text-sm text-gray-600">Timing</div>
            <div className="text-xs text-gray-500 mt-1">Best season for these products</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalysisSection;