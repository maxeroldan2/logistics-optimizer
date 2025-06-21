import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, Search, Package, Heart } from 'lucide-react';
import { Container } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { useSavedContainers } from '../../hooks/useSavedContainers';

interface ContainerFormProps {
  container?: Container;
  onAddContainer?: (container: Omit<Container, 'id' | 'products'>) => void;
  onUpdateContainer?: (updates: Partial<Container>) => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

const ContainerForm: React.FC<ContainerFormProps> = ({ 
  container,
  onAddContainer,
  onUpdateContainer,
  onCancel,
  isOpen = false
}) => {
  useAppContext();
  const { savedContainers, savedContainerToContainer, saveContainer } = useSavedContainers();
  
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

  const [showPresets, setShowPresets] = useState(false);
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(formData.icon);
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

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

  // Icon options for container types
  const iconOptions = [
    { value: 'Package', label: 'Container', emoji: '📦' },
    { value: 'Ship', label: 'Ship', emoji: '🚢' },
    { value: 'Plane', label: 'Plane', emoji: '✈️' },
    { value: 'Briefcase', label: 'Luggage', emoji: '🧳' },
    { value: 'Backpack', label: 'Backpack', emoji: '🎒' }
  ];

  // Calculate volume in real-time
  const calculateVolume = () => {
    const volumeInCubicCm = formData.height * formData.width * formData.length;
    const volumeInCubicMeters = volumeInCubicCm / 1000000;
    return volumeInCubicMeters;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const applyPreset = (preset: typeof containerPresets[0]) => {
    setFormData({
      name: preset.name,
      height: preset.height,
      width: preset.width,
      length: preset.length,
      maxWeight: preset.maxWeight,
      shippingCost: preset.shippingCost,
      shippingDuration: preset.shippingDuration,
      icon: 'Package'
    });
    setShowPresets(false);
  };

  const getFilteredPresets = () => {
    if (!presetSearchTerm.trim()) return containerPresets;
    
    return containerPresets.filter(preset => 
      preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
      preset.description.toLowerCase().includes(presetSearchTerm.toLowerCase())
    );
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

  const handleSaveAsPreset = async () => {
    if (!presetName.trim() || !formData.name.trim()) {
      return;
    }

    const containerToSave = {
      ...formData,
      name: presetName,
      icon: selectedIcon,
      id: crypto.randomUUID(), // Temporary ID for the save function
      products: [] // Required for Container type
    } as Container;

    const success = await saveContainer(containerToSave, presetDescription);
    
    if (success) {
      // Reset the save preset form
      setPresetName('');
      setPresetDescription('');
      setShowSaveAsPreset(false);
      // Could show a success message here
    }
  };

  const applySavedContainer = (savedContainer: typeof savedContainers[0]) => {
    const containerData = savedContainerToContainer(savedContainer);
    
    setFormData(prev => ({
      ...prev,
      ...containerData
    }));
    
    setSelectedIcon(containerData.icon || 'Package');
    setShowPresets(false);
    setPresetSearchTerm('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add Container</h2>
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
                    {savedContainers
                      .filter(saved => !presetSearchTerm.trim() || 
                        saved.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
                        (saved.tags || []).some(tag => tag.toLowerCase().includes(presetSearchTerm.toLowerCase()))
                      )
                      .map(saved => (
                        <button
                          key={saved.id}
                          type="button"
                          onClick={() => applySavedContainer(saved)}
                          className="p-4 border border-pink-200 rounded-lg hover:border-pink-300 hover:shadow-md transition-all text-left group bg-pink-25"
                        >
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">{saved.icon}</span>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-pink-600">
                                {saved.name}
                              </h3>
                              <p className="text-sm text-gray-500">{saved.description || 'Custom container'}</p>
                              <p className="text-xs text-gray-400">
                                {saved.height}×{saved.width}×{saved.length}cm, {saved.max_weight}kg
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* System Preset Cards */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">System Presets</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {getFilteredPresets().map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all text-left group"
                    >
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-3">{preset.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                            {preset.name}
                          </h3>
                          <p className="text-sm text-gray-500">{preset.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {getFilteredPresets().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No presets found matching your search.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save as Preset Section */}
        {showSaveAsPreset && (
          <div className="border-b border-gray-200 p-6 bg-pink-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-pink-500" />
              Save as Personal Preset
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Save the current container configuration as a personal preset for future use.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Preset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g., My Standard Box Template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={presetDescription}
                  onChange={(e) => setPresetDescription(e.target.value)}
                  placeholder="Brief description of this container preset..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSaveAsPreset}
                  disabled={!presetName.trim() || !formData.name.trim()}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Save Preset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveAsPreset(false);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Container Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="text-center mb-6">
            <span className="text-gray-500 text-sm uppercase tracking-wider">OR</span>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Define a Custom Container</h3>

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
                onChange={(e) => setSelectedIcon(e.target.value)}
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Capacity & Dimensions */}
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

              {/* Calculated Volume */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <div className="text-sm font-medium text-gray-700 mb-1">Calculated Volume</div>
                <div className="text-2xl font-bold text-blue-600">
                  {calculateVolume().toFixed(2)} m³
                </div>
              </div>
            </div>

            {/* Right Column - Logistics */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Logistics</h4>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Cost (USD) <span className="text-red-500">*</span>
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
              Add Container
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContainerForm;