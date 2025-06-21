import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Edit2, Copy, Trash2 } from 'lucide-react';
import { Product } from '../../types';
import { useAppContext } from '../../context/AppContext';
import { formatCurrency } from '../../utils/calculations';
import ConfirmDialog from '../common/ConfirmDialog';
import { getIconByName } from '../common/IconSelector';

interface DraggableProductProps {
  product: Product;
  onEdit: (id: string) => void;
  onDuplicate?: (product: Product) => void;
  onDelete: (id: string) => void;
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ 
  product, 
  onEdit, 
  onDuplicate,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useDraggable({
    id: product.id,
    data: {
      type: 'product',
      product,
      containerId: product.containerId,
    },
  });
  
  const { config, currentShipment } = useAppContext();
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 'auto',
  } : undefined;

  const container = currentShipment?.containers.find(c => c.id === product.containerId);
  const ProductIcon = getIconByName(product.icon);
  
  return (
    <>
      <div className="flex items-center gap-2">
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          className={`
            flex-grow p-3 rounded-lg border transition-all duration-200 bg-white
            ${isDragging 
              ? 'border-blue-500 shadow-lg opacity-75 rotate-2 scale-105' 
              : 'border-gray-200 hover:border-blue-300 hover:shadow'
            }
          `}
        >
          <div className="flex items-center space-x-3">
            <button
              ref={setActivatorNodeRef}
              {...listeners}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
              aria-label={`Drag ${product.name}`}
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="flex-shrink-0">
              <ProductIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-grow">
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">
                Qty: {product.quantity} • {formatCurrency(product.resalePrice, config.currency)}
                {container && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                    {container.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 flex gap-1">
          <button
            onClick={() => onDuplicate?.(product)}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-md hover:bg-gray-100"
            title="Duplicate product"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(product.id)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-md hover:bg-gray-100"
            title="Edit product"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-gray-100"
            title="Delete product"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${product.name}"? This action cannot be undone.`}
        onConfirm={() => {
          onDelete(product.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default DraggableProduct;