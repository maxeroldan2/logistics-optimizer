import React, { useState } from 'react';
import { Edit2, Package, BookTemplate as Template, Search } from 'lucide-react';
import { Container } from '../../types';
import Tooltip from '../common/Tooltip';
import { useAppContext } from '../../context/AppContext';
import { 
  allContainerTemplates, 
  getTemplateById, 
  getContainerCategories,
  categoryDisplayNames,
  getContainersByTransportType,
  getContainersByCapacity,
  getContainersByThermalProtection,
  getPalletCompatibleContainers,
  getComplianceContainers
} from '../../data/templates';
import IconSelector from '../common/IconSelector';

interface ContainerFormProps {
  container?: Container;
  onAddContainer?: (container: Omit<Container, 'id' | 'products'>) => void;
  onUpdateContainer?: (updates: Partial<Container>) => void;
  onCancel?: () => void;
  isOpen?: boolean; // Add this prop to control visibility
}

const ContainerForm: React.FC<ContainerFormProps> = ({ 
  container,
  onAddContainer,
  onUpdateContainer,
  onCancel,
  isOpen = false // Default to false
}) => {
  const { config } = useAppContext();
  const [isEditMode, setIsEditMode] = useState(isOpen || !container);
  const [presetSelectOpen, setPresetSelectOpen] = useState(false);
  const [presetFilter, setPresetFilter] = useState<string>('all');
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Container, 'id' | 'products'>>({
    name: container?.name || '',
    height: container?.height || 100,
    width: container?.width || 100,
    length: container?.length || 100,
    maxWeight: container?.maxWeight || 100,
    shippingCost: container?.shippingCost || 0,
    shippingDuration: container?.shippingDuration || undefined,
    icon: container?.icon || 'Container'
  });

  // Update form visibility when isOpen prop changes
  React.useEffect(() => {
    if (isOpen !== undefined) {
      setIsEditMode(isOpen);
    }
  }, [isOpen]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleIconSelect = (iconName: string) => {
    setFormData(prev => ({
      ...prev,
      icon: iconName
    }));
  };
  
  const handleSubmit = () => {
    if (!formData.name.trim()) {
      return;
    }
    
    if (container && onUpdateContainer) {
      onUpdateContainer(formData);
      setIsEditMode(false);
    } else if (onAddContainer) {
      onAddContainer(formData);
      onCancel?.(); // Call onCancel when adding a new container
    }
  };

  const handleCancel = () => {
    if (container) {
      setIsEditMode(false);
    } else {
      onCancel?.();
    }
  };
  
  const applyPreset = (templateId: string) => {
    const template = getTemplateById(templateId);
    if (!template) return;
    
    setFormData({
      name: template.name,
      height: template.height,
      width: template.width,
      length: template.length,
      maxWeight: template.maxWeight,
      shippingCost: template.defaultShippingCost || 0,
      shippingDuration: template.defaultShippingDuration,
      icon: template.icon || 'Container'
    });
    
    setPresetSelectOpen(false);
    setPresetSearchTerm('');
  };

  const getFilteredPresets = () => {
    let presets = [];
    
    switch (presetFilter) {
      case 'maritime':
        presets = getContainersByTransportType('maritime');
        break;
      case 'air':
        presets = getContainersByTransportType('air');
        break;
      case 'land':
        presets = getContainersByTransportType('land');
        break;
      case 'small':
        presets = getContainersByCapacity('small');
        break;
      case 'medium':
        presets = getContainersByCapacity('medium');
        break;
      case 'large':
        presets = getContainersByCapacity('large');
        break;
      case 'extra-large':
        presets = getContainersByCapacity('extra-large');
        break;
      case 'thermal':
        presets = getContainersByThermalProtection(true);
        break;
      case 'pallet':
        presets = getPalletCompatibleContainers();
        break;
      case 'iata':
        presets = getComplianceContainers('IATA');
        break;
      case 'imo':
        presets = getComplianceContainers('IMO');
        break;
      default:
        presets = allContainerTemplates;
    }

    // Apply search filter
    if (presetSearchTerm.trim()) {
      presets = presets.filter(preset => 
        preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
        preset.category.toLowerCase().includes(presetSearchTerm.toLowerCase())
      );
    }

    return presets;
  };
  
  const getUnitLabel = (type: 'dimension' | 'weight') => {
    if (type === 'dimension') {
      return config.measurement === 'metric' ? 'cm' : 'in';
    } else {
      return config.measurement === 'metric' ? 'kg' : 'lb';
    }
  };
  
  if (container && !isEditMode) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Package className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">{container.name}</h3>
          </div>
          <button 
            onClick={() => setIsEditMode(true)}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <Edit2 size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Dimensions</p>
            <p className="text-base">
              {container.height} × {container.width} × {container.length} {getUnitLabel('dimension')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Weight</p>
            <p className="text-base">{container.maxWeight} {getUnitLabel('weight')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Shipping Cost</p>
            <p className="text-base">{config.currency} {container.shippingCost}</p>
          </div>
          {container.shippingDuration && (
            <div>
              <p className="text-sm text-gray-500">Est. Duration</p>
              <p className="text-base">{container.shippingDuration} days</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {container ? 'Edit Container' : 'Add Container'}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPresetSelectOpen(!presetSelectOpen)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Template className="h-4 w-4 mr-1" />
            <span className="text-sm">Presets</span>
          </button>
          {onCancel && (
            <button 
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {presetSelectOpen && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Select Container Preset</h4>
            <select
              value={presetFilter}
              onChange={(e) => setPresetFilter(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Presets</option>
              <optgroup label="🚢 Transport Type">
                <option value="maritime">Maritime</option>
                <option value="air">Air</option>
                <option value="land">Land</option>
              </optgroup>
              <optgroup label="📏 Capacity">
                <option value="small">Small (<0.05 m³)</option>
                <option value="medium">Medium (0.05-0.5 m³)</option>
                <option value="large">Large (0.5-5 m³)</option>
                <option value="extra-large">Extra Large (>5 m³)</option>
              </optgroup>
              <optgroup label="🌡️ Special Features">
                <option value="thermal">Thermal Protection</option>
                <option value="pallet">Pallet Compatible</option>
              </optgroup>
              <optgroup label="📋 Compliance">
                <option value="iata">IATA Compliant</option>
                <option value="imo">IMO Compliant</option>
              </optgroup>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search presets..."
              value={presetSearchTerm}
              onChange={(e) => setPresetSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-3">
            {getContainerCategories().map(category => {
              const filteredPresets = getFilteredPresets().filter(t => t.category === category);
              if (filteredPresets.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 font-medium">
                      {categoryDisplayNames[category]}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 ml-2">
                    {filteredPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => applyPreset(preset.id)}
                        className="text-left text-sm px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="text-xs mr-2">{preset.icon}</span>
                          <span>{preset.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {preset.maxWeight}kg • ${preset.defaultShippingCost}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {getFilteredPresets().length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No presets found matching your search.
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Container Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter container name"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tooltip content="Choose an icon to represent this container">
              Container Icon
            </Tooltip>
          </label>
          <IconSelector
            selectedIcon={formData.icon}
            onIconSelect={handleIconSelect}
            placeholder="Select container icon"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Height of the container">
              Height ({getUnitLabel('dimension')})
            </Tooltip>
          </label>
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Width of the container">
              Width ({getUnitLabel('dimension')})
            </Tooltip>
          </label>
          <input
            type="number"
            name="width"
            value={formData.width}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Length of the container">
              Length ({getUnitLabel('dimension')})
            </Tooltip>
          </label>
          <input
            type="number"
            name="length"
            value={formData.length}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Maximum weight the container can hold">
              Max Weight ({getUnitLabel('weight')})
            </Tooltip>
          </label>
          <input
            type="number"
            name="maxWeight"
            value={formData.maxWeight}
            onChange={handleChange}
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Cost of shipping this container">
              Shipping Cost ({config.currency})
            </Tooltip>
          </label>
          <input
            type="number"
            name="shippingCost"
            value={formData.shippingCost}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            <Tooltip content="Estimated shipping duration (does not affect calculations)">
              Est. Duration (days)
            </Tooltip>
          </label>
          <input
            type="number"
            name="shippingDuration"
            value={formData.shippingDuration || 0}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        {container && (
          <button
            onClick={handleCancel}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!formData.name.trim()}
          className="inline-flex justify-center py-2 px-4 border border-transparent 
                   shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {container ? 'Save Changes' : 'Add Container'}
        </button>
      </div>
    </div>
  );
};

export default ContainerForm;