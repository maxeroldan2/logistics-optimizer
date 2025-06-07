import React, { useState } from 'react';
import { Plus, Tag, X, BookTemplate as Template, Brain, Search } from 'lucide-react';
import { Product } from '../../types';
import Tooltip from '../common/Tooltip';
import { useAppContext } from '../../context/AppContext';
import IconSelector from '../common/IconSelector';
import { 
  allProductTemplates, 
  getProductTemplateById, 
  getProductCategories,
  categoryDisplayNames 
} from '../../data/productTemplates';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  product?: Product;
  onClose?: () => void;
  isOpen?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onAddProduct, 
  onUpdateProduct,
  product: initialProduct,
  onClose,
  isOpen = false
}) => {
  const { config, aiDimensionsEnabled } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(isOpen || !initialProduct);
  const [presetSelectOpen, setPresetSelectOpen] = useState(false);
  const [presetSearchTerm, setPresetSearchTerm] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  const [product, setProduct] = useState<Omit<Product, 'id'>>({
    name: initialProduct?.name || '',
    height: initialProduct?.height || 0,
    width: initialProduct?.width || 0,
    length: initialProduct?.length || 0,
    weight: initialProduct?.weight || 0,
    purchasePrice: initialProduct?.purchasePrice || 0,
    resalePrice: initialProduct?.resalePrice || 0,
    daysToSell: initialProduct?.daysToSell || 7,
    quantity: initialProduct?.quantity || 1,
    isBoxed: false, // Always false now
    containerId: initialProduct?.containerId,
    icon: initialProduct?.icon || 'Package',
    tag: initialProduct?.tag || ''
  });

  // Update form visibility when isOpen prop changes
  React.useEffect(() => {
    if (isOpen !== undefined) {
      setIsFormOpen(isOpen);
    }
  }, [isOpen]);

  // AI Dimension autocompletion
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProduct(prev => ({ ...prev, name }));

    // If AI dimensions is enabled, try to auto-fill dimensions
    if (aiDimensionsEnabled && name.length > 3) {
      const matchingTemplate = allProductTemplates.find(template => 
        template.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(template.name.toLowerCase().split(' ')[0])
      );

      if (matchingTemplate && product.height === 0) {
        setProduct(prev => ({
          ...prev,
          height: matchingTemplate.height,
          width: matchingTemplate.width,
          length: matchingTemplate.length,
          weight: matchingTemplate.weight,
          purchasePrice: matchingTemplate.estimatedPurchasePrice,
          resalePrice: matchingTemplate.estimatedResalePrice,
          daysToSell: matchingTemplate.estimatedDaysToSell,
          icon: matchingTemplate.icon
        }));
      }
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleIconSelect = (iconName: string) => {
    setProduct(prev => ({
      ...prev,
      icon: iconName
    }));
  };

  const applyPreset = (templateId: string) => {
    const template = getProductTemplateById(templateId);
    if (!template) return;
    
    setProduct(prev => ({
      ...prev,
      name: template.name,
      height: template.height,
      width: template.width,
      length: template.length,
      weight: template.weight,
      purchasePrice: template.estimatedPurchasePrice,
      resalePrice: template.estimatedResalePrice,
      daysToSell: template.estimatedDaysToSell,
      isBoxed: false, // Always false now
      icon: template.icon
    }));
    
    setPresetSelectOpen(false);
    setPresetSearchTerm('');
  };

  const getFilteredPresets = () => {
    let presets = allProductTemplates;

    // Apply search filter
    if (presetSearchTerm.trim()) {
      presets = presets.filter(preset => 
        preset.name.toLowerCase().includes(presetSearchTerm.toLowerCase()) ||
        preset.category.toLowerCase().includes(presetSearchTerm.toLowerCase())
      );
    }

    return presets;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name.trim()) {
      return;
    }
    
    if (initialProduct && onUpdateProduct) {
      onUpdateProduct(initialProduct.id, product);
      onClose?.();
    } else {
      onAddProduct(product);
      setProduct({
        name: '',
        height: 0,
        width: 0,
        length: 0,
        weight: 0,
        purchasePrice: 0,
        resalePrice: 0,
        daysToSell: 7,
        quantity: 1,
        isBoxed: false,
        icon: 'Package',
        tag: ''
      });
      setIsFormOpen(false);
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (initialProduct) {
      onClose?.();
    } else {
      setIsFormOpen(false);
      onClose?.();
    }
  };
  
  const getUnitLabel = (type: 'dimension' | 'weight') => {
    if (type === 'dimension') {
      return config.measurement === 'metric' ? 'cm' : 'in';
    } else {
      return config.measurement === 'metric' ? 'kg' : 'lb';
    }
  };
  
  if (!isFormOpen && !initialProduct) {
    return (
      <button
        onClick={() => setIsFormOpen(true)}
        className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg 
                   text-gray-500 hover:text-blue-600 hover:border-blue-400 
                   flex items-center justify-center transition-colors"
      >
        <Plus className="mr-2" />
        Add Product
      </button>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {initialProduct ? 'Edit Product' : 'Add New Product'}
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setPresetSelectOpen(!presetSelectOpen)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Template className="h-4 w-4 mr-1" />
            <span className="text-sm">Presets</span>
          </button>
          {aiDimensionsEnabled && (
            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
              <Brain className="h-3 w-3 mr-1" />
              AI Active
            </span>
          )}
          <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {presetSelectOpen && (
        <div className="mb-4 p-3 border rounded-md bg-gray-50 max-h-64 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select Product Preset</h4>
          
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
            {getProductCategories().map(category => {
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
                        className="text-left text-sm px-2 py-1 rounded hover:bg-blue-50 hover:text-blue-700 flex items-center"
                      >
                        <span className="text-xs mr-2">{preset.icon}</span>
                        <span>{preset.name}</span>
                        <span className="ml-auto text-xs text-gray-500">
                          ${preset.estimatedPurchasePrice} → ${preset.estimatedResalePrice}
                        </span>
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
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
              {aiDimensionsEnabled && (
                <span className="ml-2 text-xs text-purple-600">(AI will auto-complete dimensions)</span>
              )}
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleNameChange}
              required
              placeholder="Enter product name"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tooltip content="Choose an icon to represent this product">
                Product Icon
              </Tooltip>
            </label>
            <IconSelector
              selectedIcon={product.icon}
              onIconSelect={handleIconSelect}
              placeholder="Select product icon"
            />
          </div>
          
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="How many units of this product are you shipping?">
                Quantity
              </Tooltip>
            </label>
            <input
              type="number"
              name="quantity"
              value={product.quantity}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="col-span-2 sm:col-span-1 flex items-center justify-between">
            <div className="flex items-center">
              <Tooltip content="Add an optional tag to categorize this product">
                <button
                  type="button"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="flex items-center text-gray-600 hover:text-blue-500 cursor-pointer transition-colors"
                >
                  <Tag size={16} />
                  <span className="ml-1 text-sm">
                    {product.tag ? `Tag: ${product.tag}` : 'Add Tag'}
                  </span>
                </button>
              </Tooltip>
            </div>
          </div>

          {showTagInput && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Product Tag
              </label>
              <div className="mt-1 flex">
                <input
                  type="text"
                  name="tag"
                  value={product.tag}
                  onChange={handleChange}
                  placeholder="Enter a tag (e.g., electronics, clothing)"
                  className="block w-full rounded-l-md border-gray-300 shadow-sm 
                           focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowTagInput(false);
                    setProduct(prev => ({ ...prev, tag: '' }));
                  }}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 
                           bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="Height of the product">
                Height ({getUnitLabel('dimension')})
              </Tooltip>
            </label>
            <input
              type="number"
              name="height"
              value={product.height}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="Width of the product">
                Width ({getUnitLabel('dimension')})
              </Tooltip>
            </label>
            <input
              type="number"
              name="width"
              value={product.width}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="Length of the product">
                Length ({getUnitLabel('dimension')})
              </Tooltip>
            </label>
            <input
              type="number"
              name="length"
              value={product.length}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="Weight of a single unit">
                Weight ({getUnitLabel('weight')})
              </Tooltip>
            </label>
            <input
              type="number"
              name="weight"
              value={product.weight}
              onChange={handleChange}
              min="0"
              step="0.1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="How much you pay for each unit">
                Purchase Price ({config.currency})
              </Tooltip>
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={product.purchasePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="How much you can sell each unit for">
                Resale Price ({config.currency})
              </Tooltip>
            </label>
            <input
              type="number"
              name="resalePrice"
              value={product.resalePrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              <Tooltip content="Estimated number of days to sell all units">
                Days to Sell
              </Tooltip>
            </label>
            <input
              type="number"
              name="daysToSell"
              value={product.daysToSell}
              onChange={handleChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <div className="mt-1 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    product.daysToSell <= 7 ? 'bg-green-500' : 
                    product.daysToSell <= 14 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`} 
                  style={{ width: `${Math.min(100, (product.daysToSell / 30) * 100)}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs text-gray-500">
                {product.daysToSell <= 7 ? 'Fast' : 
                 product.daysToSell <= 14 ? 'Medium' : 
                 'Slow'} turnover
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!product.name.trim()}
            className="inline-flex justify-center py-2 px-4 border border-transparent 
                     shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {initialProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;