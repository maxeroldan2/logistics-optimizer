import React, { useState, useEffect } from 'react';
import { X, Package, Heart } from 'lucide-react';
import { Product } from '../../../types';
import { useAppContext } from '../../../context/AppContext';
import { allProductTemplates } from '../../../data/productTemplates';
import { ProductBasicFields } from './ProductBasicFields';
import { ProductPricingFields } from './ProductPricingFields';
import { ProductIconSelector } from './ProductIconSelector';
import { ProductPresetManager } from './ProductPresetManager';
import { ProductSaveAsPreset } from './ProductSaveAsPreset';

interface ProductFormRefactoredProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  product?: Product;
  onClose?: () => void;
  isOpen?: boolean;
}

export const ProductFormRefactored: React.FC<ProductFormRefactoredProps> = ({ 
  onAddProduct, 
  onUpdateProduct,
  product: initialProduct,
  onClose,
  isOpen = false
}) => {
  const { aiDimensionsEnabled } = useAppContext();
  
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
    isBoxed: false,
    containerId: initialProduct?.containerId,
    icon: initialProduct?.icon || 'Package',
    tag: initialProduct?.tag || ''
  });

  const [selectedIcon, setSelectedIcon] = useState(product.icon);
  const [showPresets, setShowPresets] = useState(false);
  const [showSaveAsPreset, setShowSaveAsPreset] = useState(false);

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
        setSelectedIcon(matchingTemplate.icon);
      }
    }
  };

  const handleProductChange = (field: keyof Omit<Product, 'id'>, value: any) => {
    setProduct(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyPreset = (presetProduct: Omit<Product, 'id'>) => {
    setProduct(presetProduct);
    setSelectedIcon(presetProduct.icon);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product.name.trim()) {
      return;
    }
    
    const productWithIcon = { ...product, icon: selectedIcon };
    
    if (initialProduct && onUpdateProduct) {
      onUpdateProduct(initialProduct.id, productWithIcon);
    } else {
      onAddProduct(productWithIcon);
    }
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {initialProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-gray-600 mt-1">Fill in the details to calculate its viability.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Product Preset Manager Modal */}
        <ProductPresetManager
          isOpen={showPresets}
          onClose={() => setShowPresets(false)}
          onApplyPreset={handleApplyPreset}
        />

        {/* Save as Preset Section */}
        <ProductSaveAsPreset
          isOpen={showSaveAsPreset}
          product={product}
          selectedIcon={selectedIcon}
          onClose={() => setShowSaveAsPreset(false)}
        />

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <ProductBasicFields
                product={product}
                onProductChange={handleProductChange}
                onNameChange={handleNameChange}
              />
              
              {/* Icon Selector */}
              <ProductIconSelector
                selectedIcon={selectedIcon}
                onIconChange={setSelectedIcon}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <ProductPricingFields
                product={product}
                onProductChange={handleProductChange}
              />
            </div>
          </div>
        </form>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="flex items-center px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
          >
            <Package className="h-4 w-4 mr-2" />
            Load Preset
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowSaveAsPreset(!showSaveAsPreset)}
              className="flex items-center px-4 py-3 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors font-medium"
            >
              <Heart className="h-4 w-4 mr-2" />
              Save as Preset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!product.name.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {initialProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};