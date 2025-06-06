import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Package, Edit2, Copy, Trash2 } from 'lucide-react';
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
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: product.id,
  });
  
  const { config, currentShipment } = useAppContext();
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
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
          {...listeners}
          className="flex-grow p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow cursor-move bg-white"
        >
          <div className="flex items-center space-x-3">
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