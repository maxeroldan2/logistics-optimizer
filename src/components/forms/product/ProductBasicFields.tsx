import React from 'react';
import { Product } from '../../../types';

interface ProductBasicFieldsProps {
  product: Omit<Product, 'id'>;
  onProductChange: (field: keyof Omit<Product, 'id'>, value: any) => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProductBasicFields: React.FC<ProductBasicFieldsProps> = ({
  product,
  onProductChange,
  onNameChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onProductChange(name as keyof Omit<Product, 'id'>, e.target.type === 'number' ? Number(value) : value);
  };

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={onNameChange}
          placeholder="e.g., iPhone 15 Pro, 256GB"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={product.quantity}
          onChange={handleChange}
          min="1"
          placeholder="1"
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      {/* Physical Attributes Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Physical Attributes</h3>
        
        {/* Dimensions Grid - 2x2 layout */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={product.height || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="0"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                product.isBoxed 
                  ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {product.isBoxed && (
              <div className="text-xs text-blue-600 mt-1">📦 Includes packaging</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
            <input
              type="number"
              name="width"
              value={product.width || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="0"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                product.isBoxed 
                  ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
            <input
              type="number"
              name="length"
              value={product.length || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="0"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                product.isBoxed 
                  ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={product.weight || ''}
              onChange={handleChange}
              min="0"
              step="0.1"
              placeholder="0"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-base ${
                product.isBoxed 
                  ? 'border-blue-300 bg-blue-50 focus:ring-blue-500 focus:border-blue-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {product.isBoxed && (
              <div className="text-xs text-blue-600 mt-1">📦 Includes packaging weight</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};