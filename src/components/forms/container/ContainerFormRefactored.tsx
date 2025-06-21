import React, { useState, useEffect } from 'react';
import { X, Package, ChevronDown, Calculator, ArrowLeft, Star } from 'lucide-react';
import { Container } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { ContainerBasicFields } from './ContainerBasicFields';
import { ContainerShippingFields } from './ContainerShippingFields';
import { ContainerPresetManager } from './ContainerPresetManager';
import { useSavedContainers } from '../../../hooks/useSavedContainers';

interface ContainerFormRefactoredProps {
  container?: Container;
  onAddContainer?: (container: Omit<Container, 'id' | 'products'>) => void;
  onUpdateContainer?: (updates: Partial<Container>) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

export const ContainerFormRefactored: React.FC<ContainerFormRefactoredProps> = ({ 
  container,
  onAddContainer,
  onUpdateContainer,
  onCancel,
  isOpen = false
}) => {
  useAppContext();
  const { saveContainer, savedContainers } = useSavedContainers();
  
  const [formData, setFormData] = useState<Omit<Container, 'id' | 'products'>>({
    name: container?.name || '',
    height: container?.height || 100,
    width: container?.width || 100,
    length: container?.length || 100,
    maxWeight: container?.maxWeight || 100,
    shippingCost: container?.shippingCost || 0,
    shippingDuration: container?.shippingDuration || 30,
    icon: container?.icon || 'Package'
  });

  const [selectedIcon, setSelectedIcon] = useState(formData.icon);
  const [calculatedVolume, setCalculatedVolume] = useState(0);
  const [currentView, setCurrentView] = useState<'form' | 'presets'>('form');
  const [isPresetSaved, setIsPresetSaved] = useState(false);
  const [lastSavedFormData, setLastSavedFormData] = useState<string>('');

  useEffect(() => {
    // Calculate volume in cubic meters
    const volumeInCm = formData.height * formData.width * formData.length;
    const volumeInM = volumeInCm / 1000000; // Convert from cm³ to m³
    setCalculatedVolume(volumeInM);
  }, [formData.height, formData.width, formData.length]);

  useEffect(() => {
    // Check if form data has changed since last save
    const currentFormDataString = JSON.stringify({ ...formData, icon: selectedIcon });
    if (currentFormDataString !== lastSavedFormData) {
      setIsPresetSaved(false);
    }
  }, [formData, selectedIcon, lastSavedFormData]);

  const handleFormDataChange = (field: keyof Omit<Container, 'id' | 'products'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (presetData: Omit<Container, 'id' | 'products'>) => {
    setFormData(presetData);
    setSelectedIcon(presetData.icon);
    setCurrentView('form'); // Go back to form after applying preset
  };

  const checkForDuplicatePreset = () => {
    return savedContainers.some(saved => 
      saved.height === formData.height &&
      saved.width === formData.width &&
      saved.length === formData.length &&
      saved.maxWeight === formData.maxWeight &&
      saved.shippingCost === formData.shippingCost &&
      saved.shippingDuration === formData.shippingDuration
    );
  };

  const handleSaveAsPreset = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a container name before saving as preset.');
      return;
    }

    // Check for duplicate
    if (checkForDuplicatePreset()) {
      alert('A preset with identical values already exists in the database.');
      return;
    }

    const containerToSave = {
      ...formData,
      name: `${formData.name} Preset`,
      icon: selectedIcon,
      id: crypto.randomUUID(),
      products: []
    } as Container;

    const success = await saveContainer(containerToSave, 'Auto-saved preset');
    
    if (success) {
      setIsPresetSaved(true);
      setLastSavedFormData(JSON.stringify({ ...formData, icon: selectedIcon }));
      // Optional: Show success message
    } else {
      alert('Failed to save preset. Please try again.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return;
    }
    
    const containerWithIcon = { ...formData, icon: selectedIcon };
    
    if (container && onUpdateContainer) {
      onUpdateContainer(containerWithIcon);
    } else if (onAddContainer) {
      onAddContainer(containerWithIcon);
    }
    onCancel?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            {currentView === 'presets' && (
              <button
                type="button"
                onClick={() => setCurrentView('form')}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {currentView === 'presets' 
                  ? 'Load Preset' 
                  : (container ? 'Edit Container' : 'Add New Container')
                }
              </h2>
              <p className="text-gray-600 mt-1">
                {currentView === 'presets' 
                  ? 'Choose from saved containers or built-in presets.'
                  : 'Define the space you\'ll be shipping with.'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {currentView === 'presets' ? (
          <div className="p-6">
            <ContainerPresetManager onApplyPreset={handleApplyPreset} isFullPage={true} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Container Name */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Container Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleFormDataChange('name', e.target.value)}
                    placeholder="e.g., Contenedor 40ft HC"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="col-span-4">
                  <label className="block text-sm font-medium text-gray-900 mb-2">Icon</label>
                  <div className="relative">
                    <select
                      value={selectedIcon}
                      onChange={(e) => setSelectedIcon(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    >
                      <option value="Package">📦 Container</option>
                      <option value="Ship">🚢 Ship</option>
                      <option value="Plane">✈️ Plane</option>
                      <option value="Briefcase">🧳 Luggage</option>
                      <option value="Backpack">🎒 Backpack</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Capacity & Dimensions */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Capacity & Dimensions</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleFormDataChange('height', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Width (cm)</label>
                    <input
                      type="number"
                      value={formData.width || ''}
                      onChange={(e) => handleFormDataChange('width', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length (cm)</label>
                    <input
                      type="number"
                      value={formData.length || ''}
                      onChange={(e) => handleFormDataChange('length', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.maxWeight || ''}
                      onChange={(e) => handleFormDataChange('maxWeight', Number(e.target.value))}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Logistics & Timing */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Logistics & Timing</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Cost (USD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.shippingCost || ''}
                      onChange={(e) => handleFormDataChange('shippingCost', Number(e.target.value))}
                      placeholder="e.g., 2500.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Est. Duration (days)</label>
                    <input
                      type="number"
                      value={formData.shippingDuration || ''}
                      onChange={(e) => handleFormDataChange('shippingDuration', Number(e.target.value))}
                      placeholder="e.g., 30"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Calculated Volume Card */}
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center mb-2">
                  <Calculator className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-blue-700">Calculated Volume</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {calculatedVolume.toFixed(2)} m³
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={() => setCurrentView('presets')}
              className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
            >
              <Package className="h-4 w-4 mr-2" />
              Load Preset
            </button>

            <button 
              type="button"
              onClick={handleSaveAsPreset}
              disabled={isPresetSaved || !formData.name.trim()}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors border ${
                isPresetSaved 
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-yellow-700 hover:bg-yellow-50 border-yellow-200 hover:border-yellow-300'
              }`}
            >
              <Star className={`h-4 w-4 mr-2 ${isPresetSaved ? 'text-gray-400' : 'text-yellow-600'}`} />
              {isPresetSaved ? 'Preset Saved' : 'Save as Preset'}
            </button>

            <button
              type="submit"
              disabled={!formData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {container ? 'Update Container' : 'Add Container'}
            </button>
          </div>

          </form>
        )}
      </div>
    </div>
  );
};