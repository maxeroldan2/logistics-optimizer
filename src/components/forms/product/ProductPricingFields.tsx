import React from 'react';
import { Product } from '../../../types';

interface ProductPricingFieldsProps {
  product: Omit<Product, 'id'>;
  onProductChange: (field: keyof Omit<Product, 'id'>, value: any) => void;
}

export const ProductPricingFields: React.FC<ProductPricingFieldsProps> = ({
  product,
  onProductChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onProductChange(name as keyof Omit<Product, 'id'>, e.target.type === 'number' ? Number(value) : value);
  };

  // Calculate profit per unit in real-time
  const calculateProfitPerUnit = () => {
    return product.resalePrice - product.purchasePrice;
  };

  return (
    <div className="space-y-4">
      {/* Financials Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Financials</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Price (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={product.purchasePrice || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g., 900.00"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resale Price (USD) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="resalePrice"
              value={product.resalePrice || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g., 1250.00"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
        </div>
        
        {/* Profit Display */}
        <div className="mt-4 bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-700 mb-1">Potential Profit / unit</div>
          <div className="text-2xl font-bold text-green-600">${calculateProfitPerUnit().toFixed(2)}</div>
        </div>
      </div>

      {/* Market Dynamics Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Market Dynamics</h3>
        
        {/* Days to Sell Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Days to Sell (Turnover)</label>
          <input
            type="number"
            name="daysToSell"
            value={product.daysToSell}
            onChange={handleChange}
            min="1"
            max="365"
            placeholder="e.g., 7"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
      </div>
    </div>
  );
};