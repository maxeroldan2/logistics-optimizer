import React, { useState } from 'react';
import { Edit2, Package, BookTemplate as Template } from 'lucide-react';
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
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  
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
  
  const applyTemplate = (templateId: string) => {
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
    
    setTemplateSelectOpen(false);
  };

  const getFilteredTemplates = () => {
    switch (templateFilter) {
      case 'maritime':
        return getContainersByTransportType('maritime');
      case 'air':
        return getContainersByTransportType('air');
      case 'land':
        return getContainersByTransportType('land');
      case 'small':
        return getContainersByCapacity('small');
      case 'medium':
        return getContainersByCapacity('medium');
      case 'large':
        return getContainersByCapacity('large');
      case 'extra-large':
        return getContainersByCapacity('extra-large');
      case 'thermal':
        return getContainersByThermalProtection(true);
      case 'pallet':
        return getPalletCompatibleContainers();
      case 'iata':
        return getComplianceContainers('IATA');
      case 'imo':
        return getComplianceContainers('IMO');
      default:
        return allContainerTemplates;
    }
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
            onClick={() => setTemplateSelectOpen(!templateSelectOpen)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Template className="h-4 w-4 mr-1" />
            <span className="text-sm">Templates</span>
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
      
      {templateSelectOpen && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50 max-h-80 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Select Container Template</h4>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Templates</option>
              <optgroup label="🚢 Transport Type">
                <option value="maritime">Maritime</option>
                <option value="air">Air</option>
                <option value="land">Land</option>
              </optgroup>
              <optgroup label="📏 Capacity">
                <option value="small">Small (&lt;0.05 m³)</option>
                <option value="medium">Medium (0.05-0.5 m³)</option>
                <option value="large">Large (0.5-5 m³)</option>
                <option value="extra-large">Extra Large (&gt;5 m³)</option>
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
          
          <div className="space-y-3">
            {getContainerCategories().map(category => {
              const filteredTemplates = getFilteredTemplates().filter(t => t.category === category);
              if (filteredTemplates.length === 0) return null;
              
              return (
                <div key={category}>
                  <div className="mb-2">
                    <p className="text-xs text-gray-600 font-medium">
                      {categoryDisplayNames[category]}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-1 ml-2">
                    {filteredTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => applyTemplate(template.id)}
                        className="text-left text-sm px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <span className="text-xs mr-2">{template.icon}</span>
                          <span>{template.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {template.maxWeight}kg • ${template.defaultShippingCost}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
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