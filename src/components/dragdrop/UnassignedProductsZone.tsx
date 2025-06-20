import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Product } from '../../types';
import DraggableProduct from '../products/DraggableProduct';

interface UnassignedProductsZoneProps {
  products: Product[];
  onEdit: (productId: string) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const UnassignedProductsZone: React.FC<UnassignedProductsZoneProps> = ({
  products,
  onEdit,
  onDuplicate,
  onDelete
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'unassigned-products',
  });

  const isEmpty = products.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`
        bg-gray-50 rounded-lg p-4 border-2 border-dashed transition-all duration-200 min-h-[120px]
        ${isOver 
          ? 'border-orange-400 bg-orange-50 shadow-md' 
          : 'border-gray-300'
        }
      `}
    >
      <div className="space-y-2">
        {products.map(product => (
          <DraggableProduct
            key={product.id}
            product={product}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
        
        {isEmpty && (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">
              {isOver ? '🎯' : '📦'}
            </div>
            <p className="text-gray-500">
              {isOver 
                ? 'Drop here to unassign from container' 
                : 'All products are assigned to containers'
              }
            </p>
            {isOver && (
              <p className="text-orange-600 text-sm mt-1">
                Release to unassign
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnassignedProductsZone;