import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Package } from 'lucide-react';
import { Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';

interface DraggableProductProps {
  product: Product;
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ product }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
  });
  
  const { config } = useAppContext();
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border cursor-move transition-all ${
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
  );
};

export default DraggableProduct;