import React from 'react';
import { Plus } from 'lucide-react';
import { Product, GlobalConfig } from '../../../types';
import { ProductTableHeader } from './ProductTableHeader';
import { DraggableProductRow } from './DraggableProductRow';

interface ProductTableProps {
  products: Product[];
  config: GlobalConfig;
  sortBy: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status' | null;
  sortDirection: 'asc' | 'desc';
  showNewProductForm: boolean;
  onSort: (column: 'name' | 'quantity' | 'profit' | 'efficiency' | 'status') => void;
  onEditProduct: (productId: string) => void;
  onRemoveProduct: (id: string) => void;
  onSaveProduct: (product: Product) => void;
  onAddProduct: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  config,
  sortBy,
  sortDirection,
  showNewProductForm,
  onSort,
  onEditProduct,
  onRemoveProduct,
  onSaveProduct,
  onAddProduct
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <ProductTableHeader
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
      />
      
      <div className="divide-y divide-gray-200">
        {products.map(product => (
          <DraggableProductRow
            key={product.id}
            product={product}
            config={config}
            onEditProduct={onEditProduct}
            onRemoveProduct={onRemoveProduct}
            onSaveProduct={onSaveProduct}
          />
        ))}
        
        {products.length === 0 && !showNewProductForm && (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-500 mb-4">Add your first product to start building your shipment</p>
            <button
              onClick={onAddProduct}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};