import React from 'react';
import { Container } from '../../../types';

interface ContainerShippingFieldsProps {
  formData: Omit<Container, 'id' | 'products'>;
  onFormDataChange: (field: keyof Omit<Container, 'id' | 'products'>, value: any) => void;
}

export const ContainerShippingFields: React.FC<ContainerShippingFieldsProps> = ({
  formData,
  onFormDataChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onFormDataChange(name as keyof Omit<Container, 'id' | 'products'>, type === 'number' ? Number(value) : value);
  };

  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-4">Shipping & Costs</h4>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total Shipping Cost (USD) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          name="shippingCost"
          value={formData.shippingCost}
          onChange={handleChange}
          min="0"
          step="0.01"
          placeholder="Enter total cost"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Est. Duration (days)</label>
        <input
          type="number"
          name="shippingDuration"
          value={formData.shippingDuration}
          onChange={handleChange}
          min="1"
          placeholder="e.g., 30"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};