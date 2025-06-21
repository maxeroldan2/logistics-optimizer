import React from 'react';
import { Container } from '../../../types';

interface ContainerBasicFieldsProps {
  formData: Omit<Container, 'id' | 'products'>;
  onFormDataChange: (field: keyof Omit<Container, 'id' | 'products'>, value: any) => void;
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}

export const ContainerBasicFields: React.FC<ContainerBasicFieldsProps> = ({
  formData,
  onFormDataChange,
  selectedIcon,
  onIconChange
}) => {
  // Icon options for container types
  const iconOptions = [
    { value: 'Package', label: 'Container', emoji: '📦' },
    { value: 'Ship', label: 'Ship', emoji: '🚢' },
    { value: 'Plane', label: 'Plane', emoji: '✈️' },
    { value: 'Briefcase', label: 'Luggage', emoji: '🧳' },
    { value: 'Backpack', label: 'Backpack', emoji: '🎒' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    onFormDataChange(name as keyof Omit<Container, 'id' | 'products'>, type === 'number' ? Number(value) : value);
  };

  // Calculate volume in real-time
  const calculateVolume = () => {
    const volumeInCubicCm = formData.height * formData.width * formData.length;
    const volumeInCubicMeters = volumeInCubicCm / 1000000;
    return volumeInCubicMeters;
  };

  return (
    <div>
      {/* Container Name and Icon */}
      <div className="grid grid-cols-12 gap-4 mb-6">
        <div className="col-span-8">
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Container Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., My Custom Box"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div className="col-span-4">
          <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
          <select
            value={selectedIcon}
            onChange={(e) => onIconChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {iconOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.emoji} {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Capacity & Dimensions */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4">Capacity & Dimensions</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
            <input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
            <input
              type="number"
              name="width"
              value={formData.width}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
            <input
              type="number"
              name="length"
              value={formData.length}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Weight (kg)</label>
            <input
              type="number"
              name="maxWeight"
              value={formData.maxWeight}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Volume Display */}
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-700 mb-1">Total Volume</div>
          <div className="text-xl font-bold text-blue-600">{calculateVolume().toFixed(3)} m³</div>
        </div>
      </div>
    </div>
  );
};