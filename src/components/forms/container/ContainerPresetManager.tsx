import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, Package, Heart } from 'lucide-react';
import { Container } from '../../../types';
import { useSavedContainers } from '../../../hooks/useSavedContainers';

interface ContainerPresetManagerProps {
  onApplyPreset: (container: Omit<Container, 'id' | 'products'>) => void;
  isFullPage?: boolean;
}

export const ContainerPresetManager: React.FC<ContainerPresetManagerProps> = ({
  onApplyPreset,
  isFullPage = false
}) => {
  const { savedContainers, savedContainerToContainer } = useSavedContainers();
  const [showPresets, setShowPresets] = useState(false);
  const [presetSearchTerm, setPresetSearchTerm] = useState('');

  // Container presets matching the reference image
  const containerPresets = [
    {
      id: 'maritime-40ft',
      name: 'Maritime 40ft HC',
      description: 'Large sea freight',
      icon: '🚢',
      height: 259,
      width: 235,
      length: 1200,
      maxWeight: 26700,
      shippingCost: 2500,
      shippingDuration: 30
    },
    {
      id: 'maritime-20ft',
      name: 'Maritime 20ft',
      description: 'Standard sea freight',
      icon: '🚢',
      height: 239,
      width: 235,
      length: 590,
      maxWeight: 21600,
      shippingCost: 1500,
      shippingDuration: 25
    },
    {
      id: 'air-cargo',
      name: 'Air Cargo (LD3)',
      description: 'Standard air freight',
      icon: '✈️',
      height: 162,
      width: 156,
      length: 201,
      maxWeight: 1588,
      shippingCost: 800,
      shippingDuration: 3
    },
    {
      id: 'checked-luggage',
      name: 'Checked Luggage',
      description: "Traveler's baggage",
      icon: '🧳',
      height: 70,
      width: 50,
      length: 25,
      maxWeight: 23,
      shippingCost: 50,
      shippingDuration: 2
    },
    {
      id: 'carry-on',
      name: 'Carry-on Luggage',
      description: 'Cabin baggage',
      icon: '🎒',
      height: 56,
      width: 35,
      length: 22,
      maxWeight: 7,
      shippingCost: 0,
      shippingDuration: 1
    },
    {
      id: 'large-box',
      name: 'Large Box',
      description: 'Standard parcel',
      icon: '📦',
      height: 50,
      width: 40,
      length: 60,
      maxWeight: 30,
      shippingCost: 25,
      shippingDuration: 5
    }
  ];

  const applyPreset = (preset: typeof containerPresets[0]) => {
    const containerData: Omit<Container, 'id' | 'products'> = {
      name: preset.name,
      height: preset.height,
      width: preset.width,
      length: preset.length,
      maxWeight: preset.maxWeight,
      shippingCost: preset.shippingCost,
      shippingDuration: preset.shippingDuration,
      icon: 'Package'
    };
    
    onApplyPreset(containerData);
    if (!isFullPage) {
      setShowPresets(false);
    }
  };

  const applySavedContainer = (savedContainer: typeof savedContainers[0]) => {
    const containerData = savedContainerToContainer(savedContainer);
    onApplyPreset(containerData);
    if (!isFullPage) {
      setShowPresets(false);
      setPresetSearchTerm('');
    }
  };

  const getFilteredPresets = () => {
    if (!presetSearchTerm.trim()) return containerPresets;
    
    return containerPresets.filter(preset => 
      preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
      preset.description.toLowerCase().includes(presetSearchTerm.toLowerCase())
    );
  };

  const getFilteredSavedContainers = () => {
    if (!presetSearchTerm.trim()) return savedContainers;
    
    return savedContainers.filter(saved => 
      saved.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
      (saved.tags || []).some(tag => tag.toLowerCase().includes(presetSearchTerm.toLowerCase()))
    );
  };

  // If full page mode, always show the presets content
  if (isFullPage) {
    return (
      <div>
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search presets (e.g., 'Maritime', 'Luggage', '20ft')..."
            value={presetSearchTerm}
            onChange={(e) => setPresetSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>

        {/* Saved Containers Section */}
        {savedContainers.length > 0 && (
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Saved Containers
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getFilteredSavedContainers().map(saved => (
                <button
                  key={saved.id}
                  type="button"
                  onClick={() => applySavedContainer(saved)}
                  className="bg-pink-50 border border-pink-200 rounded-lg p-6 hover:shadow-lg hover:border-pink-300 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                      <span className="text-xl">{saved.icon || '📦'}</span>
                    </div>
                    <Heart className="h-5 w-5 text-pink-500" />
                  </div>
                  <h5 className="font-semibold text-gray-900 mb-2">{saved.name}</h5>
                  <p className="text-sm text-gray-600 mb-1">
                    {saved.height}×{saved.width}×{saved.length}cm
                  </p>
                  <p className="text-sm text-gray-600">
                    Max: {saved.maxWeight}kg
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Built-in Presets */}
        <div>
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Built-in Presets</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getFilteredPresets().map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <span className="text-xl">{preset.icon}</span>
                  </div>
                </div>
                <h5 className="font-semibold text-gray-900 mb-2">{preset.name}</h5>
                <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                <p className="text-sm text-gray-600 mb-1">
                  {preset.height}×{preset.width}×{preset.length}cm
                </p>
                <p className="text-sm text-gray-600">
                  Max: {preset.maxWeight}kg • ${preset.shippingCost}
                </p>
              </button>
            ))}
          </div>
        </div>

        {getFilteredPresets().length === 0 && getFilteredSavedContainers().length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No containers found</h3>
            <p className="text-gray-500">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setShowPresets(!showPresets)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <Package className="h-5 w-5 text-blue-600 mr-3" />
          <span className="font-medium text-gray-900">
            {showPresets ? 'Hide Presets' : 'Show Presets'}
          </span>
        </div>
        {showPresets ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>

      {showPresets && (
        <div className="px-6 pb-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search presets (e.g., 'Maritime', 'Luggage', '20ft')..."
              value={presetSearchTerm}
              onChange={(e) => setPresetSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Saved Containers Section */}
          {savedContainers.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Heart className="h-4 w-4 mr-2 text-pink-500" />
                Saved Containers
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {getFilteredSavedContainers().map(saved => (
                  <button
                    key={saved.id}
                    type="button"
                    onClick={() => applySavedContainer(saved)}
                    className="bg-pink-50 border border-pink-200 rounded-lg p-4 hover:shadow-md hover:border-pink-300 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-pink-200 transition-colors">
                        <span className="text-lg">{saved.icon || '📦'}</span>
                      </div>
                      <Heart className="h-4 w-4 text-pink-500" />
                    </div>
                    <h5 className="font-medium text-gray-900 mb-1 text-sm">{saved.name}</h5>
                    <p className="text-xs text-gray-600">
                      {saved.height}×{saved.width}×{saved.length}cm
                    </p>
                    <p className="text-xs text-gray-600">
                      Max: {saved.maxWeight}kg
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Built-in Presets */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Built-in Presets</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {getFilteredPresets().map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <span className="text-lg">{preset.icon}</span>
                    </div>
                  </div>
                  <h5 className="font-medium text-gray-900 mb-1 text-sm">{preset.name}</h5>
                  <p className="text-xs text-gray-600 mb-1">{preset.description}</p>
                  <p className="text-xs text-gray-600">
                    {preset.height}×{preset.width}×{preset.length}cm
                  </p>
                  <p className="text-xs text-gray-600">
                    Max: {preset.maxWeight}kg • ${preset.shippingCost}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {getFilteredPresets().length === 0 && getFilteredSavedContainers().length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No containers found</h3>
              <p className="text-gray-500">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};