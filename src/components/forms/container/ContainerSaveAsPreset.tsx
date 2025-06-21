import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Container } from '../../../types';
import { useSavedContainers } from '../../../hooks/useSavedContainers';

interface ContainerSaveAsPresetProps {
  isOpen: boolean;
  formData: Omit<Container, 'id' | 'products'>;
  selectedIcon: string;
  onClose: () => void;
}

export const ContainerSaveAsPreset: React.FC<ContainerSaveAsPresetProps> = ({
  isOpen,
  formData,
  selectedIcon,
  onClose
}) => {
  const { saveContainer } = useSavedContainers();
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');

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
      onClose();
      // Could show a success message here
    }
  };

  const handleCancel = () => {
    setPresetName('');
    setPresetDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
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
            placeholder="e.g., My Custom Maritime Container"
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
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};