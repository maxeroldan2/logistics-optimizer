import React, { useState } from 'react';
import { Edit2, Package, BookTemplate as Template } from 'lucide-react';
import { Container } from '../../types';
import Tooltip from '../common/Tooltip';
import { useAppContext } from '../../context/AppContext';
import { allContainerTemplates, getTemplateById } from '../../data/templates';

interface ContainerFormProps {
  container?: Container;
  onAddContainer?: (container: Omit<Container, 'id' | 'products'>) => void;
  onUpdateContainer?: (updates: Partial<Container>) => void;
  onCancel?: () => void;
}

const ContainerForm: React.FC<ContainerFormProps> = ({ 
  container,
  onAddContainer,
  onUpdateContainer,
  onCancel
}) => {
  const { config } = useAppContext();
  const [isEditMode, setIsEditMode] = useState(!container);
  const [templateSelectOpen, setTemplateSelectOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Container, 'id' | 'products'>>({
    name: container?.name || '',
    height: container?.height || 100,
    width: container?.width || 100,
    length: container?.length || 100,
    maxWeight: container?.maxWeight || 100,
    shippingCost: container?.shippingCost || 0,
    shippingDuration: container?.shippingDuration || undefined
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSubmit = () => {
    if (container && onUpdateContainer) {
      onUpdateContainer(formData);
      setIsEditMode(false);
    } else if (onAddContainer) {
      onAddContainer(formData);
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
      shippingDuration: template.defaultShippingDuration
    });
    
    setTemplateSelectOpen(false);
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
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
      
      {templateSelectOpen && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Template</h4>
          <div className="grid grid-cols-2 gap-2">
            {['maritime', 'international', 'personal', 'air'].map(category => (
              <React.Fragment key={category}>
                <div className="col-span-2 mb-1">
                  <p className="text-xs text-gray-500 uppercase">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </p>
                </div>
                {allContainerTemplates
                  .filter(t => t.category === category)
                  .map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template.id)}
                      className="text-left text-sm px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700"
                    >
                      {template.name}
                    </button>
                  ))
                }
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Container Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
            onClick={() => setIsEditMode(false)}
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
          className="inline-flex justify-center py-2 px-4 border border-transparent 
                   shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-blue-500"
        >
          {container ? 'Save Changes' : 'Add Container'}
        </button>
      </div>
    </div>
  );
};

export default ContainerForm;