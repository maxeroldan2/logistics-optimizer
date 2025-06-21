import React, { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { Container } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { ContainerBasicFields } from './ContainerBasicFields';
import { ContainerShippingFields } from './ContainerShippingFields';
import { ContainerPresetManager } from './ContainerPresetManager';
import { ContainerSaveAsPreset } from './ContainerSaveAsPreset';

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
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);

  const handleFormDataChange = (field: keyof Omit<Container, 'id' | 'products'>, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (presetData: Omit<Container, 'id' | 'products'>) => {
    setFormData(presetData);
    setSelectedIcon(presetData.icon);
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
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {container ? 'Edit Container' : 'Add Container'}
            </h2>
            <p className="text-gray-600 mt-1">Start with a preset or define a custom container for your shipment.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              type="button"
              onClick={() => setShowSaveAsPreset(!showSaveAsPreset)}
              className="flex items-center px-3 py-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save as Preset
            </button>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Presets Section */}
        <ContainerPresetManager onApplyPreset={handleApplyPreset} />

        {/* Save as Preset Section */}
        <ContainerSaveAsPreset
          isOpen={showSaveAsPreset}
          formData={formData}
          selectedIcon={selectedIcon}
          onClose={() => setShowSaveAsPreset(false)}
        />

        {/* Custom Container Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center mb-6">
            <span className="text-gray-500 text-sm uppercase tracking-wider">OR</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Define a Custom Container</h3>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Basic Fields */}
            <div>
              <ContainerBasicFields
                formData={formData}
                onFormDataChange={handleFormDataChange}
                selectedIcon={selectedIcon}
                onIconChange={setSelectedIcon}
              />
            </div>

            {/* Right Column - Shipping Fields */}
            <div>
              <ContainerShippingFields
                formData={formData}
                onFormDataChange={handleFormDataChange}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
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
      </div>
    </div>
  );
};