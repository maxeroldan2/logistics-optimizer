import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Package, Edit2 } from 'lucide-react';
import { Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface DraggableProductProps {
  product: Product;
  onEdit: (id: string) => void;
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ product, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
  });
  
  const { config } = useAppContext();
  
  return (
    <div className="flex items-center gap-2">
      <div
        ref={setNodeRef}
        style={{
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          position: 'relative',
          touchAction: 'none',
          zIndex: isDragging ? 999 : undefined
        }}
        {...listeners}
        {...attributes}
        className={`flex-1 p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
          isDragging 
            ? 'border-blue-500 shadow-lg bg-blue-50' 
            : 'border-gray-200 hover:border-blue-300 hover:shadow'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-grow">
            <div className="font-medium text-gray-900">{product.name}</div>
            <div className="text-sm text-gray-500">
              Qty: {product.quantity} • {formatCurrency(product.resalePrice, config.currency)}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => onEdit(product.id)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors"
        title="Edit product"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DraggableProduct;