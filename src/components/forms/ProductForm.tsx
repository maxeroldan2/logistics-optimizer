import React, { useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import { Product } from '../../types';
import Tooltip from '../common/Tooltip';
import { useAppContext } from '../../context/AppContext';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct?: (id: string, updates: Partial<Product>) => void;
  product?: Product;
  onClose?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onAddProduct, 
  onUpdateProduct,
  product: initialProduct,
  onClose 
}) => {
  const { config } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(!initialProduct);
  
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
    isBoxed: initialProduct?.isBoxed || false,
    containerId: initialProduct?.containerId
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
        isBoxed: false
      });
      setIsFormOpen(false);
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
        <button 
          onClick={() => initialProduct ? onClose?.() : setIsFormOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={product.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                       focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter product name"
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
          
          <div className="col-span-2 sm:col-span-1 flex items-center">
            <label className="flex items-center text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                name="isBoxed"
                checked={product.isBoxed}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">
                <Tooltip content="Check if the product is already in its packaging box. If not, we'll calculate additional space for packaging.">
                  Already in Box
                </Tooltip>
              </span>
            </label>
            
            <div className="ml-4">
              <Tooltip content="Add an optional tag to categorize this product">
                <div className="flex items-center text-gray-600 hover:text-blue-500 cursor-pointer">
                  <Tag size={16} />
                  <span className="ml-1 text-sm">Add Tag</span>
                </div>
              </Tooltip>
            </div>
          </div>
          
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
            onClick={() => initialProduct ? onClose?.() : setIsFormOpen(false)}
            className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 
                     shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white 
                     hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent 
                     shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-blue-500"
          >
            {initialProduct ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;